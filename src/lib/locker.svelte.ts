/**
 * Today's gym locker number, remembered on this device until the day ends.
 *
 * Stored in localStorage with the local date it was set on; on any other day
 * it reads as empty, so it never needs clearing by hand. Deliberately not in
 * Firestore: it is only useful on the phone you are carrying, and keeping it
 * local means no rules, no account deletion step and no network.
 */
import { toLocalDateString } from '#lib/dates.js';

const STORAGE_KEY = 'locker';

type Stored = { number: number; date: string };

function read(): Stored | null {
	if (typeof window === 'undefined') return null;
	try {
		const parsed: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null');
		if (
			parsed &&
			typeof parsed === 'object' &&
			'number' in parsed &&
			'date' in parsed &&
			Number.isInteger(parsed.number) &&
			typeof parsed.date === 'string'
		) {
			return parsed as Stored;
		}
	} catch {
		// Unavailable storage or a corrupt value both just mean "no locker".
	}
	return null;
}

let stored = $state<Stored | null>(read());
let today = $state(toLocalDateString(new Date()));

/**
 * Re-checks the date, so a locker set yesterday disappears when the app is
 * brought back to the foreground on a new day.
 */
export function refreshLockerDay(): void {
	today = toLocalDateString(new Date());
}

export const locker = {
	/** Today's locker number, or null if none was set today. */
	get number(): number | null {
		return stored && stored.date === today ? stored.number : null;
	},
	set number(next: number | null) {
		refreshLockerDay();
		stored = next === null ? null : { number: next, date: today };
		try {
			if (stored) localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
			else localStorage.removeItem(STORAGE_KEY);
		} catch {
			// Not fatal — it just won't survive a reload.
		}
	}
};
