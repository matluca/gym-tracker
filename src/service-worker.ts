/// <reference types="@sveltejs/kit" />
/// <reference lib="webworker" />

/**
 * SvelteKit registers this automatically (config.kit.serviceWorker.register
 * defaults to true). `$service-worker` hands us the exact build manifest for
 * this deploy, with a `version` that changes on every build — so the cache name
 * rotates and stale assets get evicted in `activate`.
 */
import { build, files, version } from '$service-worker';

const sw = self as unknown as ServiceWorkerGlobalScope;

const CACHE = `gym-tracker-${version}`;

/** The SPA shell that adapter-static emits. Every navigation resolves to this. */
const FALLBACK = '/index.html';

const PRECACHE = [...build, ...files, FALLBACK];

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

	event.respondWith(
		(async () => {
			const cache = await caches.open(CACHE);

			// Build assets are content-hashed, so a cache hit is always correct
			// and we can skip the network entirely.
			const cached = await cache.match(request);
			if (cached) return cached;

			try {
				const response = await fetch(request);
				if (response.ok && response.type === 'basic') {
					cache.put(request, response.clone());
				}
				return response;
			} catch {
				return Response.error();
			}
		})()
	);
});
