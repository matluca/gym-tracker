<script lang="ts">
	import { resolve } from '$app/paths';

	import LocaleSwitcher from '$lib/components/LocaleSwitcher.svelte';
	import {
		auth,
		authErrorCode,
		createAccount,
		refreshUser,
		resendVerification,
		resetPassword,
		signIn,
		signOutUser
	} from '$lib/firebase/auth.svelte';
	import { isConfigured } from '$lib/firebase/client';
	import { i18n } from '$lib/i18n.svelte';

	const t = $derived(i18n.t);

	type Mode = 'create' | 'signin' | 'reset';

	let mode = $state<Mode>('create');
	let email = $state('');
	let password = $state('');
	let busy = $state(false);
	let error = $state<string | null>(null);
	/** Success message shown after an action (reset sent, data copied, …). */
	let notice = $state<string | null>(null);
	let verifySent = $state(false);

	const MIN_PASSWORD = 8;

	const canSubmit = $derived(
		!busy &&
			email.trim().length > 0 &&
			(mode === 'reset' || password.length >= (mode === 'create' ? MIN_PASSWORD : 1))
	);

	function switchMode(next: Mode) {
		mode = next;
		error = null;
		notice = null;
	}

	function message(e: unknown): string {
		const code = authErrorCode(e);
		return (code && t.authErrors[code]) || t.authErrorGeneric;
	}

	async function run(action: () => Promise<void>) {
		busy = true;
		error = null;
		notice = null;
		try {
			await action();
		} catch (e) {
			error = message(e);
		} finally {
			busy = false;
		}
	}

	function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		if (!canSubmit) return;
		const address = email.trim();

		run(async () => {
			if (mode === 'create') {
				await createAccount(address, password);
			} else if (mode === 'signin') {
				const copied = await signIn(address, password, (e) => (error = e.message));
				if (copied.sets > 0) notice = t.copied(copied.sets);
			} else {
				await resetPassword(address);
				notice = t.resetSent(address);
				return;
			}
			password = '';
		});
	}

	function handleSignOut() {
		run(async () => {
			await signOutUser();
			mode = 'signin';
			email = '';
		});
	}

	function handleResend() {
		run(async () => {
			await resendVerification();
			verifySent = true;
		});
	}

	// Pick up a verification completed in another tab when coming back to this one.
	$effect(() => {
		if (auth.isAnonymous || auth.emailVerified) return;
		const onFocus = () => refreshUser().catch(() => {});
		window.addEventListener('focus', onFocus);
		return () => window.removeEventListener('focus', onFocus);
	});
</script>

<svelte:head>
	<title>{t.account} · {t.appTitle}</title>
</svelte:head>

