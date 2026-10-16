<script lang="ts">
	/**
	 * Dismissible "install the app" card for the Log tab. Shows an Install
	 * button where the browser supports a native prompt (Chromium), the Share →
	 * Add to Home Screen steps in iOS Safari, and a pointer to Safari in other
	 * iOS browsers. Hidden once installed or dismissed — see install.svelte.ts.
	 */
	import { i18n } from '#lib/i18n.svelte.js';
	import { dismissInstallHint, installMode, promptInstall } from '#lib/install.svelte.js';

	const t = $derived(i18n.t);
	const mode = $derived(installMode());
	// Text either side of the inline Share icon; word order differs by language.
	const iosSteps = $derived(t.installIosSteps.split('{share}'));
</script>

{#if mode}
	<aside class="install" aria-labelledby="install-title">
		<div class="text">
			<h2 id="install-title">{t.installTitle}</h2>
			{#if mode === 'ios-other'}
				<p>{t.installIosOther}</p>
			{:else}
				<p>{t.installBody}</p>
				{#if mode === 'ios-safari'}
					<p class="steps">
						{iosSteps[0]}<span class="share"
							><svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
								<path
									d="M12 3v12M8 7l4-4 4 4M6 11H5v10h14V11h-1"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
									stroke-linecap="round"
									stroke-linejoin="round"
								/>
							</svg>{t.installIosShare}</span
						>{iosSteps[1]}
					</p>
				{/if}
			{/if}
			{#if mode === 'prompt'}
				<button type="button" class="install-button" onclick={promptInstall}>
					{t.installButton}
				</button>
			{/if}
		</div>
		<button type="button" class="close" onclick={dismissInstallHint} aria-label={t.dismiss}>
			<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
				<path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
			</svg>
		</button>
	</aside>
{/if}

<style>
	.install {
		display: flex;
		align-items: flex-start;
		gap: 0.5rem;
		background: #13203a;
		border: 1px solid #24406f;
		border-radius: 0.75rem;
		padding: 1rem;
		margin-bottom: 1rem;
	}

	.text {
		flex: 1;
	}

	h2 {
		font-size: 0.95rem;
		margin: 0 0 0.25rem;
		color: #e6e8eb;
	}

	p {
		margin: 0;
		font-size: 0.875rem;
		color: #b8c4d6;
	}

	.steps {
		margin-top: 0.5rem;
		color: #e6e8eb;
	}

	.share {
		display: inline-flex;
		align-items: center;
		gap: 0.2rem;
		font-weight: 600;
		color: #8fb8ff;
		vertical-align: bottom;
	}

	.install-button {
		margin-top: 0.75rem;
		background: #4c8dff;
		color: #061021;
		border: none;
		border-radius: 0.5rem;
		padding: 0.55rem 1.1rem;
		font-size: 0.9rem;
		font-weight: 600;
		font-family: inherit;
		cursor: pointer;
	}

	.close {
		flex: none;
		display: grid;
		place-items: center;
		width: 2rem;
		height: 2rem;
		margin: -0.4rem -0.4rem 0 0;
		background: none;
		border: none;
		border-radius: 0.5rem;
		color: #9aa3ad;
		cursor: pointer;
	}

	.close:hover {
		color: #e6e8eb;
	}

	button:focus-visible {
		outline: 2px solid #4c8dff;
		outline-offset: 1px;
	}
</style>
