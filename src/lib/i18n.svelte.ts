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
	todaysSets: "Today's sets",
	noSetsToday: 'Nothing logged today yet. Add your first set above.',
	otherDayHint: 'Sets for other days show up on each exercise’s history page.',
	delete: 'Delete',
	deleteSet: (exercise: string) => `Delete ${exercise} set`,
	edit: 'Edit',
	editSet: (exercise: string) => `Edit ${exercise} set`,
	saveChanges: 'Save changes',
	syncing: 'syncing…',
	pickerPlaceholder: 'Search or add a machine or exercise',
	pickerAdd: (name: string) => `Add “${name}”`,
	pickerEmpty: 'Type to add an exercise',
	pickerNoMatch: 'No matching exercise',
	pickerShow: 'Show exercises',
	pickerHide: 'Hide exercises',
	pickerMachines: 'Machines',
	pickerExercises: 'Exercises',
	tabLog: 'Log',
	account: 'Account',
	accountGuestTitle: 'Save your training',
	accountGuestBody:
		'You’re using the app without an account, so your data only lives in this browser. Create an account to keep it safe and use it on other devices.',
	createAccount: 'Create account',
	signIn: 'Sign in',
	signOut: 'Sign out',
	email: 'Email',
	password: 'Password',
	passwordHint: 'At least 8 characters.',
	forgotPassword: 'Forgot password?',
	sendResetLink: 'Send reset link',
	backToSignIn: 'Back to sign in',
	resetSent: (email: string) => `If an account exists for ${email}, a reset link is on its way.`,
	working: 'One moment…',
	signedInAsEmail: 'Signed in as',
	verifyPending: 'Please confirm your email address — check your inbox for a link.',
	verifyResend: 'Resend email',
	verifySent: 'Sent. Check your inbox (and spam folder).',
	verifyDone: 'I’ve confirmed it',
	verified: 'Email confirmed',
	signInMergeNote: 'Sets logged on this device without an account will be copied into it.',
	copied: (sets: number) =>
		sets === 1 ? 'Copied 1 set from this device.' : `Copied ${sets} sets from this device.`,
	signOutNote: 'Signing out starts a fresh, empty session on this device. Your data stays in your account.',
	guestBadge: 'Not saved — create an account',
	authErrors: {
		'invalid-email': 'That email address doesn’t look right.',
		'email-already-in-use': 'There’s already an account with that email. Sign in instead.',
		'credential-already-in-use': 'There’s already an account with that email. Sign in instead.',
		'weak-password': 'Password is too weak — use at least 8 characters.',
		'invalid-credential': 'Email or password is incorrect.',
		'wrong-password': 'Email or password is incorrect.',
		'user-not-found': 'Email or password is incorrect.',
		'user-disabled': 'This account has been disabled.',
		'requires-recent-login': 'For your security, please enter your password again.',
		'too-many-requests': 'Too many attempts. Wait a moment and try again.',
		'network-request-failed': 'You’re offline. Connect to the internet and try again.',
		'operation-not-allowed':
			'Email sign-in isn’t enabled. In the Firebase Console, enable Email/Password under Authentication → Sign-in method.'
	} as Record<string, string>,
	authErrorGeneric: 'Something went wrong. Please try again.',
	deleteAccount: 'Delete account',
	deleteData: 'Delete my data',
	deleteAccountBody:
		'Permanently deletes your account and every set and exercise you’ve logged. This can’t be undone.',
	deleteDataBody:
		'Permanently deletes every set and exercise logged on this device. This can’t be undone.',
	deleteConfirmPassword: 'Enter your password to confirm',
	deleteConfirmWord: 'DELETE',
	deleteConfirmType: (word: string) => `Type ${word} to confirm`,
	deleteForever: 'Delete permanently',
	cancel: 'Cancel',
	deleted: 'Your account and data have been deleted.',
	dataDeleted: 'Your data has been deleted.',
	deleteNeedsOnline: 'You’re offline. Connect to the internet to delete your account.',
	privacyTitle: 'Privacy notice',
	privacyLink: 'Privacy notice',
	privacySignupNote: 'How we handle your data:',
	yourId: 'Your ID',
	yourIdHint: 'Quote this if you contact us about your data.',
	pickExercise: 'Pick an exercise above to see its progression.',
	viewOnGym80: 'View on gym80.de',
	historyTitle: 'Training history',
	exerciseCount: (n: number) => (n === 1 ? '1 exercise' : `${n} exercises`),
	best: 'best',
	showSets: 'Show sets',
	hideSets: 'Hide sets',
	loadOlder: 'Load older',
	loading: 'Loading…',
	noTrainingDays: 'No training logged yet. Your sessions will appear here by date.',
	date: 'Date',
	today: 'Today',
	back: 'Back',
	viewHistory: (exercise: string) => `View history for ${exercise}`,
	progress: 'Progress',
	history: 'History',
	metricE1rm: 'Est. 1RM',
	metricWeight: 'Top weight',
	metricVolume: 'Volume',
	metricHint: {
		e1rm: 'Estimated one-rep max per day (Epley formula). Most reliable for sets under ~10 reps.',
		weight: 'Heaviest set per day.',
		volume: 'Total weight × reps per day.'
	},
	bestWeight: 'Heaviest set',
	bestE1rm: 'Best est. 1RM',
	totalSets: 'Sets logged',
	lastSession: 'Last session',
	noHistory: 'No sets logged for this exercise yet.',
	oneSession: 'Log another session to see your progression.',
	personalBest: 'PB',
	personalBestLong: 'Personal best',
	setCount: (n: number) => (n === 1 ? '1 set' : `${n} sets`),
	chartLabel: (exercise: string, metric: string) => `${metric} over time for ${exercise}`,
	installTitle: 'Install Gym Tracker',
	installBody: 'Open it from your home screen like an app — full screen, and it works offline.',
	installButton: 'Install',
	// {share} is replaced by the Share icon and label.
	installIosSteps: 'Tap {share} in Safari, then “Add to Home Screen”.',
	installIosShare: 'Share',
	installIosOther: 'To install it, open this page in Safari, tap Share, then “Add to Home Screen”.',
	dismiss: 'Dismiss'
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
	todaysSets: 'Heutige Sätze',
	noSetsToday: 'Heute noch nichts eingetragen. Trag oben deinen ersten Satz ein.',
	otherDayHint: 'Sätze für andere Tage findest du im Verlauf der jeweiligen Übung.',
	delete: 'Löschen',
	deleteSet: (exercise: string) => `Satz „${exercise}“ löschen`,
	edit: 'Bearbeiten',
	editSet: (exercise: string) => `Satz „${exercise}“ bearbeiten`,
	saveChanges: 'Änderungen speichern',
	syncing: 'wird synchronisiert…',
	pickerPlaceholder: 'Gerät oder Übung suchen oder hinzufügen',
	pickerAdd: (name: string) => `„${name}“ hinzufügen`,
	pickerEmpty: 'Tippen, um eine Übung hinzuzufügen',
	pickerNoMatch: 'Keine passende Übung',
	pickerShow: 'Übungen anzeigen',
	pickerHide: 'Übungen ausblenden',
	pickerMachines: 'Geräte',
	pickerExercises: 'Übungen',
	tabLog: 'Eintragen',
	account: 'Konto',
	accountGuestTitle: 'Training sichern',
	accountGuestBody:
		'Du nutzt die App ohne Konto, deine Daten liegen also nur in diesem Browser. Erstelle ein Konto, um sie zu sichern und auf anderen Geräten zu nutzen.',
	createAccount: 'Konto erstellen',
	signIn: 'Anmelden',
	signOut: 'Abmelden',
	email: 'E-Mail',
	password: 'Passwort',
	passwordHint: 'Mindestens 8 Zeichen.',
	forgotPassword: 'Passwort vergessen?',
	sendResetLink: 'Link zum Zurücksetzen senden',
	backToSignIn: 'Zurück zur Anmeldung',
	resetSent: (email: string) =>
		`Falls ein Konto für ${email} existiert, ist ein Link zum Zurücksetzen unterwegs.`,
	working: 'Einen Moment…',
	signedInAsEmail: 'Angemeldet als',
	verifyPending: 'Bitte bestätige deine E-Mail-Adresse – du findest einen Link in deinem Posteingang.',
	verifyResend: 'E-Mail erneut senden',
	verifySent: 'Gesendet. Schau in deinen Posteingang (und den Spam-Ordner).',
	verifyDone: 'Ich habe bestätigt',
	verified: 'E-Mail bestätigt',
	signInMergeNote: 'Sätze, die auf diesem Gerät ohne Konto eingetragen wurden, werden ins Konto übernommen.',
	copied: (sets: number) =>
		sets === 1 ? '1 Satz von diesem Gerät übernommen.' : `${sets} Sätze von diesem Gerät übernommen.`,
	signOutNote:
		'Beim Abmelden beginnt auf diesem Gerät eine neue, leere Sitzung. Deine Daten bleiben in deinem Konto.',
	guestBadge: 'Nicht gesichert – Konto erstellen',
	authErrors: {
		'invalid-email': 'Diese E-Mail-Adresse sieht nicht richtig aus.',
		'email-already-in-use': 'Für diese E-Mail gibt es schon ein Konto. Melde dich stattdessen an.',
		'credential-already-in-use': 'Für diese E-Mail gibt es schon ein Konto. Melde dich stattdessen an.',
		'weak-password': 'Das Passwort ist zu schwach – verwende mindestens 8 Zeichen.',
		'invalid-credential': 'E-Mail oder Passwort ist falsch.',
		'wrong-password': 'E-Mail oder Passwort ist falsch.',
		'user-not-found': 'E-Mail oder Passwort ist falsch.',
		'user-disabled': 'Dieses Konto wurde deaktiviert.',
		'requires-recent-login': 'Bitte gib zu deiner Sicherheit dein Passwort erneut ein.',
		'too-many-requests': 'Zu viele Versuche. Warte kurz und versuche es erneut.',
		'network-request-failed': 'Du bist offline. Verbinde dich mit dem Internet und versuche es erneut.',
		'operation-not-allowed':
			'Die Anmeldung per E-Mail ist nicht aktiviert. Aktiviere in der Firebase Console unter Authentication → Sign-in method „Email/Password“.'
	} as Record<string, string>,
	authErrorGeneric: 'Etwas ist schiefgelaufen. Bitte versuche es erneut.',
	deleteAccount: 'Konto löschen',
	deleteData: 'Meine Daten löschen',
	deleteAccountBody:
		'Löscht dein Konto und alle eingetragenen Sätze und Übungen endgültig. Das lässt sich nicht rückgängig machen.',
	deleteDataBody:
		'Löscht alle auf diesem Gerät eingetragenen Sätze und Übungen endgültig. Das lässt sich nicht rückgängig machen.',
	deleteConfirmPassword: 'Gib zur Bestätigung dein Passwort ein',
	deleteConfirmWord: 'LÖSCHEN',
	deleteConfirmType: (word: string) => `Tippe ${word} zur Bestätigung`,
	deleteForever: 'Endgültig löschen',
	cancel: 'Abbrechen',
	deleted: 'Dein Konto und deine Daten wurden gelöscht.',
	dataDeleted: 'Deine Daten wurden gelöscht.',
	deleteNeedsOnline: 'Du bist offline. Verbinde dich mit dem Internet, um dein Konto zu löschen.',
	privacyTitle: 'Datenschutzerklärung',
	privacyLink: 'Datenschutz',
	privacySignupNote: 'So gehen wir mit deinen Daten um:',
	yourId: 'Deine Kennung',
	yourIdHint: 'Gib sie an, wenn du uns wegen deiner Daten kontaktierst.',
	pickExercise: 'Wähle oben eine Übung aus, um deinen Fortschritt zu sehen.',
	viewOnGym80: 'Auf gym80.de ansehen',
	historyTitle: 'Trainingsverlauf',
	exerciseCount: (n: number) => (n === 1 ? '1 Übung' : `${n} Übungen`),
	best: 'bester',
	showSets: 'Sätze anzeigen',
	hideSets: 'Sätze ausblenden',
	loadOlder: 'Ältere laden',
	loading: 'Wird geladen…',
	noTrainingDays: 'Noch kein Training eingetragen. Deine Einheiten erscheinen hier nach Datum.',
	date: 'Datum',
	today: 'Heute',
	back: 'Zurück',
	viewHistory: (exercise: string) => `Verlauf für ${exercise} anzeigen`,
	progress: 'Fortschritt',
	history: 'Verlauf',
	metricE1rm: 'Gesch. 1RM',
	metricWeight: 'Höchstgewicht',
	metricVolume: 'Volumen',
	metricHint: {
		e1rm: 'Geschätztes Einwiederholungsmaximum pro Tag (Epley-Formel). Am zuverlässigsten bei Sätzen unter ca. 10 Wiederholungen.',
		weight: 'Schwerster Satz pro Tag.',
		volume: 'Gesamtgewicht × Wiederholungen pro Tag.'
	},
	bestWeight: 'Schwerster Satz',
	bestE1rm: 'Bestes gesch. 1RM',
	totalSets: 'Sätze gesamt',
	lastSession: 'Letztes Training',
	noHistory: 'Für diese Übung wurden noch keine Sätze eingetragen.',
	oneSession: 'Trag ein weiteres Training ein, um deinen Fortschritt zu sehen.',
	personalBest: 'PB',
	personalBestLong: 'Persönliche Bestleistung',
	setCount: (n: number) => (n === 1 ? '1 Satz' : `${n} Sätze`),
	chartLabel: (exercise: string, metric: string) => `${metric} im Zeitverlauf für ${exercise}`,
	installTitle: 'Gym Tracker installieren',
	installBody: 'Öffne sie wie eine App vom Home-Bildschirm – im Vollbild und auch offline.',
	installButton: 'Installieren',
	installIosSteps: 'Tippe in Safari auf {share} und dann auf „Zum Home-Bildschirm“.',
	installIosShare: 'Teilen',
	installIosOther: 'Öffne diese Seite zum Installieren in Safari, tippe auf Teilen und dann auf „Zum Home-Bildschirm“.',
	dismiss: 'Schließen'
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
