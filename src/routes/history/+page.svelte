<script lang="ts">
	import { SvelteSet } from 'svelte/reactivity';

	import { auth } from '#lib/firebase/auth.svelte.js';
	import { isConfigured } from '#lib/firebase/client.js';
	import { exerciseHref, exerciseLabel } from '#lib/firebase/exercises.js';
	import { deleteWorkout, subscribeToHistory, type HistoryWindow } from '#lib/firebase/workouts.js';
	import { toLocalDateString } from '#lib/dates.js';
	import { i18n } from '#lib/i18n.svelte.js';
	import { bestSet, byExercise, toSessions } from '#lib/progress.js';

	/** Sets fetched per "Load older" — roughly a month of normal training. */
	const PAGE = 200;

	const t = $derived(i18n.t);

	let max = $state(PAGE);
	let history = $state<HistoryWindow | null>(null);
	let loadingMore = $state(false);
	let error = $state<string | null>(null);
	const expanded = new SvelteSet<string>();

	$effect(() => {
		const uid = auth.user?.uid;
		if (!uid) return;

		return subscribeToHistory(
			uid,
			max,
			(next) => {
				history = next;
				loadingMore = false;
				error = null;
			},
			(e) => {
				error = e.message;
				loadingMore = false;
			}
		);
	});

	// Newest day first. Days that might still be missing sets (see
	// subscribeToHistory) are held back until "Load older" fetches the rest.
	const days = $derived.by(() => {
		if (!history) return [];
		const cutoff = history.completeFrom;
		return toSessions(history.workouts)
			.filter((s) => !cutoff || s.day >= cutoff)
			.reverse()
			.map((s) => ({ ...s, key: toLocalDateString(s.day), groups: byExercise(s.sets) }));
	});

	const hasMore = $derived(history?.completeFrom != null);

	const dayFormat = $derived(
		new Intl.DateTimeFormat(i18n.locale, {
			weekday: 'short',
			day: 'numeric',
			month: 'short',
			year: 'numeric'
		})
	);
	const timeFormat = $derived(new Intl.DateTimeFormat(i18n.locale, { timeStyle: 'short' }));
	const number = $derived(new Intl.NumberFormat(i18n.locale, { maximumFractionDigits: 1 }));

	function toggle(key: string) {
		if (expanded.has(key)) expanded.delete(key);
		else expanded.add(key);
	}

	function loadOlder() {
		loadingMore = true;
		max += PAGE;
	}

	async function handleDelete(id: string) {
		const uid = auth.user?.uid;
		if (!uid) return;
		try {
			await deleteWorkout(uid, id);
		} catch (e) {
			error = e instanceof Error ? e.message : String(e);
		}
	}
</script>

<svelte:head>
	<title>{t.historyTitle} · {t.appTitle}</title>
</svelte:head>

