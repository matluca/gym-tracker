// SPA mode: there is no server at runtime, so nothing is server-rendered and
// nothing is prerendered — adapter-static emits the `fallback` shell instead.
// Firebase Auth and Firestore are browser-only, so this keeps them off the
// build-time code path entirely.
export const ssr = false;
export const prerender = false;

// Preload route code on hover/tap so navigation still feels instant.
export const trailingSlash = 'never';
