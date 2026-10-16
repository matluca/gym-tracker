<script lang="ts">
	import { onMount } from 'svelte';

	import ExercisePicker from '#lib/components/ExercisePicker.svelte';
	import InstallHint from '#lib/components/InstallHint.svelte';
	import { auth } from '#lib/firebase/auth.svelte.js';
	import { isConfigured } from '#lib/firebase/client.js';
	import {
		addExercise,
		buildExerciseOptions,
		exerciseLabel,
		exerciseHref,
		subscribeToExercises
	} from '#lib/firebase/exercises.js';
	import {
		addWorkout,
		deleteWorkout,
		subscribeToWorkouts,
		type Workout
	} from '#lib/firebase/workouts.js';
	import { atCurrentTime, toLocalDateString } from '#lib/dates.js';
	import { i18n } from '#lib/i18n.svelte.js';
	import { byExercise } from '#lib/progress.js';

	const t = $derived(i18n.t);

	let workouts = $state<Workout[]>([]);
	let customExercises = $state<string[]>([]);
	let listError = $state<string | null>(null);
	let saveError = $state<string | null>(null);
	let saving = $state(false);
	let online = $state(true);

	let exercise = $state('');
	// Set once the field has been prefilled (or the user has picked something),
	// so later snapshots never overwrite their choice.
	let exerciseTouched = false;
	let weight = $state<number | null>(null);
	let reps = $state<number | null>(null);
	// Kept after saving, so several sets can be backdated in a row.
	let date = $state(toLocalDateString(new Date()));

	// Recomputed on focus so a tab left open overnight doesn't cap at yesterday.
	let today = $state(toLocalDateString(new Date()));
	const isToday = $derived(date === today);

	// Today's sets grouped by exercise, in the order you trained them. Filtered
	// from the recent-sets subscription (50 most recently entered), which covers
	// a day's training without a second listener.
	const todaysGroups = $derived(
		byExercise(
			workouts.filter((w) => toLocalDateString(w.date ?? new Date()) === today).reverse() // subscription is newest first
		)
	);

	const exerciseOptions = $derived(
		buildExerciseOptions(
			customExercises,
			workouts.map((w) => w.exercise),
			i18n.locale
		)
	);

	const canSubmit = $derived(
		exercise.trim().length > 0 &&
			weight !== null &&
			weight > 0 &&
			date !== '' &&
			date <= today &&
			reps !== null &&
			reps > 0 &&
			!saving
	);

	onMount(() => {
		const refreshToday = () => {
			const next = toLocalDateString(new Date());
			// Roll the selection forward too if it was on "today".
			if (date === today) date = next;
			today = next;
		};
		window.addEventListener('focus', refreshToday);

		online = navigator.onLine;
		const goOnline = () => (online = true);
		const goOffline = () => (online = false);
		window.addEventListener('online', goOnline);
		window.addEventListener('offline', goOffline);

		return () => {
			window.removeEventListener('online', goOnline);
			window.removeEventListener('offline', goOffline);
			window.removeEventListener('focus', refreshToday);
		};
	});

	// Re-subscribes whenever the signed-in user changes, and tears the previous
	// listener down via the returned cleanup.
	$effect(() => {
		const uid = auth.user?.uid;
		if (!uid) return;

		return subscribeToWorkouts(
			uid,
			(next) => {
				workouts = next;
				listError = null;
				// Wait for a non-empty snapshot: the first one can come from an empty
				// local cache before server data arrives.
				if (!exerciseTouched && next.length > 0) {
					if (exercise === '') exercise = lastEntered(next)?.exercise ?? '';
					exerciseTouched = true;
				}
			},
			(error) => (listError = error.message)
		);
	});

	$effect(() => {
		const uid = auth.user?.uid;
		if (!uid) return;

		return subscribeToExercises(
			uid,
			(next) => (customExercises = next),
			(error) => (saveError = error.message)
		);
	});

	function handleAddExercise(name: string) {
		const uid = auth.user?.uid;
		if (!uid) return;
		// Optimistic: show it straight away. Not awaited — the promise only
		// settles on server ack, which never comes while offline.
		customExercises = [...customExercises, name];
		addExercise(uid, name).catch((error) => {
			saveError = error instanceof Error ? error.message : String(error);
		});
	}

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		const uid = auth.user?.uid;
		if (!uid || !canSubmit) return;

		saving = true;
		saveError = null;
		try {
			await addWorkout(uid, {
				exercise: exercise.trim(),
				weight: weight as number,
				reps: reps as number,
				performedAt: atCurrentTime(date)
			});
			// Exercise stays selected for the next set; only the numbers reset.
			weight = null;
			reps = null;
		} catch (error) {
			saveError = error instanceof Error ? error.message : String(error);
		} finally {
			saving = false;
		}
	}

	async function handleDelete(id: string) {
		const uid = auth.user?.uid;
		if (!uid) return;
		try {
			await deleteWorkout(uid, id);
		} catch (error) {
			saveError = error instanceof Error ? error.message : String(error);
		}
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

	function formatTime(date: Date | null): string {
		if (!date) return t.syncing;
		return new Intl.DateTimeFormat(i18n.locale, { timeStyle: 'short' }).format(date);
	}
</script>

<svelte:head>
	<title>{t.appTitle}</title>
	<meta name="description" content={t.appDescription} />
</svelte:head>

<main>
	<header>
		<h1>{t.appTitle}</h1>
		{#if !online}
			<span class="badge badge--offline">{t.offline}</span>
		{/if}
	</header>

	{#if !isConfigured}
		<div class="notice notice--warn">
			<strong>Firebase isn't configured yet.</strong>
			<p>
				Copy <code>.env.example</code> to <code>.env</code>, paste in your Firebase web app config,
				then restart the dev server. See <code>README.md</code> for the walkthrough.
			</p>
		</div>
	{:else if auth.error}
		<div class="notice notice--error">
			<strong>{t.authFailed}</strong>
			<p>{auth.error}</p>
			<p class="hint">{t.authHint}</p>
		</div>
	{:else if auth.loading}
		<p class="muted">{t.signingIn}</p>
	{:else}
		<InstallHint />

		<section class="card">
			<h2>{t.logSet}</h2>
			<form onsubmit={handleSubmit}>
				<div class="field">
					<label for="exercise">{t.exercise}</label>
					<ExercisePicker
						id="exercise"
						bind:value={exercise}
						options={exerciseOptions}
						onAdd={handleAddExercise}
					/>
				</div>
				<div class="field">
					<div class="label-row">
						<label for="date">{t.date}</label>
						{#if !isToday}
							<button type="button" class="link" onclick={() => (date = today)}>
								{t.today}
							</button>
						{/if}
					</div>
					<input id="date" type="date" bind:value={date} max={today} required />
				</div>
				<div class="row">
					<label>
						<span>{t.weightKg}</span>
						<input type="number" bind:value={weight} min="0" step="0.5" placeholder="80" required />
					</label>
					<label>
						<span>{t.reps}</span>
						<input type="number" bind:value={reps} min="1" step="1" placeholder="5" required />
					</label>
				</div>
				<button type="submit" disabled={!canSubmit}>
					{saving ? t.saving : t.addSet}
				</button>
			</form>
			{#if saveError}
				<p class="error">{saveError}</p>
			{/if}
		</section>

		<section class="card">
			<h2>{t.todaysSets}</h2>
			{#if listError}
				<p class="error">{listError}</p>
			{:else if todaysGroups.length === 0}
				<p class="muted">{t.noSetsToday}</p>
			{:else}
				<div class="groups">
					{#each todaysGroups as group (group.exercise)}
						{@const name = exerciseLabel(group.exercise, i18n.locale)}
						<div class="group">
							<div class="group-head">
								<a class="exercise" href={exerciseHref(group.exercise)} aria-label={t.viewHistory(name)}>
									{name}
								</a>
								<span class="muted">{t.setCount(group.sets.length)}</span>
							</div>
							<ul class="workouts">
								{#each group.sets as workout (workout.id)}
									<li>
										<span class="detail">{workout.weight} kg × {workout.reps}</span>
										<time>{formatTime(workout.date)}</time>
										<button
											class="delete"
											onclick={() => handleDelete(workout.id)}
											aria-label={t.deleteSet(name)}
										>
											{t.delete}
										</button>
									</li>
								{/each}
							</ul>
						</div>
					{/each}
				</div>
			{/if}
			{#if !isToday}
				<p class="hint-muted">{t.otherDayHint}</p>
			{/if}
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
		flex-wrap: wrap;
		align-items: baseline;
		gap: 0.75rem;
		margin-bottom: 1.5rem;
	}

	h1 {
		font-size: 1.5rem;
		margin: 0;
	}

	h2 {
		font-size: 0.8rem;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: #9aa3ad;
		margin: 0 0 0.75rem;
	}

	.card {
		background: #171a21;
		border: 1px solid #252a33;
		border-radius: 0.75rem;
		padding: 1rem;
		margin-bottom: 1rem;
	}

	form {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.row {
		display: flex;
		gap: 0.75rem;
	}

	.row label {
		flex: 1;
		/* Flex items won't shrink below their content by default, and number
		   inputs have a wide intrinsic size — side by side they overflow a phone,
		   which then zooms the whole page out and pushes the tab bar off-screen. */
		min-width: 0;
	}

	.field {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		font-size: 0.85rem;
		color: #9aa3ad;
	}

	.label-row {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
	}

	button.link {
		background: none;
		border: none;
		padding: 0;
		color: #4c8dff;
		font-size: 0.85rem;
		font-weight: 500;
	}

	/* Native picker icon is dark by default; match the dark theme. */
	input[type='date'] {
		color-scheme: dark;
	}

	label {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		font-size: 0.85rem;
		color: #9aa3ad;
	}

	input {
		width: 100%;
		min-width: 0;
		box-sizing: border-box;
		background: #0f1115;
		border: 1px solid #2d333d;
		border-radius: 0.5rem;
		padding: 0.6rem 0.7rem;
		color: #e6e8eb;
		font-size: 1rem;
		font-family: inherit;
	}

	input:focus-visible {
		outline: 2px solid #4c8dff;
		outline-offset: 1px;
	}

	button {
		background: #4c8dff;
		color: #061021;
		border: none;
		border-radius: 0.5rem;
		padding: 0.65rem 1rem;
		font-size: 0.95rem;
		font-weight: 600;
		font-family: inherit;
		cursor: pointer;
	}

	button:disabled {
		opacity: 0.45;
		cursor: not-allowed;
	}

	.groups {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.group-head {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		margin-bottom: 0.35rem;
	}

	.hint-muted {
		color: #78818c;
		font-size: 0.8rem;
		margin: 0.75rem 0 0;
	}

	.workouts {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.workouts li {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.4rem 0.4rem 0.4rem 0.75rem;
		background: #0f1115;
		border: 1px solid #252a33;
		border-radius: 0.5rem;
	}

	.exercise {
		font-weight: 600;
		margin-right: 0.5rem;
		color: inherit;
		text-decoration: underline;
		text-decoration-color: #4a525e;
		text-underline-offset: 0.2em;
	}

	.exercise:hover {
		text-decoration-color: #4c8dff;
	}

	.detail {
		color: #c3c9d1;
		font-variant-numeric: tabular-nums;
	}

	time {
		margin-left: auto;
		font-size: 0.75rem;
		color: #78818c;
	}

	.delete {
		background: transparent;
		color: #ff8080;
		border: 1px solid #45262a;
		padding: 0.35rem 0.6rem;
		font-size: 0.8rem;
		font-weight: 500;
	}

	.badge {
		font-size: 0.75rem;
		padding: 0.2rem 0.5rem;
		border-radius: 999px;
	}

	.badge--offline {
		background: #3a2f14;
		color: #f5c451;
	}

	.notice {
		border-radius: 0.75rem;
		padding: 1rem;
		margin-bottom: 1rem;
	}

	.notice p {
		margin: 0.5rem 0 0;
		font-size: 0.9rem;
	}

	.notice--warn {
		background: #241f0f;
		border: 1px solid #4a3d18;
		color: #f0d089;
	}

	.notice--error {
		background: #2a1618;
		border: 1px solid #4d2429;
		color: #ffb3b3;
	}

	.error {
		color: #ff8080;
		font-size: 0.9rem;
		margin: 0.75rem 0 0;
	}

	.muted {
		color: #78818c;
		font-size: 0.9rem;
	}

	.hint {
		color: #c99b9b;
		font-size: 0.85rem;
	}

	code {
		background: #0b0d11;
		padding: 0.1rem 0.3rem;
		border-radius: 0.25rem;
		font-size: 0.85em;
	}

</style>
