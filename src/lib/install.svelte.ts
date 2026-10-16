/**
 * Reactive "can this be installed, and how?" state for the install hint.
 *
 * Chromium browsers (Android, desktop Chrome/Edge) fire `beforeinstallprompt`
 * when the app is installable; keeping the event lets an in-page button open
 * the native install dialog. iOS has no such API — the only route is the
 * Share sheet's "Add to Home Screen" — so there we can only explain the steps.
 *
 * `initInstall()` runs from the root layout rather than the Log page because
 * the event can fire before the page that shows the hint is mounted.
 */

/** Not in lib.dom yet. */
interface BeforeInstallPromptEvent extends Event {
	prompt(): Promise<void>;
	userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const DISMISSED_KEY = 'installHintDismissed';

export type InstallMode = 'prompt' | 'ios-safari' | 'ios-other';

const state = $state({
	standalone: false,
	dismissed: false,
	ios: null as null | 'safari' | 'other',
	deferred: null as BeforeInstallPromptEvent | null
});

let initialised = false;

export function initInstall(): void {
	if (initialised || typeof window === 'undefined') return;
	initialised = true;

	const standaloneQuery = window.matchMedia('(display-mode: standalone)');
	const syncStandalone = () => {
		state.standalone =
			standaloneQuery.matches ||
			// iOS Safari's own flag for home-screen launches.
			(navigator as Navigator & { standalone?: boolean }).standalone === true;
	};
	syncStandalone();
	standaloneQuery.addEventListener('change', syncStandalone);

	try {
		state.dismissed = localStorage.getItem(DISMISSED_KEY) === '1';
	} catch {
		// Storage blocked: the hint just comes back next visit.
	}

	state.ios = detectIos();

	window.addEventListener('beforeinstallprompt', (event) => {
		// Stop Chrome's own mini-infobar; our card offers the same thing.
		event.preventDefault();
		state.deferred = event as BeforeInstallPromptEvent;
	});
	window.addEventListener('appinstalled', () => {
		state.deferred = null;
	});
}

function detectIos(): null | 'safari' | 'other' {
	const ua = navigator.userAgent;
	// iPadOS reports itself as a Mac; touch support gives it away.
	const isIos = /iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
	if (!isIos) return null;
	// Every iOS browser is WebKit; the others add their own token.
	return /CriOS|FxiOS|EdgiOS|OPiOS|GSA\//.test(ua) ? 'other' : 'safari';
}

/** Which hint to show, or null for none. */
export function installMode(): InstallMode | null {
	if (state.standalone || state.dismissed) return null;
	if (state.deferred) return 'prompt';
	if (state.ios === 'safari') return 'ios-safari';
	if (state.ios === 'other') return 'ios-other';
	return null;
}

/** Opens the native install dialog. The event is single-use either way. */
export async function promptInstall(): Promise<void> {
	const event = state.deferred;
	if (!event) return;
	state.deferred = null;
	await event.prompt();
	await event.userChoice;
}

export function dismissInstallHint(): void {
	state.dismissed = true;
	try {
		localStorage.setItem(DISMISSED_KEY, '1');
	} catch {
		// Not fatal — hidden for this session only.
	}
}
