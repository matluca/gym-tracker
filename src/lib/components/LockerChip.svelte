<script lang="ts">
	/**
	 * Today's locker number at the top of the Log tab: a quiet "+ Locker"
	 * button when unset, a chip with the number once set. Tapping either opens
	 * an inline number field. See locker.svelte.ts for how it expires.
	 */
	import { onMount } from 'svelte';

	import { i18n } from '#lib/i18n.svelte.js';
	import { locker, refreshLockerDay } from '#lib/locker.svelte.js';

	const t = $derived(i18n.t);

	let editing = $state(false);
	let draft = $state('');
	let inputEl = $state<HTMLInputElement>();

	onMount(() => {
		refreshLockerDay();
		window.addEventListener('focus', refreshLockerDay);
		document.addEventListener('visibilitychange', refreshLockerDay);
		return () => {
			window.removeEventListener('focus', refreshLockerDay);
			document.removeEventListener('visibilitychange', refreshLockerDay);
		};
	});

	$effect(() => {
		if (editing) inputEl?.focus();
	});

	function startEditing() {
		draft = locker.number === null ? '' : String(locker.number);
		editing = true;
	}

	function save(event?: SubmitEvent) {
		event?.preventDefault();
		const value = draft.trim();
		// Digits only: the number keypad can still let a stray "." or "-" through.
		if (/^\d{1,6}$/.test(value)) locker.number = Number(value);
		else if (value === '') locker.number = null;
		editing = false;
	}

	function clear() {
		locker.number = null;
		editing = false;
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			event.preventDefault();
			editing = false;
		}
	}
</script>

<div class="locker">
	{#if editing}
		<form onsubmit={save}>
			<label for="locker-number">{t.locker}</label>
			<input
				id="locker-number"
				bind:this={inputEl}
				bind:value={draft}
				type="text"
				inputmode="numeric"
				pattern="[0-9]*"
				maxlength="6"
				autocomplete="off"
				onkeydown={handleKeydown}
			/>
			<button type="submit" class="save">{t.lockerSave}</button>
			{#if locker.number !== null}
				<button type="button" class="clear" onclick={clear}>{t.lockerClear}</button>
			{/if}
		</form>
	{:else if locker.number !== null}
		<button
			type="button"
			class="chip"
			onclick={startEditing}
			aria-label={t.lockerChange(locker.number)}
		>
			<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
				<rect x="5" y="11" width="14" height="10" rx="2" fill="currentColor" />
				<path d="M8 11V8a4 4 0 0 1 8 0v3" fill="none" stroke="currentColor" stroke-width="2" />
			</svg>
			<span class="number">{locker.number}</span>
		</button>
	{:else}
		<button type="button" class="add" onclick={startEditing}>+ {t.locker}</button>
	{/if}
</div>

<style>
	.locker {
		display: flex;
		margin-bottom: 1rem;
	}

	form {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		flex-wrap: wrap;
	}

	label {
		font-size: 0.85rem;
		color: #9aa3ad;
	}

	input {
		width: 6rem;
		box-sizing: border-box;
		background: #0f1115;
		border: 1px solid #2d333d;
		border-radius: 0.5rem;
		padding: 0.45rem 0.6rem;
		color: #e6e8eb;
		font-size: 1rem;
		font-family: inherit;
	}

	input:focus-visible,
	button:focus-visible {
		outline: 2px solid #4c8dff;
		outline-offset: 1px;
	}

	button {
		font-family: inherit;
		cursor: pointer;
	}

	.save {
		background: #4c8dff;
		color: #061021;
		border: none;
		border-radius: 0.5rem;
		padding: 0.45rem 0.8rem;
		font-size: 0.9rem;
		font-weight: 600;
	}

	.clear,
	.add {
		background: none;
		border: none;
		padding: 0.3rem 0;
		color: #4c8dff;
		font-size: 0.85rem;
		font-weight: 500;
	}

	.chip {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		background: #171a21;
		border: 1px solid #252a33;
		border-radius: 999px;
		padding: 0.3rem 0.8rem 0.3rem 0.6rem;
		color: #e6e8eb;
	}

	.chip svg {
		color: #9aa3ad;
	}

	.number {
		font-size: 1rem;
		font-weight: 600;
		font-variant-numeric: tabular-nums;
	}
</style>
