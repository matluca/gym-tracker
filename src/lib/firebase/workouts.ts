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
	Timestamp
} from 'firebase/firestore';

import { getFirebase } from './client';

export type Workout = {
	id: string;
	exercise: string;
	weight: number;
	reps: number;
	/** Null for a moment on the writing client, until the server timestamp lands. */
	createdAt: Date | null;
};

export type NewWorkout = Pick<Workout, 'exercise' | 'weight' | 'reps'>;

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
		(snapshot) => {
			onChange(
				snapshot.docs.map((d) => {
					const data = d.data();
					const createdAt = data.createdAt;
					return {
						id: d.id,
						exercise: data.exercise ?? '',
						weight: data.weight ?? 0,
						reps: data.reps ?? 0,
						createdAt: createdAt instanceof Timestamp ? createdAt.toDate() : null
					};
				})
			);
		},
		onError
	);
}

export async function addWorkout(uid: string, workout: NewWorkout): Promise<void> {
	await addDoc(workoutsCollection(uid), {
		...workout,
		createdAt: serverTimestamp()
	});
}

export async function deleteWorkout(uid: string, workoutId: string): Promise<void> {
	const { db } = getFirebase();
	await deleteDoc(doc(db, 'users', uid, 'workouts', workoutId));
}
