/**
 * Firestore access for a user's custom exercises.
 *
 * Data model: users/{uid}/exercises/{exerciseId}
 *
 * The selectable list is DEFAULT_EXERCISES plus whatever the user has added.
 * Defaults live in code rather than being seeded into Firestore so every new
 * (anonymous) user gets them without a write, and so the list can be improved
 * by shipping a build.
 */
import { addDoc, collection, onSnapshot, serverTimestamp } from 'firebase/firestore';

import { resolve } from '$app/paths';

import type { Locale } from '#lib/i18n.svelte.js';

import { getFirebase } from './client';

/**
 * Built-in exercises. The English name is the canonical value written to
 * workout documents, so history stays consistent whichever language the set
 * was logged in; `de` is only ever used for display.
 */
export const DEFAULT_EXERCISES: readonly { en: string; de: string }[] = [
	{ en: 'Back squat', de: 'Kniebeuge' },
	{ en: 'Front squat', de: 'Frontkniebeuge' },
	{ en: 'Deadlift', de: 'Kreuzheben' },
	{ en: 'Romanian deadlift', de: 'Rumänisches Kreuzheben' },
	{ en: 'Bench press', de: 'Bankdrücken' },
	{ en: 'Incline bench press', de: 'Schrägbankdrücken' },
	{ en: 'Overhead press', de: 'Schulterdrücken' },
	{ en: 'Barbell row', de: 'Langhantelrudern' },
	{ en: 'Pull-up', de: 'Klimmzug' },
	{ en: 'Chin-up', de: 'Klimmzug (Untergriff)' },
	{ en: 'Dip', de: 'Dips' },
	{ en: 'Lat pulldown', de: 'Latzug' },
	{ en: 'Seated cable row', de: 'Rudern am Kabelzug' },
	{ en: 'Leg press', de: 'Beinpresse' },
	{ en: 'Lunge', de: 'Ausfallschritt' },
	{ en: 'Hip thrust', de: 'Hip Thrust' },
	{ en: 'Leg curl', de: 'Beinbeuger' },
	{ en: 'Leg extension', de: 'Beinstrecker' },
	{ en: 'Calf raise', de: 'Wadenheben' },
	{ en: 'Bicep curl', de: 'Bizepscurl' },
	{ en: 'Tricep extension', de: 'Trizepsstrecken' },
	{ en: 'Lateral raise', de: 'Seitheben' },
	{ en: 'Face pull', de: 'Face Pull' },
	{ en: 'Push-up', de: 'Liegestütz' }
];

const defaultsByValue = new Map(DEFAULT_EXERCISES.map((e) => [e.en.toLowerCase(), e]));

/**
 * Display name for a stored exercise value. Built-ins are translated; names
 * the user typed themselves are shown as-is.
 */
export function exerciseLabel(value: string, locale: Locale): string {
	const builtIn = defaultsByValue.get(value.toLowerCase());
	return builtIn ? builtIn[locale] : value;
}

/** Link to the Progress tab for a stored exercise value. */
export function exerciseHref(value: string): string {
	return resolve('/exercise/[[name]]', { name: value });
}

/**
 * Everything the exercise picker offers: built-ins, the user's own, and names
 * that only appear in logged sets (so history from before the picker existed
 * stays selectable). De-duplicated case-insensitively, first spelling wins.
 */
export function buildExerciseOptions(
	custom: string[],
	logged: string[],
	locale: Locale
): { value: string; label: string }[] {
	const byKey = new Map<string, { value: string; label: string }>();
	for (const name of [...DEFAULT_EXERCISES.map((e) => e.en), ...custom, ...logged]) {
		const value = name.trim();
		const key = value.toLowerCase();
		if (key && !byKey.has(key)) byKey.set(key, { value, label: exerciseLabel(value, locale) });
	}
	return [...byKey.values()];
}

const LAST_VIEWED_KEY = 'lastViewedExercise';

/** The exercise last opened in the Progress tab, per device. */
export function getLastViewedExercise(): string | null {
	try {
		return localStorage.getItem(LAST_VIEWED_KEY);
	} catch {
		return null;
	}
}

export function setLastViewedExercise(value: string): void {
	try {
		localStorage.setItem(LAST_VIEWED_KEY, value);
	} catch {
		// Not fatal — the tab just opens empty next time.
	}
}

function exercisesCollection(uid: string) {
	const { db } = getFirebase();
	return collection(db, 'users', uid, 'exercises');
}

/**
 * Subscribe to the names of a user's custom exercises. Fires from the local
 * cache first (including offline). Returns the unsubscribe function.
 */
export function subscribeToExercises(
	uid: string,
	onChange: (names: string[]) => void,
	onError: (error: Error) => void
): () => void {
	return onSnapshot(
		exercisesCollection(uid),
		(snapshot) => {
			onChange(
				snapshot.docs
					.map((d) => d.data().name)
					.filter((name): name is string => typeof name === 'string' && name.length > 0)
			);
		},
		onError
	);
}

/**
 * Resolves once the server acknowledges the write — which never happens while
 * offline. The local snapshot updates immediately, so callers should not block
 * the UI on this promise.
 */
export async function addExercise(uid: string, name: string): Promise<void> {
	await addDoc(exercisesCollection(uid), {
		name,
		createdAt: serverTimestamp()
	});
}
