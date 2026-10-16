<script lang="ts">
	// Icons, manifest and theme-color live in src/app.html so they are present
	// in the served shell before any JS runs — which is what the browser's
	// install prompt reads.
	import { onMount } from 'svelte';

	import TabBar from '$lib/components/TabBar.svelte';
	import { initAuth, setAuthLanguage } from '$lib/firebase/auth.svelte';
	import { isConfigured } from '$lib/firebase/client';
	import { i18n } from '$lib/i18n.svelte';
	import { initInstall } from '$lib/install.svelte';

	let { children } = $props();

	// Here rather than in a page so a deep link straight to any route still
	// signs in. initAuth() is idempotent.
	onMount(() => {
		if (isConfigured) initAuth();
		// Early, so a beforeinstallprompt fired on another tab isn't missed.
		initInstall();
	});

	// Keep <html lang> in step so screen readers and hyphenation use the right language.
	$effect(() => {
		document.documentElement.lang = i18n.locale;
	});

	// Verification and password-reset emails go out in the UI language.
	$effect(() => {
		if (isConfigured) setAuthLanguage(i18n.locale);
	});
</script>

{@render children()}

{#if isConfigured}
	<TabBar />
{/if}

<style>
	:global(body) {
		margin: 0;
		background: #0f1115;
		color: #e6e8eb;
		font-family: system-ui, -apple-system, 'Segoe UI', sans-serif;
		line-height: 1.5;
	}
</style>
