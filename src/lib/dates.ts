/**
 * Local-calendar date helpers. `<input type="date">` works in local
 * `YYYY-MM-DD` strings; `toISOString()` is UTC and would shift the day for
 * anyone east or west of Greenwich, so never use it for these.
 */

export function toLocalDateString(date: Date): string {
	const y = date.getFullYear();
	const m = String(date.getMonth() + 1).padStart(2, '0');
	const d = String(date.getDate()).padStart(2, '0');
	return `${y}-${m}-${d}`;
}

/**
 * The chosen calendar day at the current clock time. Using the real time of
 * day (rather than midnight) keeps sets logged one after another in order,
 * even when they are backdated.
 */
export function atCurrentTime(localDate: string, now = new Date()): Date {
	const [y, m, d] = localDate.split('-').map(Number);
	return new Date(y, m - 1, d, now.getHours(), now.getMinutes(), now.getSeconds());
}
