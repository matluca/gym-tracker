# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```sh
npm run dev            # dev server with HMR
npm run check          # svelte-check — type + template check. Run this before calling work done.
npm run build          # static build into build/
npm run preview        # serve build/ locally — does NOT apply firebase.json rewrites
npm run icons          # regenerate static/icons/ from scripts/generate-icons.py
npm run emulators      # Firebase emulator suite
npm run deploy         # build + deploy hosting and Firestore rules
npm run deploy:rules   # deploy only firestore.rules
```

There is no test framework installed and no test suite. `npm run check` is the only
automated verification. If adding tests, `@firebase/rules-unit-testing` against the
emulator is the highest-value place to start — the rules carry real logic.

### Verifying changes locally

- `vite preview` serves the build but ignores `firebase.json`, so **deep links 404 there**.
  That is expected, not a bug. To test rewrites and cache headers, use the Hosting
  emulator: `firebase emulators:start --only hosting --project demo-gym-tracker`.
- The **Hosting emulator is pure Node. The Firestore and Auth emulators require a JRE**,
  which is not installed on this machine — anything needing a live Firestore round-trip
  has to run against a real project with credentials in `.env`.

## Architecture

A SvelteKit 2 / Svelte 5 app compiled to a static SPA, served by Firebase Hosting, with
Firestore for data and anonymous Firebase Auth for identity. There is no server of ours at
runtime. See `README.md` for first-time Firebase project setup.

### Config lives in `vite.config.ts`, not `svelte.config.js`

This scaffold has **no `svelte.config.js`**. The current `sv` CLI passes `KitConfig`
straight into the `sveltekit()` plugin, so the adapter, `serviceWorker`, `alias`, and every
other kit option go inside `sveltekit({ … })` in `vite.config.ts`. Docs and older answers
will tell you otherwise.

Runes mode is force-enabled there for all non-`node_modules` files. Legacy Svelte syntax
(`on:click`, `export let`, `$:`) will not work — use `onclick`, `$props()`, `$derived`.

### The SPA contract — three files that must agree

1. `src/routes/+layout.ts` sets `ssr = false` and `prerender = false`.
2. `adapter-static` in `vite.config.ts` is configured with `fallback: 'index.html'`.
3. `firebase.json` rewrites `**` → `/index.html`.

Change one and you must change the others. If a future route needs prerendering or SSR,
this whole arrangement has to be revisited — SSR in particular is incompatible with plain
static Hosting.

### Firebase client initialisation is lazy and single-shot

`src/lib/firebase/client.ts` exports `getFirebase()`, which memoises `{ app, auth, db }`.
Two reasons it must stay lazy:

- Importing the module has no side effect, so it can never fire during the build.
- `initializeFirestore()` (not `getFirestore()`) is what enables the IndexedDB offline
  cache, and it throws if called twice or after Firestore has been used.

Always go through `getFirebase()`. Never call `getFirestore()` / `getAuth()` directly
elsewhere.

`isConfigured` (exported from the same module) is false while `.env` still holds blank
placeholders; the UI shows a setup notice instead of crashing. Preserve that path when
touching startup code.

### Environment variables

Config comes from `$env/static/public` with the `PUBLIC_` prefix, meaning values are
**inlined into the client bundle at build time**. Consequences:

- A variable imported from `$env/static/public` but missing from `.env` is a **build
  failure**, not a runtime one. Adding an import means adding it to `.env` *and*
  `.env.example`.
- Nothing secret can ever go in a `PUBLIC_` var. The Firebase web config is public by
  design — it identifies the project, it authorises nothing.

### Two independent offline layers

Do not conflate these:

| Layer | Owns | Where |
| --- | --- | --- |
| Service worker | app shell, JS/CSS, icons | `src/service-worker.ts` |
| Firestore `persistentLocalCache` | document reads, queued writes | `src/lib/firebase/client.ts` |

**The service worker must never intercept cross-origin requests.** Firestore and Identity
Toolkit talk to `*.googleapis.com` and do their own offline queueing and stream management;
caching or proxying those breaks realtime listeners and the write queue. The `fetch`
handler bails out on any non-same-origin URL and on non-GET — keep it that way.

SvelteKit registers the worker automatically. `$service-worker` supplies the build manifest
and a `version` that rotates the cache name each build; `activate` deletes every other
cache. Install uses `Promise.allSettled` rather than `cache.addAll` because in `vite dev`
the built assets and the `index.html` fallback don't exist yet, and one 404 would abort
the whole install.

### `firestore.rules` is the backend

With static hosting there is no server of ours in the request path, so the rules file is
the only enforcement point. It checks two things: uid-scoped ownership
(`users/{userId}/workouts/{workoutId}`), and the document shape.

**The rules and `src/lib/firebase/workouts.ts` are a matched pair.** Adding or renaming a
field means editing both — `hasOnly` / `hasAll` will reject any write with an unexpected
key. Specific couplings to know:

- `createdAt == request.time` means writes **must** use `serverTimestamp()`.
- `reps is int` — a fractional number is rejected.
- `allow update: if false`. Nothing edits documents today. If you add editing, write the
  rule deliberately and pin `createdAt` so a client cannot rewrite history.

Rules only take effect once deployed (`npm run deploy:rules`). Editing the file alone
changes nothing in the live project.

### Reactive auth state

`src/lib/firebase/auth.svelte.ts` holds a `$state` object exported as `auth`. The
`.svelte.ts` extension is what allows runes outside a component — the compiler only
processes rune syntax in `.svelte` and `.svelte.ts` files, so renaming it breaks the
module. `initAuth()` is idempotent and signs in anonymously when no user is present.

Anonymous auth gives every visitor a stable uid with no signup friction, which is what
makes the ownership rules meaningful from day one. To upgrade to a real provider later,
use `linkWithCredential` — it preserves the uid, so existing documents carry over.

## Notes

- `.firebaserc` is intentionally absent. Run `firebase use --add` to create it.
- `firestore.indexes.json` is empty. The one query in the app (`orderBy('createdAt')` on a
  single collection) needs no composite index; adding a multi-field query will, and
  Firestore's error message links to a one-click creation URL.
- Bundle is ~204 KB gzipped, ~176 KB of which is the Firebase SDK. Svelte and the router
  are ~28 KB. If first paint becomes a concern, `await import()` the Firebase modules after
  the shell renders rather than trying to trim the SDK.
- The icons are generated placeholder art, not designed assets. `scripts/generate-icons.py`
  is pure stdlib (no Pillow); edit `BG`/`FG` there and re-run `npm run icons`.
