<script lang="ts">
	// Icons, manifest and theme-color live in src/app.html so they are present
	// in the served shell before any JS runs — which is what the browser's
	// install prompt reads.
	let { children } = $props();
</script>

{@render children()}
