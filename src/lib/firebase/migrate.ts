/**
 * Copy an anonymous user's data into the account they sign in to.
 *
 * Signing in to an existing account switches uid, which would strand anything
 * logged anonymously on this device. So the caller snapshots the anonymous
 * data *before* signing in (the rules only let a user read their own
 * documents) and replays it under the new uid afterwards.
 *
 * The anonymous originals are left behind: once signed in as someone else,
 * the rules no longer let this client delete them.
 */
import {
	collection,
	doc,
	getDocs,
	serverTimestamp,
	Timestamp,
	writeBatch,
	type CollectionReference,
	type DocumentData
} from 'firebase/firestore';

import { getFirebase } from './client';

export type UserData = { workouts: DocumentData[]; exercises: DocumentData[] };

export async function readUserData(uid: string): Promise<UserData> {
	const { db } = getFirebase();
	const [workouts, exercises] = await Promise.all([
		getDocs(collection(db, 'users', uid, 'workouts')),
		getDocs(collection(db, 'users', uid, 'exercises'))
	]);
	return {
		workouts: workouts.docs.map((d) => d.data()),
		exercises: exercises.docs.map((d) => d.data())
	};
}

/** Firestore caps a batch at 500 writes; stay clear of it. */
const BATCH_SIZE = 400;

/**
 * Write `data` under `uid`. Custom exercises the account already has
 * (case-insensitive) are skipped; every set is copied.
 *
 * Writes are queued locally and not awaited — like the rest of the app, the
 * server ack never comes while offline. `onError` reports a rejected batch.
 */
export async function importUserData(
	uid: string,
	data: UserData,
	onError: (error: Error) => void
): Promise<{ sets: number; exercises: number }> {
	const { db } = getFirebase();
	const workoutsRef = collection(db, 'users', uid, 'workouts');
	const exercisesRef = collection(db, 'users', uid, 'exercises');

	const existing = await getDocs(exercisesRef);
	const known = new Set(
		existing.docs.map((d) => String(d.data().name ?? '').toLowerCase()).filter(Boolean)
	);

	const writes: [CollectionReference, DocumentData][] = [];

	for (const w of data.workouts) {
		// The copy gets a fresh createdAt (the rules pin it to request.time), so
		// carry the training date over in performedAt — falling back to the
		// original entry time for sets saved before performedAt existed.
		const performedAt =
			w.performedAt instanceof Timestamp
				? w.performedAt
				: w.createdAt instanceof Timestamp
					? w.createdAt
					: Timestamp.now();
		writes.push([
			workoutsRef,
			{
				exercise: w.exercise,
				weight: w.weight,
				reps: w.reps,
				performedAt,
				createdAt: serverTimestamp()
			}
		]);
	}

	let exercises = 0;
	for (const e of data.exercises) {
		const name = typeof e.name === 'string' ? e.name : '';
		if (!name || known.has(name.toLowerCase())) continue;
		known.add(name.toLowerCase());
		exercises++;
		writes.push([exercisesRef, { name, createdAt: serverTimestamp() }]);
	}

	for (let i = 0; i < writes.length; i += BATCH_SIZE) {
		const batch = writeBatch(db);
		for (const [ref, value] of writes.slice(i, i + BATCH_SIZE)) {
			batch.set(doc(ref), value);
		}
		batch.commit().catch(onError);
	}

	return { sets: data.workouts.length, exercises };
}