<main>
	<header>
		<h1>{t.historyTitle}</h1>
	</header>

	{#if !isConfigured}
		<p class="muted">Firebase isn't configured yet. See <code>README.md</code>.</p>
	{:else if auth.error}
		<p class="error">{t.authFailed} {auth.error}</p>
	{:else if auth.loading || (!history && !error)}
		<p class="muted">{auth.loading ? t.signingIn : t.loading}</p>
	{:else}
		{#if error}
			<p class="error">{error}</p>
		{/if}

		{#if days.length === 0 && !hasMore}
			<section class="card">
				<p class="muted">{t.noTrainingDays}</p>
			</section>
		{:else}
			<ol class="days">
				{#each days as day (day.key)}
					{@const open = expanded.has(day.key)}
					<li class="card">
						<button
							type="button"
							class="day-head"
							aria-expanded={open}
							aria-controls="day-{day.key}"
							onclick={() => toggle(day.key)}
						>
							<time datetime={day.key}>{dayFormat.format(day.day)}</time>
							<span class="muted">
								{t.exerciseCount(day.groups.length)} · {t.setCount(day.sets.length)}
							</span>
							<svg class="chevron" class:open viewBox="0 0 20 20" aria-hidden="true">
								<path d="M5 7.5 10 12.5 15 7.5" />
							</svg>
							<span class="visually-hidden">{open ? t.hideSets : t.showSets}</span>
						</button>

						<ul class="exercises" id="day-{day.key}">
							{#each day.groups as group (group.exercise)}
								{@const name = exerciseLabel(group.exercise, i18n.locale)}
								{@const top = bestSet(group.sets)}
								<li>
									<div class="exercise-row">
										<a class="exercise" href={exerciseHref(group.exercise)} aria-label={t.viewHistory(name)}>
											{name}
										</a>
										<span class="summary">
											{t.setCount(group.sets.length)} · {t.best}
											<strong>{number.format(top.weight)} kg × {top.reps}</strong>
										</span>
									</div>

									{#if open}
										<ul class="sets">
											{#each group.sets as set (set.id)}
												<li>
													<span class="set-main">{number.format(set.weight)} kg × {set.reps}</span>
													<time class="set-time">
														{set.date ? timeFormat.format(set.date) : t.syncing}
													</time>
													<button
														type="button"
														class="delete"
														onclick={() => handleDelete(set.id)}
														aria-label={t.deleteSet(name)}
													>
														{t.delete}
													</button>
												</li>
											{/each}
										</ul>
									{/if}
								</li>
							{/each}
						</ul>
					</li>
				{/each}
			</ol>

			{#if hasMore}
				<button type="button" class="more" onclick={loadOlder} disabled={loadingMore}>
					{loadingMore ? t.loading : t.loadOlder}
				</button>
			{/if}
		{/if}
	{/if}
</main>

<style>
	main {
		max-width: 34rem;
		margin: 0 auto;
		padding: 1.5rem 1rem 6rem;
	}

	header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.75rem;
		margin-bottom: 1.5rem;
	}

	h1 {
		font-size: 1.5rem;
		margin: 0;
	}

	.card {
		background: #171a21;
		border: 1px solid #252a33;
		border-radius: 0.75rem;
		padding: 1rem;
	}

	.days {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.day-head {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		gap: 0.25rem 0.75rem;
		width: 100%;
		margin: 0 0 0.6rem;
		padding: 0;
		background: none;
		border: none;
		color: inherit;
		font: inherit;
		text-align: left;
		cursor: pointer;
	}

	.day-head:focus-visible {
		outline: 2px solid #4c8dff;
		outline-offset: 4px;
		border-radius: 0.25rem;
	}

	.day-head time {
		font-weight: 600;
	}

	.day-head .muted {
		font-size: 0.8rem;
	}

	.chevron {
		margin-left: auto;
		align-self: center;
		width: 1rem;
		height: 1rem;
		fill: none;
		stroke: #78818c;
		stroke-width: 2;
		transition: transform 0.15s;
	}

	.chevron.open {
		transform: rotate(180deg);
	}

	.exercises,
	.sets {
		list-style: none;
		margin: 0;
		padding: 0;
	}

	.exercises {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.exercise-row {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		justify-content: space-between;
		gap: 0.1rem 0.75rem;
	}

	.exercise {
		font-weight: 600;
		color: inherit;
		text-decoration: underline;
		text-decoration-color: #4a525e;
		text-underline-offset: 0.2em;
	}

	.exercise:hover {
		text-decoration-color: #4c8dff;
	}

	.summary {
		font-size: 0.8rem;
		color: #78818c;
	}

	.summary strong {
		color: #c3c9d1;
		font-weight: 600;
		font-variant-numeric: tabular-nums;
	}

	.sets {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		margin-top: 0.4rem;
	}

	.sets li {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.35rem 0.35rem 0.35rem 0.75rem;
		background: #0f1115;
		border: 1px solid #252a33;
		border-radius: 0.5rem;
	}

	.set-main {
		color: #c3c9d1;
		font-variant-numeric: tabular-nums;
	}

	.set-time {
		margin-left: auto;
		font-size: 0.75rem;
		color: #78818c;
	}

	.delete {
		background: transparent;
		color: #ff8080;
		border: 1px solid #45262a;
		border-radius: 0.5rem;
		padding: 0.3rem 0.55rem;
		font-size: 0.8rem;
		font-family: inherit;
		cursor: pointer;
	}

	.more {
		display: block;
		width: 100%;
		margin-top: 1rem;
		background: #171a21;
		color: #c3c9d1;
		border: 1px solid #2d333d;
		border-radius: 0.5rem;
		padding: 0.65rem 1rem;
		font-size: 0.9rem;
		font-family: inherit;
		cursor: pointer;
	}

	.more:disabled {
		opacity: 0.6;
		cursor: default;
	}

	.muted {
		color: #78818c;
		font-size: 0.9rem;
	}

	.error {
		color: #ff8080;
		font-size: 0.9rem;
	}

	.visually-hidden {
		position: absolute;
		width: 1px;
		height: 1px;
		margin: -1px;
		overflow: hidden;
		clip: rect(0 0 0 0);
		white-space: nowrap;
	}

	code {
		background: #0b0d11;
		padding: 0.1rem 0.3rem;
		border-radius: 0.25rem;
		font-size: 0.85em;
	}
</style>
