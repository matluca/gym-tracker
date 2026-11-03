/**
 * The exercise selected on the Log and Progress tabs, shared so switching
 * tabs keeps it.
 *
 * Session only: held in memory, never in localStorage. A fresh launch starts
 * empty and is seeded from the most recently entered set, which comes from
 * Firestore and so follows the user across devices. Scoped to the uid it was
 * picked under, so signing in, out or deleting the account starts over
 * instead of carrying another account's exercise across.
 */
import { auth } from '#lib/firebase/auth.svelte.js';
import type { Workout } from '#lib/firebase/workouts.js';

let current = $state<{ uid: string; exercise: string } | null>(null);

export const selection = {
	/** The stored exercise value, or '' if nothing is selected yet. */
	get exercise(): string {
		return current && current.uid === auth.user?.uid ? current.exercise : '';
	},
	set exercise(value: string) {
		const uid = auth.user?.uid;
		current = uid ? { uid, exercise: value } : null;
	}
};

/**
 * Selects the exercise of the most recently entered set, unless something is
 * already selected. Call with every snapshot of the recent-sets subscription:
 * the first one can come from an empty local cache, so an empty list is
 * skipped and the next one seeds instead.
 */
export function seedSelection(workouts: Workout[]): void {
	if (selection.exercise) return;
	const last = lastEntered(workouts);
	if (last) selection.exercise = last.exercise;
}

/**
 * The set entered most recently — by `createdAt`, not the training date, so
 * backdating an old session doesn't change what's preselected. A set still
 * waiting for its server timestamp is the newest.
 */
function lastEntered(list: Workout[]): Workout | undefined {
	const entered = (w: Workout) => w.createdAt?.getTime() ?? Infinity;
	return list.reduce<Workout | undefined>(
		(best, w) => (!best || entered(w) > entered(best) ? w : best),
		undefined
	);
}

// The Progress tab used to remember its exercise in localStorage. Drop the
// leftover so the device holds only what the privacy notice lists.
if (typeof window !== 'undefined') {
	try {
		localStorage.removeItem('lastViewedExercise');
	} catch {
		// Unavailable storage holds nothing to clean up.
	}
}
