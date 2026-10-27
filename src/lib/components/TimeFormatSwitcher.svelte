<script lang="ts">
	/**
	 * Segmented buttons for the 12/24-hour clock, independent of the language.
	 * "Auto" keeps the locale's own convention.
	 */
	import { i18n, TIME_FORMATS, type TimeFormat } from '#lib/i18n.svelte.js';

	const t = $derived(i18n.t);
	const labels = $derived<Record<TimeFormat, string>>({
		auto: t.timeFormatAuto,
		'12': '12h',
		'24': '24h'
	});
</script>

<div class="switcher" role="group" aria-label={t.timeFormat}>
	{#each TIME_FORMATS as format (format)}
		<button
			type="button"
			aria-pressed={i18n.timeFormat === format}
			title={format === 'auto' ? t.timeFormatAutoHint : undefined}
			onclick={() => (i18n.timeFormat = format)}
		>
			{labels[format]}
		</button>
	{/each}
</div>

<style>
	.switcher {
		display: flex;
		gap: 0.35rem;
	}

	button {
		padding: 0.25rem 0.6rem;
		background: transparent;
		color: inherit;
		font: inherit;
		font-size: 0.9rem;
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
</style>
