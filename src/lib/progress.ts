/**
 * Pure helpers that turn a list of sets for one exercise into progression
 * data. No Firebase, no Svelte — just numbers.
 */
import type { Workout } from '$lib/firebase/workouts';

export type Metric = 'e1rm' | 'weight' | 'volume';

export type Session = {
	/** Local midnight of the training day. */
	day: Date;
	sets: Workout[];
	topWeight: number;
	bestE1rm: number;
	volume: number;
};

/**
 * Estimated one-rep max, Epley formula. A single is taken at face value; the
 * estimate drifts upward for high-rep sets, which the UI says in its hint.
 */
export function e1rm(weight: number, reps: number): number {
	return reps === 1 ? weight : weight * (1 + reps / 30);
}

function startOfDay(date: Date): Date {
	return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/**
 * Group sets into one session per local calendar day, oldest first. Sets still
 * waiting for their server timestamp count as today.
 */
export function toSessions(workouts: Workout[]): Session[] {
	const byDay = new Map<number, Workout[]>();
	for (const w of workouts) {
		const key = startOfDay(w.date ?? new Date()).getTime();
		const list = byDay.get(key);
		if (list) list.push(w);
		else byDay.set(key, [w]);
	}

	return [...byDay.entries()]
		.sort(([a], [b]) => a - b)
		.map(([key, sets]) => ({
			day: new Date(key),
			sets,
			topWeight: Math.max(...sets.map((s) => s.weight)),
			bestE1rm: Math.max(...sets.map((s) => e1rm(s.weight, s.reps))),
			volume: sets.reduce((sum, s) => sum + s.weight * s.reps, 0)
		}));
}

export function metricValue(session: Session, metric: Metric): number {
	switch (metric) {
		case 'e1rm':
			return session.bestE1rm;
		case 'weight':
			return session.topWeight;
		case 'volume':
			return session.volume;
	}
}

/**
 * Ids of sets that were a heaviest-weight PB at the time they were logged.
 * Ties don't count — matching your best isn't beating it.
 */
export function personalBestIds(workouts: Workout[]): Set<string> {
	const ids = new Set<string>();
	let best = -Infinity;
	for (const w of workouts) {
		if (w.weight > best) {
			best = w.weight;
			ids.add(w.id);
		}
	}
	return ids;
}

/** Round to the nearest 0.5 — the precision plates actually come in. */
export function roundHalf(value: number): number {
	return Math.round(value * 2) / 2;
}
