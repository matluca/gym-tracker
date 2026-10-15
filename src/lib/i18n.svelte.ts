/**
 * UI translations and the reactive current locale.
 *
 * Deliberately tiny: two languages and one page don't justify an i18n
 * library. `en` defines the shape of the message catalogue and `de` is typed
 * against it, so a missing German string is a type error in `npm run check`.
 *
 * The chosen locale is remembered in localStorage (per device, not synced).
 * First visit falls back to the browser's language.
 */

export const LOCALES = ['en', 'de'] as const;
export type Locale = (typeof LOCALES)[number];

const en = {
	appTitle: 'Gym Tracker',
	appDescription: 'A simple offline-capable workout log.',
	language: 'Language',
	offline: 'Offline — changes sync when you reconnect',
	authFailed: 'Auth failed.',
	authHint:
		'If this says the sign-in method is disabled, enable Anonymous under Firebase Console → Authentication → Sign-in method.',
	signingIn: 'Signing in…',
	logSet: 'Log a set',
	exercise: 'Exercise',
	weightKg: 'Weight (kg)',
	reps: 'Reps',
	saving: 'Saving…',
	addSet: 'Add set',
	recentSets: 'Recent sets',
	noSets: 'Nothing logged yet. Add your first set above.',
	delete: 'Delete',
	deleteSet: (exercise: string) => `Delete ${exercise} set`,
	syncing: 'syncing…',
	signedInAs: 'Signed in anonymously as',
	pickerPlaceholder: 'Search or add an exercise',
	pickerAdd: (name: string) => `Add “${name}”`,
	pickerEmpty: 'Type to add an exercise',
	pickerShow: 'Show exercises',
	pickerHide: 'Hide exercises'
};

type Messages = typeof en;

const de: Messages = {
	appTitle: 'Gym Tracker',
	appDescription: 'Ein einfaches, offline-fähiges Trainingstagebuch.',
	language: 'Sprache',
	offline: 'Offline – Änderungen werden synchronisiert, sobald du wieder online bist',
	authFailed: 'Anmeldung fehlgeschlagen.',
	authHint:
		'Wenn hier steht, dass die Anmeldemethode deaktiviert ist, aktiviere „Anonymous“ unter Firebase Console → Authentication → Sign-in method.',
	signingIn: 'Anmeldung läuft…',
	logSet: 'Satz eintragen',
	exercise: 'Übung',
	weightKg: 'Gewicht (kg)',
	reps: 'Wiederholungen',
	saving: 'Speichern…',
	addSet: 'Satz hinzufügen',
	recentSets: 'Letzte Sätze',
	noSets: 'Noch nichts eingetragen. Trag oben deinen ersten Satz ein.',
	delete: 'Löschen',
	deleteSet: (exercise: string) => `Satz „${exercise}“ löschen`,
	syncing: 'wird synchronisiert…',
	signedInAs: 'Anonym angemeldet als',
	pickerPlaceholder: 'Übung suchen oder hinzufügen',
	pickerAdd: (name: string) => `„${name}“ hinzufügen`,
	pickerEmpty: 'Tippen, um eine Übung hinzuzufügen',
	pickerShow: 'Übungen anzeigen',
	pickerHide: 'Übungen ausblenden'
};

const messages: Record<Locale, Messages> = { en, de };

const STORAGE_KEY = 'locale';

function isLocale(value: unknown): value is Locale {
	return typeof value === 'string' && (LOCALES as readonly string[]).includes(value);
}

function detectLocale(): Locale {
	if (typeof window === 'undefined') return 'en';
	try {
		const stored = localStorage.getItem(STORAGE_KEY);
		if (isLocale(stored)) return stored;
	} catch {
		// Storage can be unavailable (private mode, blocked site data).
	}
	for (const tag of navigator.languages ?? [navigator.language]) {
		const base = tag.split('-')[0].toLowerCase();
		if (isLocale(base)) return base;
	}
	return 'en';
}

let current = $state<Locale>(detectLocale());

/**
 * Read `i18n.t.someKey` in markup; it re-renders when `i18n.locale` changes.
 */
export const i18n = {
	get locale(): Locale {
		return current;
	},
	set locale(next: Locale) {
		current = next;
		try {
			localStorage.setItem(STORAGE_KEY, next);
		} catch {
			// Not fatal — the choice just won't survive a reload.
		}
	},
	get t(): Messages {
		return messages[current];
	}
};
