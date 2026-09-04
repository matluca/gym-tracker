<script lang="ts">
	import { onMount } from 'svelte';

	import { auth, initAuth } from '$lib/firebase/auth.svelte';
	import { isConfigured } from '$lib/firebase/client';
	import {
		addWorkout,
		deleteWorkout,
		subscribeToWorkouts,
		type Workout
	} from '$lib/firebase/workouts';

	let workouts = $state<Workout[]>([]);
	let listError = $state<string | null>(null);
	let saveError = $state<string | null>(null);
	let saving = $state(false);
	let online = $state(true);

	let exercise = $state('');
	let weight = $state<number | null>(null);
	let reps = $state<number | null>(null);

	const canSubmit = $derived(
		exercise.trim().length > 0 &&
			weight !== null &&
			weight > 0 &&
			reps !== null &&
			reps > 0 &&
			!saving
	);

	onMount(() => {
		if (isConfigured) initAuth();

		online = navigator.onLine;
		const goOnline = () => (online = true);
		const goOffline = () => (online = false);
		window.addEventListener('online', goOnline);
		window.addEventListener('offline', goOffline);

		return () => {
			window.removeEventListener('online', goOnline);
			window.removeEventListener('offline', goOffline);
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
				reps: reps as number
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
		if (!date) return 'syncing…';
		return new Intl.DateTimeFormat(undefined, {
			dateStyle: 'medium',
			timeStyle: 'short'
		}).format(date);
	}
</script>

<svelte:head>
	<title>Gym Tracker</title>
	<meta name="description" content="A simple offline-capable workout log." />
</svelte:head>

<main>
	<header>
		<h1>Gym Tracker</h1>
		{#if !online}
			<span class="badge badge--offline">Offline — changes sync when you reconnect</span>
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
			<strong>Auth failed.</strong>
			<p>{auth.error}</p>
			<p class="hint">
				If this says the sign-in method is disabled, enable <em>Anonymous</em> under Firebase Console
				→ Authentication → Sign-in method.
			</p>
		</div>
	{:else if auth.loading}
		<p class="muted">Signing in…</p>
	{:else}
		<section class="card">
			<h2>Log a set</h2>
			<form onsubmit={handleSubmit}>
				<label>
					<span>Exercise</span>
					<input bind:value={exercise} placeholder="Back squat" autocomplete="off" required />
				</label>
				<div class="row">
					<label>
						<span>Weight (kg)</span>
						<input type="number" bind:value={weight} min="0" step="0.5" placeholder="80" required />
					</label>
					<label>
						<span>Reps</span>
						<input type="number" bind:value={reps} min="1" step="1" placeholder="5" required />
					</label>
				</div>
				<button type="submit" disabled={!canSubmit}>
					{saving ? 'Saving…' : 'Add set'}
				</button>
			</form>
			{#if saveError}
				<p class="error">{saveError}</p>
			{/if}
		</section>

		<section class="card">
			<h2>Recent sets</h2>
			{#if listError}
				<p class="error">{listError}</p>
			{:else if workouts.length === 0}
				<p class="muted">Nothing logged yet. Add your first set above.</p>
			{:else}
				<ul class="workouts">
					{#each workouts as workout (workout.id)}
						<li>
							<div>
								<span class="exercise">{workout.exercise}</span>
								<span class="detail">{workout.weight} kg × {workout.reps}</span>
								<time>{formatDate(workout.createdAt)}</time>
							</div>
							<button
								class="delete"
								onclick={() => handleDelete(workout.id)}
								aria-label="Delete {workout.exercise} set"
							>
								Delete
							</button>
						</li>
					{/each}
				</ul>
			{/if}
		</section>

		<footer>
			<span class="muted">Signed in anonymously as <code>{auth.user?.uid.slice(0, 8)}…</code></span>
		</footer>
	{/if}
</main>

<style>
	:global(body) {
		margin: 0;
		background: #0f1115;
		color: #e6e8eb;
		font-family: system-ui, -apple-system, 'Segoe UI', sans-serif;
		line-height: 1.5;
	}

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
