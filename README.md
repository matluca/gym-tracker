# Gym Tracker

An offline-capable PWA workout log. SvelteKit compiled to a static bundle, served by
Firebase Hosting, with Firestore for data and Firebase Auth for identity.

**Stack**

| Piece         | Choice                                                       |
|---------------|--------------------------------------------------------------|
| Framework     | SvelteKit 2 + Svelte 5 (runes), TypeScript                   |
| Build         | `@sveltejs/adapter-static` → SPA, no server at runtime       |
| Hosting       | Firebase Hosting (static + catch-all rewrite)                |
| Data          | Cloud Firestore, with the IndexedDB offline cache enabled    |
| Auth          | Firebase Anonymous Auth                                      |
| Offline shell | Hand-rolled service worker via SvelteKit's `$service-worker` |

## Setup

### 1. Create the Firebase project

In the [Firebase Console](https://console.firebase.google.com):

1. Create a project (or reuse one).
2. **Build → Firestore Database → Create database.** Pick a region close to you. Start in
   **production mode** — the rules in `firestore.rules` replace the defaults on first deploy.
3. **Build → Authentication → Get started → Sign-in method → Anonymous → Enable.**
4. **Project settings → General → Your apps → Add app → Web.** Register it, then copy the
   `firebaseConfig` values from the "SDK setup and configuration" panel.

### 2. Fill in the local config

`.env` already exists with blank placeholders (it is gitignored). Paste your values in:

```sh
PUBLIC_FIREBASE_API_KEY="AIza…"
PUBLIC_FIREBASE_AUTH_DOMAIN="your-project.firebaseapp.com"
PUBLIC_FIREBASE_PROJECT_ID="your-project"
PUBLIC_FIREBASE_STORAGE_BUCKET="your-project.firebasestorage.app"
PUBLIC_FIREBASE_MESSAGING_SENDER_ID="123456789"
PUBLIC_FIREBASE_APP_ID="1:123456789:web:abc123"
```

These are public by design — they identify the project, they don't authorise anything.
Access control lives entirely in `firestore.rules`. Never put a secret in a `PUBLIC_` var;
SvelteKit inlines them into the client bundle.

Until they're filled in, the app boots and shows a "not configured yet" notice rather
than crashing.

### 3. Run it

```sh
npm run dev
```

Add a set. It should appear in the list immediately and show up under
`users/{your-uid}/workouts` in the Firestore console.

### 4. Link the Firebase project and deploy

```sh
firebase login
firebase use --add          # pick your project, this writes .firebaserc
npm run deploy              # builds, then deploys hosting + Firestore rules
```

Deploy the rules before or with the first release — an un-deployed rules file means the
console defaults are still in force.

## Scripts

| Script                 | What it does                                   |
|------------------------|------------------------------------------------|
| `npm run dev`          | Dev server with HMR                            |
| `npm run build`        | Static build into `build/`                     |
| `npm run preview`      | Serve the build locally (no Firebase rewrites) |
| `npm run check`        | `svelte-check` type/template check             |
| `npm run deploy`       | Build + deploy hosting and Firestore rules     |
| `npm run deploy:rules` | Deploy only `firestore.rules`                  |
| `npm run emulators`    | Firebase emulator suite (Firestore needs Java) |
| `npm run icons`        | Regenerate `static/icons/` from `scripts/`     |

To develop against the emulators instead of your live project, set
`PUBLIC_USE_FIREBASE_EMULATORS="true"` in `.env` and run `npm run emulators`. The Firestore
and Auth emulators need a JRE on your PATH; the Hosting emulator does not.

## Layout

```
src/
  app.html                     shell: manifest link, theme-color, iOS meta
  service-worker.ts            precache + offline navigation fallback
  routes/
    +layout.ts                 ssr = false, prerender = false → SPA mode
    +page.svelte               the whole app today
  lib/firebase/
    client.ts                  lazy singletons; offline cache; emulator wiring
    auth.svelte.ts             rune-backed auth state, anonymous sign-in
    workouts.ts                Firestore reads/writes for users/{uid}/workouts
static/
  manifest.webmanifest
  icons/
firestore.rules                the actual backend — see below
firebase.json                  hosting rewrites + cache headers, emulator ports
```

## How the pieces fit

**Static / SPA.** `+layout.ts` sets `ssr = false` and `prerender = false`, so
`adapter-static` emits a single `index.html` shell plus hashed assets. `firebase.json`
rewrites every path to `/index.html`, and SvelteKit's client router takes it from there.
Deep links work; there is no server.

**Offline.** Two independent layers:

- The service worker precaches the app shell and assets, so the UI loads with no network.
- Firestore's `persistentLocalCache` serves reads from IndexedDB and queues writes until
  you reconnect. The service worker deliberately ignores all cross-origin requests so it
  never interferes with Firestore's own sync.

**Security.** With static hosting there is no server of yours in the request path, so
`firestore.rules` *is* the backend. It enforces two things: you can only touch documents
under your own uid, and a workout document has to match the expected shape. Extend it
alongside each new feature, not afterwards.

## Bundle size

~204 KB gzipped of JS total, of which ~176 KB is the Firebase SDK (Firestore + Auth) and
~28 KB is Svelte and the router. Firestore is the heavy part and there is no trimming it
much; if first paint matters, `await import()` the Firebase modules after the shell
renders so the app paints before the SDK lands.

## Next steps

- Swap anonymous auth for a real provider with `linkWithCredential` — the uid is
  preserved, so existing workouts carry over.
- Add routes (history, per-exercise charts). New files under `src/routes/` need no
  config changes.
- Add an install prompt by capturing `beforeinstallprompt`.
- Add rules tests with `@firebase/rules-unit-testing` once you have a JRE available.