<main>
	<header>
		<h1>{t.account}</h1>
		<div class="locale">
			<LocaleSwitcher />
		</div>
	</header>

	{#if !isConfigured}
		<p class="muted">Firebase isn't configured yet. See <code>README.md</code>.</p>
	{:else if auth.error}
		<p class="error">{t.authFailed} {auth.error}</p>
	{:else if auth.loading}
		<p class="muted">{t.signingIn}</p>
	{:else if !auth.isAnonymous}
		<!-- Signed in with email -->
		<section class="card">
			<p class="label">{t.signedInAsEmail}</p>
			<p class="email">{auth.email}</p>

			{#if auth.emailVerified}
				<p class="ok"><span aria-hidden="true">✓</span> {t.verified}</p>
			{:else}
				<div class="notice">
					<p>{t.verifyPending}</p>
					<div class="actions">
						<button type="button" class="secondary" onclick={handleResend} disabled={busy}>
							{t.verifyResend}
						</button>
						<button
							type="button"
							class="secondary"
							onclick={() => run(refreshUser)}
							disabled={busy}
						>
							{t.verifyDone}
						</button>
					</div>
					{#if verifySent}
						<p class="hint">{t.verifySent}</p>
					{/if}
				</div>
			{/if}

			{#if notice}
				<p class="ok" role="status">{notice}</p>
			{/if}
			{#if error}
				<p class="error" role="alert">{error}</p>
			{/if}
		</section>

		<section class="card">
			<button type="button" class="danger" onclick={handleSignOut} disabled={busy}>
				{t.signOut}
			</button>
			<p class="hint">{t.signOutNote}</p>
		</section>
	{:else}
		<!-- Anonymous: create an account or sign in -->
		<section class="card">
			{#if mode !== 'reset'}
				<div class="tabs" role="tablist">
					<button
						type="button"
						role="tab"
						aria-selected={mode === 'create'}
						onclick={() => switchMode('create')}
					>
						{t.createAccount}
					</button>
					<button
						type="button"
						role="tab"
						aria-selected={mode === 'signin'}
						onclick={() => switchMode('signin')}
					>
						{t.signIn}
					</button>
				</div>
			{/if}

			{#if mode === 'create'}
				<h2>{t.accountGuestTitle}</h2>
				<p class="body">{t.accountGuestBody}</p>
			{:else if mode === 'signin'}
				<p class="body">{t.signInMergeNote}</p>
			{:else}
				<h2>{t.forgotPassword}</h2>
			{/if}

			<form onsubmit={handleSubmit}>
				<label>
					<span>{t.email}</span>
					<input
						type="email"
						bind:value={email}
						autocomplete="email"
						inputmode="email"
						autocapitalize="off"
						spellcheck="false"
						required
					/>
				</label>

				{#if mode !== 'reset'}
					<label>
						<span>{t.password}</span>
						<input
							type="password"
							bind:value={password}
							autocomplete={mode === 'create' ? 'new-password' : 'current-password'}
							minlength={mode === 'create' ? MIN_PASSWORD : undefined}
							required
						/>
						{#if mode === 'create'}
							<small>{t.passwordHint}</small>
						{/if}
					</label>
				{/if}

				{#if mode === 'create'}
					<p class="fine">
						{t.privacySignupNote} <a href={resolve('/privacy')}>{t.privacyLink}</a>
					</p>
				{/if}

				<button type="submit" disabled={!canSubmit}>
					{busy
						? t.working
						: mode === 'create'
							? t.createAccount
							: mode === 'signin'
								? t.signIn
								: t.sendResetLink}
				</button>
			</form>

			{#if notice}
				<p class="ok" role="status">{notice}</p>
			{/if}
			{#if error}
				<p class="error" role="alert">{error}</p>
			{/if}

			{#if mode === 'signin'}
				<button type="button" class="link" onclick={() => switchMode('reset')}>
					{t.forgotPassword}
				</button>
			{:else if mode === 'reset'}
				<button type="button" class="link" onclick={() => switchMode('signin')}>
					{t.backToSignIn}
				</button>
			{/if}
		</section>
	{/if}

	{#if isConfigured && auth.user}
		<footer>
			<div class="id">
				<span class="label">{t.yourId}</span>
				<code>{auth.user.uid}</code>
				<span class="hint">{t.yourIdHint}</span>
			</div>
			<a href={resolve('/privacy')}>{t.privacyLink}</a>
		</footer>
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

	h2 {
		font-size: 1.05rem;
		margin: 0 0 0.35rem;
	}

	.card {
		background: #171a21;
		border: 1px solid #252a33;
		border-radius: 0.75rem;
		padding: 1rem;
		margin-bottom: 1rem;
	}

	.tabs {
		display: flex;
		background: #0f1115;
		border: 1px solid #252a33;
		border-radius: 0.5rem;
		padding: 0.15rem;
		margin-bottom: 1rem;
	}

	.tabs button {
		flex: 1;
		background: transparent;
		color: #9aa3ad;
		border: none;
		border-radius: 0.35rem;
		padding: 0.45rem 0.6rem;
		font-size: 0.9rem;
		font-weight: 500;
	}

	.tabs button[aria-selected='true'] {
		background: #252a33;
		color: #e6e8eb;
		font-weight: 600;
	}

	.body {
		color: #9aa3ad;
		font-size: 0.9rem;
		margin: 0 0 1rem;
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

	small {
		font-size: 0.75rem;
		color: #78818c;
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

	button.secondary {
		background: transparent;
		color: #c3c9d1;
		border: 1px solid #2d333d;
		padding: 0.45rem 0.75rem;
		font-size: 0.85rem;
		font-weight: 500;
	}

	button.danger {
		width: 100%;
		background: transparent;
		color: #ff8080;
		border: 1px solid #45262a;
	}

	button.link {
		display: block;
		margin: 0.85rem auto 0;
		background: none;
		padding: 0;
		color: #4c8dff;
		font-size: 0.85rem;
		font-weight: 500;
	}

	.label {
		margin: 0;
		font-size: 0.8rem;
		color: #9aa3ad;
	}

	.email {
		margin: 0.1rem 0 0.75rem;
		font-size: 1.05rem;
		font-weight: 600;
		word-break: break-all;
	}

	.notice {
		background: #241f0f;
		border: 1px solid #4a3d18;
		color: #f0d089;
		border-radius: 0.5rem;
		padding: 0.75rem;
		font-size: 0.9rem;
	}

	.notice p {
		margin: 0;
	}

	.actions {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		margin-top: 0.6rem;
	}

	.ok {
		color: #7ad38f;
		font-size: 0.9rem;
		margin: 0.75rem 0 0;
	}

	.error {
		color: #ff8080;
		font-size: 0.9rem;
		margin: 0.75rem 0 0;
	}

	.hint {
		color: #78818c;
		font-size: 0.8rem;
		margin: 0.6rem 0 0;
	}

	.muted {
		color: #78818c;
		font-size: 0.9rem;
	}

	.locale {
		align-self: center;
	}

	.fine {
		margin: 0;
		font-size: 0.8rem;
		color: #78818c;
	}

	a {
		color: #4c8dff;
	}

	footer {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		margin-top: 1.5rem;
		font-size: 0.85rem;
	}

	.id {
		display: flex;
		flex-direction: column;
		gap: 0.2rem;
	}

	.id code {
		align-self: flex-start;
		max-width: 100%;
		overflow-wrap: anywhere;
		user-select: all;
	}

	.id .hint {
		margin: 0;
	}

	code {
		background: #0b0d11;
		padding: 0.1rem 0.3rem;
		border-radius: 0.25rem;
		font-size: 0.85em;
	}
</style>
