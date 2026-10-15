<script lang="ts">
	/**
	 * Bottom navigation between the two top-level screens. Fixed to the bottom
	 * (thumb reach on phones) and padded for the iOS home indicator via
	 * `env(safe-area-inset-bottom)` — app.html sets `viewport-fit=cover`.
	 */
	import { resolve } from '$app/paths';
	import { page } from '$app/state';

	import { i18n } from '$lib/i18n.svelte';

	const path = $derived(page.url.pathname);
	// An exercise page is reached from either tab; count it as History.
	const onHistory = $derived(path.startsWith('/history') || path.startsWith('/exercise/'));
</script>

<nav aria-label={i18n.t.appTitle}>
	<a href={resolve('/')} aria-current={!onHistory ? 'page' : undefined}>
		<svg viewBox="0 0 24 24" aria-hidden="true">
			<path d="M12 5v14M5 12h14" />
		</svg>
		<span>{i18n.t.tabLog}</span>
	</a>
	<a href={resolve('/history')} aria-current={onHistory ? 'page' : undefined}>
		<svg viewBox="0 0 24 24" aria-hidden="true">
			<rect x="4" y="5" width="16" height="15" rx="2" />
			<path d="M4 10h16M9 3v4M15 3v4" />
		</svg>
		<span>{i18n.t.history}</span>
	</a>
</nav>

<style>
	nav {
		position: fixed;
		left: 0;
		right: 0;
		bottom: 0;
		z-index: 20;
		display: flex;
		justify-content: center;
		gap: 0.5rem;
		padding: 0.35rem 1rem calc(0.35rem + env(safe-area-inset-bottom));
		background: rgb(15 17 21 / 0.92);
		backdrop-filter: blur(8px);
		border-top: 1px solid #252a33;
	}

	a {
		flex: 1;
		max-width: 10rem;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.1rem;
		padding: 0.35rem 0;
		border-radius: 0.5rem;
		color: #78818c;
		text-decoration: none;
		font-size: 0.75rem;
		font-weight: 500;
	}

	a:hover {
		color: #c3c9d1;
	}

	a[aria-current='page'] {
		color: #4c8dff;
	}

	a:focus-visible {
		outline: 2px solid #4c8dff;
		outline-offset: -2px;
	}

	svg {
		width: 1.4rem;
		height: 1.4rem;
		fill: none;
		stroke: currentColor;
		stroke-width: 2;
		stroke-linecap: round;
		stroke-linejoin: round;
	}
</style>
