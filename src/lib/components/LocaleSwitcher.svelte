<script lang="ts">
	/**
	 * Flag buttons for switching the UI language.
	 *
	 * Flags are inline SVG rather than emoji: Windows renders flag emoji as
	 * plain letters ("GB", "DE"). Each button keeps the language name as its
	 * accessible label, since a flag alone means nothing to a screen reader.
	 */
	import { i18n, LOCALES, type Locale } from '#lib/i18n.svelte.js';

	// Language names are written in their own language, so a user can find
	// theirs whichever language is currently active.
	const names: Record<Locale, string> = { en: 'English', de: 'Deutsch' };
</script>

<div class="switcher" role="group" aria-label={i18n.t.language}>
	{#each LOCALES as code (code)}
		<button
			type="button"
			lang={code}
			aria-label={names[code]}
			aria-pressed={i18n.locale === code}
			title={names[code]}
			onclick={() => (i18n.locale = code)}
		>
			{#if code === 'en'}
				<svg viewBox="0 0 60 30" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
					<clipPath id="flag-uk-t">
						<path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z" />
					</clipPath>
					<rect width="60" height="30" fill="#012169" />
					<path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" stroke-width="6" />
					<path
						d="M0,0 L60,30 M60,0 L0,30"
						clip-path="url(#flag-uk-t)"
						stroke="#C8102E"
						stroke-width="4"
					/>
					<path d="M30,0 v30 M0,15 h60" stroke="#fff" stroke-width="10" />
					<path d="M30,0 v30 M0,15 h60" stroke="#C8102E" stroke-width="6" />
				</svg>
			{:else if code === 'de'}
				<svg viewBox="0 0 5 3" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
					<rect width="5" height="3" fill="#FFCE00" />
					<rect width="5" height="2" fill="#DD0000" />
					<rect width="5" height="1" fill="#000" />
				</svg>
			{/if}
		</button>
	{/each}
</div>

<style>
	.switcher {
		display: flex;
		gap: 0.35rem;
	}

	button {
		display: grid;
		place-items: center;
		padding: 0.2rem;
		background: transparent;
		border: 2px solid transparent;
		border-radius: 0.4rem;
		cursor: pointer;
		opacity: 0.45;
		transition: opacity 0.15s;
	}

	button:hover {
		opacity: 0.8;
	}

	button[aria-pressed='true'] {
		opacity: 1;
		border-color: #4c8dff;
	}

	button:focus-visible {
		outline: 2px solid #4c8dff;
		outline-offset: 1px;
	}

	svg {
		display: block;
		width: 1.75rem;
		height: 1.2rem;
		border-radius: 0.2rem;
		/* Keeps the black stripe of the German flag visible on the dark background. */
		box-shadow: 0 0 0 1px rgb(255 255 255 / 0.15);
	}
</style>
