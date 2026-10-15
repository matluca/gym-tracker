<script lang="ts">
	import { onMount } from 'svelte';

	import ExercisePicker, { type PickerOption } from '$lib/components/ExercisePicker.svelte';
	import LocaleSwitcher from '$lib/components/LocaleSwitcher.svelte';
	import { auth } from '$lib/firebase/auth.svelte';
	import { isConfigured } from '$lib/firebase/client';
	import {
		addExercise,
		DEFAULT_EXERCISES,
		exerciseLabel,
		exerciseHref,
		subscribeToExercises
	} from '$lib/firebase/exercises';
	import {
		addWorkout,
		deleteWorkout,
		subscribeToWorkouts,
		type Workout
	} from '$lib/firebase/workouts';
	import { atCurrentTime, toLocalDateString } from '$lib/dates';
	import { i18n } from '$lib/i18n.svelte';

	const t = $derived(i18n.t);

	let workouts = $state<Workout[]>([]);
	let customExercises = $state<string[]>([]);
	let listError = $state<string | null>(null);
	let saveError = $state<string | null>(null);
	let saving = $state(false);
	let online = $state(true);

	let exercise = $state('');
	let weight = $state<number | null>(null);
	let reps = $state<number | null>(null);
	// Kept after saving, so several sets can be backdated in a row.
	let date = $state(toLocalDateString(new Date()));

	// Recomputed on focus so a tab left open overnight doesn't cap at yesterday.
	let today = $state(toLocalDateString(new Date()));
	const isToday = $derived(date === today);

	// Built-ins + the user's own, de-duplicated case-insensitively. Exercises
	// that only appear in logged sets are included too, so history from before
	// the picker existed stays selectable.
	const exerciseOptions = $derived.by((): PickerOption[] => {
		const byKey = new Map<string, PickerOption>();
		for (const name of [
			...DEFAULT_EXERCISES.map((e) => e.en),
			...customExercises,
			...workouts.map((w) => w.exercise)
		]) {
			const value = name.trim();
			const key = value.toLowerCase();
			if (key && !byKey.has(key)) {
				byKey.set(key, { value, label: exerciseLabel(value, i18n.locale) });
			}
		}
		return [...byKey.values()];
	});

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
			exercise = '';
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

	function formatDate(date: Date | null): string {
		if (!date) return t.syncing;
		return new Intl.DateTimeFormat(i18n.locale, {
			dateStyle: 'medium',
			timeStyle: 'short'
		}).format(date);
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
		<div class="locale">
			<LocaleSwitcher />
		</div>
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
			<h2>{t.recentSets}</h2>
			{#if listError}
				<p class="error">{listError}</p>
			{:else if workouts.length === 0}
				<p class="muted">{t.noSets}</p>
			{:else}
				<ul class="workouts">
					{#each workouts as workout (workout.id)}
						<li>
							<div>
								<a
									class="exercise"
									href={exerciseHref(workout.exercise)}
									aria-label={t.viewHistory(exerciseLabel(workout.exercise, i18n.locale))}
								>
									{exerciseLabel(workout.exercise, i18n.locale)}
								</a>
								<span class="detail">{workout.weight} kg × {workout.reps}</span>
								<time>{formatDate(workout.date)}</time>
							</div>
							<button
								class="delete"
								onclick={() => handleDelete(workout.id)}
								aria-label={t.deleteSet(exerciseLabel(workout.exercise, i18n.locale))}
							>
								{t.delete}
							</button>
						</li>
					{/each}
				</ul>
			{/if}
		</section>

		<footer>
			<span class="muted">{t.signedInAs} <code>{auth.user?.uid.slice(0, 8)}…</code></span>
		</footer>
	{/if}
</main>

<style>
	main {
		max-width: 34rem;
		margin: 0 auto;
		padding: 1.5rem 1rem 4rem;
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

	.workouts {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.workouts li {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.75rem;
		padding: 0.6rem 0.75rem;
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
	}

	time {
		display: block;
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

	.locale {
		margin-left: auto;
		/* The header aligns on text baseline; the flags have none. */
		align-self: center;
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

	footer {
		margin-top: 1.5rem;
		text-align: center;
	}
</style>
