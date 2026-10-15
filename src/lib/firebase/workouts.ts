/**
 * Firestore access for workout sets.
 *
 * Data model: users/{uid}/workouts/{workoutId}
 *
 * Scoping documents under the owner's uid means the security rules in
 * firestore.rules stay a two-line ownership check rather than a per-field
 * audit. See firestore.rules.
 */
import {
	addDoc,
	collection,
	deleteDoc,
	doc,
	limit,
	onSnapshot,
	orderBy,
	query,
	serverTimestamp,
	Timestamp,
	where,
	type QuerySnapshot
} from 'firebase/firestore';

import { getFirebase } from './client';

export type Workout = {
	id: string;
	exercise: string;
	weight: number;
	reps: number;
	/**
	 * When the set was performed — what the UI shows and sorts by. Sets saved
	 * before `performedAt` existed fall back to `createdAt`.
	 */
	date: Date | null;
	/** Null for a moment on the writing client, until the server timestamp lands. */
	createdAt: Date | null;
};

export type NewWorkout = Pick<Workout, 'exercise' | 'weight' | 'reps'> & {
	/** Client-chosen, so a set can be logged for an earlier day. */
	performedAt: Date;
};

function workoutsCollection(uid: string) {
	const { db } = getFirebase();
	return collection(db, 'users', uid, 'workouts');
}

/**
 * Subscribe to a user's most recent workouts.
 *
 * Fires immediately from the local cache (including offline), then again with
 * server data. Returns the unsubscribe function — call it on teardown.
 */
export function subscribeToWorkouts(
	uid: string,
	onChange: (workouts: Workout[]) => void,
	onError: (error: Error) => void
): () => void {
	const q = query(workoutsCollection(uid), orderBy('createdAt', 'desc'), limit(50));

	return onSnapshot(
		q,
		// Ordered by entry time so the 50 most recently *logged* sets are fetched,
		// then shown by training date so a backdated set slots into place.
		(snapshot) => onChange(toWorkouts(snapshot).sort((a, b) => time(b) - time(a))),
		onError
	);
}

export type HistoryWindow = {
	/** Loaded sets, oldest first by training date. */
	workouts: Workout[];
	/**
	 * Training days starting before this instant may be missing sets that
	 * haven't been loaded yet; null means everything is loaded.
	 */
	completeFrom: Date | null;
};

/**
 * Subscribe to the `max` most recently entered sets, for the History tab.
 *
 * Paging is by entry time (`createdAt`), because older documents have no
 * `performedAt` to range over. That makes the oldest loaded training days
 * possibly incomplete — but only by a bounded amount: the rules cap
 * `performedAt` at `createdAt` + 1 day, so any set not yet loaded was
 * performed before (oldest loaded `createdAt` + 1 day). `completeFrom` is
 * that bound; callers hide days before it until more is loaded.
 */
export function subscribeToHistory(
	uid: string,
	max: number,
	onChange: (window: HistoryWindow) => void,
	onError: (error: Error) => void
): () => void {
	const q = query(workoutsCollection(uid), orderBy('createdAt', 'desc'), limit(max));

	return onSnapshot(
		q,
		(snapshot) => {
			const workouts = toWorkouts(snapshot);
			let completeFrom: Date | null = null;
			if (snapshot.size >= max) {
				const oldest = Math.min(...workouts.map((w) => w.createdAt?.getTime() ?? Date.now()));
				completeFrom = new Date(oldest + 86_400_000);
			}
			workouts.sort((a, b) => time(a) - time(b));
			onChange({ workouts, completeFrom });
		},
		onError
	);
}

/**
 * Subscribe to every set of one exercise, oldest first.
 *
 * Sorted on the client rather than with `orderBy('createdAt')`: equality on
 * one field plus ordering on another needs a composite index, and one user's
 * sets for one exercise are few enough to sort in memory.
 */
export function subscribeToExerciseHistory(
	uid: string,
	exercise: string,
	onChange: (workouts: Workout[]) => void,
	onError: (error: Error) => void
): () => void {
	const q = query(workoutsCollection(uid), where('exercise', '==', exercise));

	return onSnapshot(
		q,
		(snapshot) => {
			onChange(toWorkouts(snapshot).sort((a, b) => time(a) - time(b)));
		},
		onError
	);
}

/** Sort key. A set still waiting for its server timestamp counts as newest. */
function time(w: Workout): number {
	return w.date?.getTime() ?? Infinity;
}

function toDate(value: unknown): Date | null {
	return value instanceof Timestamp ? value.toDate() : null;
}

function toWorkouts(snapshot: QuerySnapshot): Workout[] {
	return snapshot.docs.map((d) => {
		const data = d.data();
		const createdAt = toDate(data.createdAt);
		return {
			id: d.id,
			exercise: data.exercise ?? '',
			weight: data.weight ?? 0,
			reps: data.reps ?? 0,
			date: toDate(data.performedAt) ?? createdAt,
			createdAt
		};
	});
}

export async function addWorkout(uid: string, workout: NewWorkout): Promise<void> {
	await addDoc(workoutsCollection(uid), {
		...workout,
		performedAt: Timestamp.fromDate(workout.performedAt),
		createdAt: serverTimestamp()
	});
}

export async function deleteWorkout(uid: string, workoutId: string): Promise<void> {
	const { db } = getFirebase();
	await deleteDoc(doc(db, 'users', uid, 'workouts', workoutId));
}
