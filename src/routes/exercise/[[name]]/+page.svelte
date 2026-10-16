<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';

	import ExercisePicker from '#lib/components/ExercisePicker.svelte';
	import ProgressChart from '#lib/components/ProgressChart.svelte';
	import { toLocalDateString } from '#lib/dates.js';
	import { auth } from '#lib/firebase/auth.svelte.js';
	import { isConfigured } from '#lib/firebase/client.js';
	import {
		buildExerciseOptions,
		exerciseHref,
		exerciseLabel,
		getLastViewedExercise,
		logSetHref,
		machineProductUrl,
		setLastViewedExercise,
		subscribeToExercises
	} from '#lib/firebase/exercises.js';
	import {
		subscribeToExerciseHistory,
		subscribeToWorkouts,
		type Workout
	} from '#lib/firebase/workouts.js';
	import { i18n } from '#lib/i18n.svelte.js';
	import {
		e1rm,
		metricValue,
		personalBestIds,
		roundHalf,
		toSessions,
		type Metric
	} from '#lib/progress.js';

	const t = $derived(i18n.t);

	// The stored (English, for built-ins) exercise value — the route param is
	// already URL-decoded by SvelteKit. Empty on the bare /exercise tab.
	const exercise = $derived(page.params.name ?? '');
	const label = $derived(exerciseLabel(exercise, i18n.locale));
	const productUrl = $derived(machineProductUrl(exercise, i18n.locale));

	// Bare tab: reopen the last exercise viewed on this device. `replace`
	// so Back doesn't bounce between /exercise and /exercise/X.
	$effect(() => {
		if (exercise) {
			setLastViewedExercise(exercise);
			return;
		}
		const last = getLastViewedExercise();
		if (last) goto(exerciseHref(last), { replace: true });
	});

	// Picker options: same sources as the Log tab, so every exercise you've
	// logged or added is selectable here.
	let customExercises = $state<string[]>([]);
	let recent = $state<Workout[]>([]);

	$effect(() => {
		const uid = auth.user?.uid;
		if (!uid) return;
		const stopCustom = subscribeToExercises(uid, (n) => (customExercises = n), () => {});
		const stopRecent = subscribeToWorkouts(uid, (n) => (recent = n), () => {});
		return () => {
			stopCustom();
			stopRecent();
		};
	});

	const options = $derived(
		buildExerciseOptions(
			customExercises,
			[...recent.map((w) => w.exercise), ...(exercise ? [exercise] : [])],
			i18n.locale
		)
	);

	// Bound to the picker; navigating is what actually switches exercise.
	let picked = $state('');
	$effect(() => {
		picked = exercise;
	});
	$effect(() => {
		if (picked && picked !== exercise) goto(exerciseHref(picked), { reset: false });
	});

	let workouts = $state<Workout[]>([]);
	let loaded = $state(false);
	let error = $state<string | null>(null);
	let metric = $state<Metric>('e1rm');

	$effect(() => {
		const uid = auth.user?.uid;
		if (!uid || !exercise) return;

		loaded = false;
		return subscribeToExerciseHistory(
			uid,
			exercise,
			(next) => {
				workouts = next;
				loaded = true;
				error = null;
			},
			(e) => (error = e.message)
		);
	});

	const sessions = $derived(toSessions(workouts));
	const pbIds = $derived(personalBestIds(workouts));
	const newestFirst = $derived([...sessions].reverse());

	const stats = $derived.by(() => {
		if (workouts.length === 0) return null;
		const heaviest = workouts.reduce((a, b) => (b.weight > a.weight ? b : a));
		const bestE1rm = Math.max(...workouts.map((w) => e1rm(w.weight, w.reps)));
		return { heaviest, bestE1rm, last: sessions[sessions.length - 1] };
	});

	const metrics: { id: Metric; name: () => string }[] = [
		{ id: 'e1rm', name: () => t.metricE1rm },
		{ id: 'weight', name: () => t.metricWeight },
		{ id: 'volume', name: () => t.metricVolume }
	];
	const metricName = $derived(metrics.find((m) => m.id === metric)?.name() ?? '');

	const points = $derived(
		sessions.map((s) => ({
			date: s.day,
			value: metric === 'volume' ? metricValue(s, metric) : roundHalf(metricValue(s, metric))
		}))
	);

	const number = $derived(new Intl.NumberFormat(i18n.locale, { maximumFractionDigits: 1 }));
	const compact = $derived(
		new Intl.NumberFormat(i18n.locale, { notation: 'compact', maximumFractionDigits: 1 })
	);
	const dayFormat = $derived(
		new Intl.DateTimeFormat(i18n.locale, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
	);
	const timeFormat = $derived(new Intl.DateTimeFormat(i18n.locale, { timeStyle: 'short' }));

	function formatValue(value: number) {
		return metric === 'volume' && value >= 10_000 ? compact.format(value) : number.format(value);
	}
</script>

<svelte:head>
	<title>{exercise ? `${label} · ` : ''}{t.progress} · {t.appTitle}</title>
</svelte:head>

<main>
	<header>
		<h1>{t.progress}</h1>
	</header>

	{#if isConfigured && !auth.loading && !auth.error}
		<div class="pick">
			<label for="progress-exercise" class="visually-hidden">{t.exercise}</label>
			<ExercisePicker id="progress-exercise" bind:value={picked} {options} />
			{#if exercise}
				<div class="actions">
					<a class="log-link" href={logSetHref(exercise)}>{t.logSet}</a>
					{#if productUrl}
						<a class="product-link" href={productUrl} target="_blank" rel="noopener noreferrer">
							{t.viewOnGym80} <span aria-hidden="true">↗</span>
						</a>
					{/if}
				</div>
			{/if}
		</div>
	{/if}

	{#if !isConfigured}
		<p class="muted">Firebase isn't configured yet. See <code>README.md</code>.</p>
	{:else if auth.error}
		<p class="error">{t.authFailed} {auth.error}</p>
	{:else if error}
		<p class="error">{error}</p>
	{:else if !exercise}
		<section class="card">
			<p class="muted">{t.pickExercise}</p>
		</section>
	{:else if auth.loading || !loaded}
		<p class="muted">{auth.loading ? t.signingIn : '…'}</p>
	{:else if !stats}
		<section class="card">
			<p class="muted">{t.noHistory}</p>
		</section>
	{:else}
		<section class="stats" aria-label={t.progress}>
			<div class="stat">
				<span class="stat-label">{t.bestWeight}</span>
				<span class="stat-value">{number.format(stats.heaviest.weight)} kg</span>
				<span class="stat-sub">× {stats.heaviest.reps}</span>
			</div>
			<div class="stat">
				<span class="stat-label">{t.bestE1rm}</span>
				<span class="stat-value">{number.format(roundHalf(stats.bestE1rm))} kg</span>
			</div>
			<div class="stat">
				<span class="stat-label">{t.totalSets}</span>
				<span class="stat-value">{workouts.length}</span>
				<span class="stat-sub">{dayFormat.format(stats.last.day)}</span>
			</div>
		</section>

		<section class="card">
			<div class="card-head">
				<h2>{t.progress}</h2>
				<div class="segmented" role="radiogroup" aria-label={t.progress}>
					{#each metrics as m (m.id)}
						<button
							type="button"
							role="radio"
							aria-checked={metric === m.id}
							onclick={() => (metric = m.id)}
						>
							{m.name()}
						</button>
					{/each}
				</div>
			</div>

			{#if sessions.length < 2}
				<p class="muted">{t.oneSession}</p>
			{:else}
				<ProgressChart
					{points}
					label={t.chartLabel(label, metricName)}
					unit="kg"
					locale={i18n.locale}
					{formatValue}
				/>
			{/if}
			<p class="hint">{t.metricHint[metric]}</p>
		</section>

		<section class="card">
			<h2>{t.history}</h2>
			<ol class="sessions">
				{#each newestFirst as session (session.day.getTime())}
					<li>
						<div class="session-head">
							<time datetime={toLocalDateString(session.day)}>
								{dayFormat.format(session.day)}
							</time>
							<span class="muted">{t.setCount(session.sets.length)}</span>
						</div>
						<ul class="sets">
							{#each session.sets as set (set.id)}
								<li>
									<span class="set-main">{number.format(set.weight)} kg × {set.reps}</span>
									{#if pbIds.has(set.id)}
										<span class="pb" title={t.personalBestLong}>
											<span aria-hidden="true">★</span>
											{t.personalBest}
										</span>
									{/if}
									<span class="set-time">
										{set.date ? timeFormat.format(set.date) : t.syncing}
									</span>
								</li>
							{/each}
						</ul>
					</li>
				{/each}
			</ol>
		</section>
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
		margin-bottom: 1.5rem;
	}

	h1 {
		font-size: 1.5rem;
		margin: 0;
	}

	.pick {
		margin-bottom: 1rem;
	}

	/* Bigger than the Log form's field: here the exercise is the page title. */
	.pick :global(input) {
		font-size: 1.15rem;
		font-weight: 600;
	}

	.actions {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.5rem 1rem;
		margin-top: 0.75rem;
	}

	/* A link, since it navigates, styled like the app's primary buttons. */
	.log-link {
		background: #4c8dff;
		color: #061021;
		border-radius: 0.5rem;
		padding: 0.55rem 1rem;
		font-size: 0.95rem;
		font-weight: 600;
		text-decoration: none;
	}

	.log-link:focus-visible {
		outline: 2px solid #4c8dff;
		outline-offset: 2px;
	}

	.product-link {
		color: #4c8dff;
		font-size: 0.9rem;
		text-decoration: none;
	}

	.product-link:hover {
		text-decoration: underline;
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

	h2 {
		font-size: 0.8rem;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: #9aa3ad;
		margin: 0;
	}

	.card {
		background: #171a21;
		border: 1px solid #252a33;
		border-radius: 0.75rem;
		padding: 1rem;
		margin-bottom: 1rem;
	}

	.card > h2 {
		margin-bottom: 0.75rem;
	}

	.card-head {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem;
		/* Room for the tooltip, which sits above the plot. */
		margin-bottom: 2.75rem;
	}

	.stats {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 0.5rem;
		margin-bottom: 1rem;
	}

	.stat {
		display: flex;
		flex-direction: column;
		gap: 0.1rem;
		background: #171a21;
		border: 1px solid #252a33;
		border-radius: 0.75rem;
		padding: 0.75rem;
		min-width: 0;
	}

	.stat-label {
		font-size: 0.75rem;
		color: #9aa3ad;
	}

	.stat-value {
		font-size: 1.25rem;
		font-weight: 600;
		color: #e6e8eb;
		white-space: nowrap;
	}

	.stat-sub {
		font-size: 0.75rem;
		color: #78818c;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.segmented {
		display: flex;
		background: #0f1115;
		border: 1px solid #252a33;
		border-radius: 0.5rem;
		padding: 0.15rem;
	}

	.segmented button {
		background: transparent;
		color: #9aa3ad;
		border: none;
		border-radius: 0.35rem;
		padding: 0.3rem 0.6rem;
		font-size: 0.8rem;
		font-family: inherit;
		cursor: pointer;
	}

	.segmented button[aria-checked='true'] {
		background: #252a33;
		color: #e6e8eb;
		font-weight: 600;
	}

	.segmented button:focus-visible {
		outline: 2px solid #4c8dff;
	}

	.sessions,
	.sets {
		list-style: none;
		margin: 0;
		padding: 0;
	}

	.sessions {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.session-head {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		margin-bottom: 0.35rem;
		font-size: 0.85rem;
	}

	.session-head time {
		font-weight: 600;
	}

	.sets {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.sets li {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.45rem 0.75rem;
		background: #0f1115;
		border: 1px solid #252a33;
		border-radius: 0.5rem;
	}

	.set-main {
		font-variant-numeric: tabular-nums;
	}

	.set-time {
		margin-left: auto;
		font-size: 0.75rem;
		color: #78818c;
	}

	.pb {
		font-size: 0.7rem;
		font-weight: 700;
		color: #f5c451;
		background: #3a2f14;
		padding: 0.05rem 0.4rem;
		border-radius: 999px;
	}

	.muted {
		color: #78818c;
		font-size: 0.9rem;
	}

	.hint {
		color: #78818c;
		font-size: 0.75rem;
		margin: 0.75rem 0 0;
	}

	.error {
		color: #ff8080;
		font-size: 0.9rem;
	}


	code {
		background: #0b0d11;
		padding: 0.1rem 0.3rem;
		border-radius: 0.25rem;
		font-size: 0.85em;
	}

	@media (max-width: 26rem) {
		.stat-value {
			font-size: 1.05rem;
		}
	}
</style>
