<script lang="ts">
	/**
	 * "Delete account" card for the Account tab, with an inline confirmation.
	 *
	 * Email accounts confirm with their password (Firebase also needs it to
	 * allow the deletion). Anonymous users have no password, so they type a
	 * confirmation word instead — for them it's "delete my data".
	 */
	import { auth, authErrorCode, deleteAccount } from '#lib/firebase/auth.svelte.js';
	import { i18n } from '#lib/i18n.svelte.js';

	let { onDeleted }: { onDeleted: (message: string) => void } = $props();

	const t = $derived(i18n.t);

	let confirming = $state(false);
	let password = $state('');
	let typed = $state('');
	let busy = $state(false);
	let error = $state<string | null>(null);

	const anonymous = $derived(auth.isAnonymous);
	const canDelete = $derived(
		!busy &&
			(anonymous
				? typed.trim().toUpperCase() === t.deleteConfirmWord.toUpperCase()
				: password.length > 0)
	);

	function reset() {
		confirming = false;
		password = '';
		typed = '';
		error = null;
	}

	async function handleDelete(event: SubmitEvent) {
		event.preventDefault();
		if (!canDelete) return;
		if (!navigator.onLine) {
			error = t.deleteNeedsOnline;
			return;
		}

		const wasAnonymous = anonymous;
		busy = true;
		error = null;
		try {
			await deleteAccount(wasAnonymous ? undefined : password);
			reset();
			onDeleted(wasAnonymous ? t.dataDeleted : t.deleted);
		} catch (e) {
			const code = authErrorCode(e);
			error = (code && t.authErrors[code]) || t.authErrorGeneric;
		} finally {
			busy = false;
		}
	}
</script>

<section class="danger-zone">
	<h2>{anonymous ? t.deleteData : t.deleteAccount}</h2>
	<p>{anonymous ? t.deleteDataBody : t.deleteAccountBody}</p>

	{#if !confirming}
		<button type="button" class="danger" onclick={() => (confirming = true)}>
			{anonymous ? t.deleteData : t.deleteAccount}
		</button>
	{:else}
		<form onsubmit={handleDelete}>
			{#if anonymous}
				<label>
					<span>{t.deleteConfirmType(t.deleteConfirmWord)}</span>
					<input
						bind:value={typed}
						autocomplete="off"
						autocapitalize="characters"
						spellcheck="false"
						required
					/>
				</label>
			{:else}
				<!-- Lets password managers fill the right entry. -->
				<input type="email" class="visually-hidden" value={auth.email ?? ''} autocomplete="username" readonly tabindex="-1" aria-hidden="true" />
				<label>
					<span>{t.deleteConfirmPassword}</span>
					<input type="password" bind:value={password} autocomplete="current-password" required />
				</label>
			{/if}

			<div class="actions">
				<button type="button" class="secondary" onclick={reset} disabled={busy}>
					{t.cancel}
				</button>
				<button type="submit" class="destroy" disabled={!canDelete}>
					{busy ? t.working : t.deleteForever}
				</button>
			</div>
		</form>
	{/if}

	{#if error}
		<p class="error" role="alert">{error}</p>
	{/if}
</section>

<style>
	.danger-zone {
		border: 1px solid #45262a;
		border-radius: 0.75rem;
		padding: 1rem;
		margin-bottom: 1rem;
	}

	h2 {
		font-size: 1rem;
		color: #ffb3b3;
		margin: 0 0 0.35rem;
	}

	p {
		color: #9aa3ad;
		font-size: 0.85rem;
		margin: 0 0 0.75rem;
	}

	form {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
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

	input:focus-visible,
	button:focus-visible {
		outline: 2px solid #4c8dff;
		outline-offset: 1px;
	}

	.actions {
		display: flex;
		gap: 0.5rem;
	}

	.actions button {
		flex: 1;
	}

	button {
		border-radius: 0.5rem;
		padding: 0.6rem 1rem;
		font-size: 0.9rem;
		font-weight: 600;
		font-family: inherit;
		cursor: pointer;
	}

	button:disabled {
		opacity: 0.45;
		cursor: not-allowed;
	}

	.danger {
		width: 100%;
		background: transparent;
		color: #ff8080;
		border: 1px solid #45262a;
	}

	.secondary {
		background: transparent;
		color: #c3c9d1;
		border: 1px solid #2d333d;
	}

	.destroy {
		background: #d64545;
		color: #fff;
		border: none;
	}

	.error {
		color: #ff8080;
		margin: 0.75rem 0 0;
	}

	.visually-hidden {
		position: absolute;
		width: 1px;
		height: 1px;
		margin: -1px;
		padding: 0;
		border: 0;
		overflow: hidden;
		clip: rect(0 0 0 0);
		white-space: nowrap;
	}
</style>
