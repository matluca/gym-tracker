/**
 * SvelteKit bundles and registers this automatically (as a module worker).
 * `$app/manifest` lists the exact files of this deploy and `version` changes
 * on every build — so the cache name rotates and stale assets get evicted in
 * `activate`. Its own tsconfig.json gives `self` the service worker type.
 */
import { self as sw } from '$app/service-worker';
import { version } from '$app/env';
import { assets, immutable } from '$app/manifest';

const CACHE = `gym-tracker-${version}`;

/** The SPA shell that adapter-static emits. Every navigation resolves to this. */
const FALLBACK = '/index.html';

// Manifest paths are relative to the base path, which is the worker's scope.
// Resolving against it gives the absolute pathnames the fetch handler compares
// against. (`resolve()` from $app/paths is typed for routes, not files.)
const toPathname = (file: { path: string }) => new URL(file.path, sw.registration.scope).pathname;

const PRECACHE = [...immutable.map(toPathname), ...assets.map(toPathname), FALLBACK];
const PRECACHE_PATHS = new Set(PRECACHE);

sw.addEventListener('install', (event) => {
	event.waitUntil(
		(async () => {
			const cache = await caches.open(CACHE);
			// allSettled rather than addAll: in `vite dev` the built assets and the
			// fallback shell don't exist yet, and one 404 would abort the whole
			// install and leave the app without a worker.
			await Promise.allSettled(PRECACHE.map((asset) => cache.add(asset)));
			await sw.skipWaiting();
		})()
	);
});

sw.addEventListener('activate', (event) => {
	event.waitUntil(
		(async () => {
			for (const key of await caches.keys()) {
				if (key !== CACHE) await caches.delete(key);
			}
			await sw.clients.claim();
		})()
	);
});

sw.addEventListener('fetch', (event) => {
	const { request } = event;

	if (request.method !== 'GET') return;

	const url = new URL(request.url);

	// Only ever touch our own origin. Firestore and Identity Toolkit talk to
	// *.googleapis.com, and they do their own offline queueing — intercepting
	// those would break realtime listeners and the write queue.
	if (url.origin !== sw.location.origin) return;

	// Navigations: network first so a fresh deploy is picked up immediately,
	// falling back to the cached shell when offline.
	if (request.mode === 'navigate') {
		event.respondWith(
			(async () => {
				try {
					return await fetch(request);
				} catch {
					const cached = await caches.match(FALLBACK);
					return cached ?? Response.error();
				}
			})()
		);
		return;
	}

	// Only the build manifest is served cache-first. Those files are
	// content-hashed (or rotate with `version`), so a cache hit is always
	// correct. Anything else — notably `vite dev` modules like
	// /src/lib/Foo.svelte, whose URL never changes as you edit — goes to the
	// network and is never cached, or edits would be masked by a stale copy.
	if (!PRECACHE_PATHS.has(url.pathname)) return;

	event.respondWith(
		(async () => {
			const cached = await caches.match(request, { cacheName: CACHE });
			if (cached) return cached;
			return fetch(request);
		})()
	);
});
