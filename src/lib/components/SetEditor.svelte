<script lang="ts">
	/**
	 * Inline form for changing a logged set's exercise, weight and reps. Shown
	 * in place of the set row; the parent decides when it closes.
	 */
	import ExercisePicker, { type PickerOption } from '#lib/components/ExercisePicker.svelte';
	import { auth } from '#lib/firebase/auth.svelte.js';
	import { updateWorkout, type Workout } from '#lib/firebase/workouts.js';
	import { i18n } from '#lib/i18n.svelte.js';

	let {
		workout,
		options,
		onDone
	}: {
		workout: Workout;
		options: PickerOption[];
		onDone: () => void;
	} = $props();

	const t = $derived(i18n.t);

	// Seeded once from the set being edited; the parent keys this component
	// by set id, so a different set mounts a fresh editor.
	// svelte-ignore state_referenced_locally
	let exercise = $state(workout.exercise);
	// svelte-ignore state_referenced_locally
	let weight = $state<number | null>(workout.weight);
	// svelte-ignore state_referenced_locally
	let reps = $state<number | null>(workout.reps);
	let saving = $state(false);
	let error = $state<string | null>(null);

	const canSave = $derived(
		exercise.trim().length > 0 &&
			weight !== null &&
			weight >= 0 &&
			reps !== null &&
			reps > 0 &&
			!saving
	);

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		const uid = auth.user?.uid;
		if (!uid || !canSave) return;

		saving = true;
		error = null;
		try {
			await updateWorkout(uid, workout.id, {
				exercise: exercise.trim(),
				weight: weight as number,
				reps: reps as number
			});
			onDone();
		} catch (e) {
			error = e instanceof Error ? e.message : String(e);
		} finally {
			saving = false;
		}
	}
</script>

<form onsubmit={handleSubmit} aria-label={t.editSet(workout.exercise)}>
	<ExercisePicker id="edit-exercise-{workout.id}" bind:value={exercise} {options} />
	<div class="row">
		<label>
			<span>{t.weightKg}</span>
			<input type="number" bind:value={weight} min="0" step="0.5" required />
		</label>
		<label>
			<span>{t.reps}</span>
			<input type="number" bind:value={reps} min="1" step="1" required />
		</label>
	</div>
	<div class="actions">
		<button type="button" class="cancel" onclick={onDone} disabled={saving}>{t.cancel}</button>
		<button type="submit" disabled={!canSave}>
			{saving ? t.saving : t.saveChanges}
		</button>
	</div>
	{#if error}
		<p class="error">{error}</p>
	{/if}
</form>

<style>
	form {
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
		width: 100%;
	}

	.row {
		display: flex;
		gap: 0.75rem;
	}

	.row label {
		flex: 1;
		min-width: 0;
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
		padding: 0.5rem 0.6rem;
		color: #e6e8eb;
		font-size: 1rem;
		font-family: inherit;
	}

	input:focus-visible {
		outline: 2px solid #4c8dff;
		outline-offset: 1px;
	}

	.actions {
		display: flex;
		justify-content: flex-end;
		gap: 0.5rem;
	}

	button {
		background: #4c8dff;
		color: #061021;
		border: none;
		border-radius: 0.5rem;
		padding: 0.5rem 0.9rem;
		font-size: 0.9rem;
		font-weight: 600;
		font-family: inherit;
		cursor: pointer;
	}

	button:disabled {
		opacity: 0.45;
		cursor: not-allowed;
	}

	.cancel {
		background: transparent;
		color: #9aa3ad;
		border: 1px solid #2d333d;
	}

	.error {
		color: #ff8080;
		font-size: 0.85rem;
		margin: 0;
	}
</style>
