<script lang="ts">
	/**
	 * Bottom navigation between the top-level screens. Fixed to the bottom
	 * (thumb reach on phones) and padded for the iOS home indicator via
	 * `env(safe-area-inset-bottom)` — app.html sets `viewport-fit=cover`.
	 */
	import { resolve } from '$app/paths';
	import { page } from '$app/state';

	import { auth } from '#lib/firebase/auth.svelte.js';
	import { i18n } from '#lib/i18n.svelte.js';

	const path = $derived(page.url.pathname);
	const current = $derived(
		path.startsWith('/history')
			? 'history'
			: path.startsWith('/exercise')
				? 'progress'
				: path.startsWith('/account')
					? 'account'
					: 'log'
	);
	// Nudge guests towards saving their data, once auth has settled.
	const unsaved = $derived(!auth.loading && auth.isAnonymous);
</script>

<nav aria-label={i18n.t.appTitle}>
	<a href={resolve('/')} aria-current={current === 'log' ? 'page' : undefined}>
		<svg viewBox="0 0 24 24" aria-hidden="true">
			<path d="M12 5v14M5 12h14" />
		</svg>
		<span>{i18n.t.tabLog}</span>
	</a>
	<a href={resolve('/history')} aria-current={current === 'history' ? 'page' : undefined}>
		<svg viewBox="0 0 24 24" aria-hidden="true">
			<rect x="4" y="5" width="16" height="15" rx="2" />
			<path d="M4 10h16M9 3v4M15 3v4" />
		</svg>
		<span>{i18n.t.history}</span>
	</a>
	<!-- Bare /exercise reopens the last exercise viewed on this device. -->
	<a href={resolve('/exercise/[[name]]', {})} aria-current={current === 'progress' ? 'page' : undefined}>
		<svg viewBox="0 0 24 24" aria-hidden="true">
			<path d="M4 19h16M5 15l4-4 3 3 7-7" />
			<path d="M15 7h4v4" />
		</svg>
		<span>{i18n.t.progress}</span>
	</a>
	<a
		href={resolve('/account')}
		aria-current={current === 'account' ? 'page' : undefined}
		title={unsaved ? i18n.t.guestBadge : undefined}
	>
		<span class="icon">
			<svg viewBox="0 0 24 24" aria-hidden="true">
				<circle cx="12" cy="8" r="4" />
				<path d="M4 20c1.5-4 4.5-6 8-6s6.5 2 8 6" />
			</svg>
			{#if unsaved}
				<span class="dot" aria-hidden="true"></span>
			{/if}
		</span>
		<span>{i18n.t.account}</span>
		{#if unsaved}
			<span class="visually-hidden">({i18n.t.guestBadge})</span>
		{/if}
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

	.icon {
		position: relative;
		display: grid;
	}

	.dot {
		position: absolute;
		top: 0;
		right: -0.15rem;
		width: 0.5rem;
		height: 0.5rem;
		border-radius: 50%;
		background: #f5c451;
		box-shadow: 0 0 0 2px #0f1115;
	}

	.visually-hidden {
		position: absolute;
		width: 1px;
		height: 1px;
		margin: -1px;
		overflow: hidden;
		clip: rect(0 0 0 0);
		white-space: nowrap;
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
