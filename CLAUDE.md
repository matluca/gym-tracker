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
automated verification. CI (`.github/workflows/ci.yml`) runs `npm ci`, `check` and `build` on
every push to `main` and every PR, using the blank `.env.example` values. Dependabot
(`.github/dependabot.yml`) opens weekly npm PRs, grouping the Svelte packages together
since they must move in step. If adding tests, `@firebase/rules-unit-testing` against the
emulator is the highest-value place to start — the rules carry real logic.

### Verifying changes locally

- `vite preview` serves the build but ignores `firebase.json`, so **deep links 404 there**.
  That is expected, not a bug. To test rewrites and cache headers, use the Hosting
  emulator: `firebase emulators:start --only hosting --project demo-gym-tracker`.
- The **Hosting emulator is pure Node. The Firestore and Auth emulators require a JRE**,
  which is not installed on this machine — anything needing a live Firestore round-trip
  has to run against a real project with credentials in `.env`.

## Architecture

A SvelteKit 3 / Svelte 5 app compiled to a static SPA, served by Firebase Hosting, with
Firestore for data and Firebase Auth (anonymous, upgradable to email + password) for identity. There is no server of ours at
runtime. See `README.md` for first-time Firebase project setup.

### Config lives in `vite.config.ts`, not `svelte.config.js`

SvelteKit 3 does not support `svelte.config.js` at all: the adapter, `serviceWorker` and
every other option are top-level options of `sveltekit({ … })` in `vite.config.ts`.
Docs and answers written for SvelteKit 2 will tell you otherwise.

SvelteKit 3 renames several modules, and the old names are hard errors, not deprecations:

- `$lib/…` → `#lib/…`, a Node subpath import declared in `package.json` `"imports"`.
  Imports need the real extension as seen at runtime: `#lib/dates.js` for `dates.ts`,
  `#lib/i18n.svelte.js` for `i18n.svelte.ts`, `#lib/components/X.svelte` for components.
- `$service-worker` → `$app/manifest` (file lists), `$app/env` (`version`) and
  `$app/service-worker` (typed `self`). `$app/environment` → `$app/env`.
- `goto` options: `replaceState` → `replace`, `keepFocus`/`noScroll` → `reset: false`.
- `tsconfig.json` extends `$app/tsconfig`; the service worker is its own TS project.

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

Variables are declared in `src/env.ts` with `defineEnvVars` and imported from
`$app/env/public`. They are `public: true, static: true`, meaning values are **inlined into
the client bundle at build time** — a static SPA has no server to read them later.
Consequences:

- A declared variable missing from `.env` fails the build (no schema means "must be set,
  may be blank"). Adding one means declaring it in `src/env.ts` *and* adding it to `.env`
  and `.env.example`.
- `$env/static/public` still works in SvelteKit 3 but is deprecated; don't add new uses.
- Nothing secret can ever go in a `PUBLIC_` var. The Firebase web config is public by
  design — it identifies the project, it authorises nothing.

### Two independent offline layers

Do not conflate these:

| Layer | Owns | Where |
| --- | --- | --- |
| Service worker | app shell, JS/CSS, icons | `src/service-worker/index.ts` |
| Firestore `persistentLocalCache` | document reads, queued writes | `src/lib/firebase/client.ts` |

**The service worker must never intercept cross-origin requests.** Firestore and Identity
Toolkit talk to `*.googleapis.com` and do their own offline queueing and stream management;
caching or proxying those breaks realtime listeners and the write queue. The `fetch`
handler bails out on any non-same-origin URL and on non-GET — keep it that way.

SvelteKit bundles and registers the worker automatically (as a module worker).
`$app/manifest` supplies the build's files and `$app/env` a `version` that rotates the cache
name each build; `activate` deletes every other
cache. The `fetch` handler serves cache-first **only for paths in the build manifest** (hashed,
so always correct) and leaves everything else to the network uncached. Caching other
same-origin GETs used to pin `vite dev` modules (`/src/...`, whose URLs don't change as
you edit), so source edits vanished behind stale copies.

The worker has its own `tsconfig.json` (extending `$app/tsconfig/service-worker`) and is
excluded from the main one, so `svelte-check` doesn't see it; `npm run check` therefore also
runs `tsc -p src/service-worker`. Manifest paths are relative to the base path, so the worker
resolves them against its scope — `resolve()` from `$app/paths` is typed for routes and
rejects file paths.

Install uses `Promise.allSettled` rather than `cache.addAll` because in `vite dev`
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
- `performedAt` (when the set was done, chosen in the form so sets can be backdated) is
  client-set and optional; the rule caps it at now + 1 day. Read code uses
  `Workout.date`, which falls back to `createdAt` for older docs without it. Display and
  grouping go by `date`; `createdAt` is only the audit trail.
- `reps is int` — a fractional number is rejected.
- `allow update: if false`. Nothing edits documents today. If you add editing, write the
  rule deliberately and pin `createdAt` so a client cannot rewrite history.

Rules only take effect once deployed (`npm run deploy:rules`). Editing the file alone
changes nothing in the live project.

### Routes

- `/` — log a set, plus today's sets grouped by exercise (filtered client-side from the
  50-most-recent subscription). Exercise names link to their history page.
  Also hosts the install hint (`InstallHint.svelte`, state in `src/lib/install.svelte.ts`):
  an Install button where Chromium fires `beforeinstallprompt`, Share → Add to Home Screen
  steps in iOS Safari (which has no install API), nothing once installed or dismissed.
- `/history` — training days newest first, each listing exercises with set count and best
  set; tap a day to expand every set. Pages by `createdAt` (200 sets per "Load older") and
  hides the oldest, possibly-incomplete days — see `subscribeToHistory` for why the
  `performedAt` ≤ `createdAt` + 1 day rule cap makes that bound safe.
- `/exercise/[[name]]` — the Progress tab: an exercise picker, then stat tiles, a chart
  (est. 1RM / top weight / volume per day) and every set grouped by day. `[name]` is the
  *stored* value (English for built-ins) and is optional: bare `/exercise` redirects to the
  last exercise viewed on this device (localStorage), or shows an empty state. Build links
  with `exerciseHref()`, never by hand — every exercise name in the app links here.

`initAuth()`, global body styles and the bottom `TabBar` (Log / History / Progress / Account) live in
`+layout.svelte` so a deep link to any route
signs in and looks right. The chart is hand-rolled SVG (`ProgressChart.svelte`) to keep a
charting library out of the bundle; the stats maths is in `src/lib/progress.ts`.

### Reactive auth state

`src/lib/firebase/auth.svelte.ts` holds a `$state` object exported as `auth`. The
`.svelte.ts` extension is what allows runes outside a component — the compiler only
processes rune syntax in `.svelte` and `.svelte.ts` files, so renaming it breaks the
module. `initAuth()` is idempotent and signs in anonymously when no user is present.

Every visitor starts anonymous, which gives a stable uid with no signup friction. The
Account tab (`/account`) upgrades it:

- **Create account** → `linkWithCredential` on the anonymous user. Same uid, so nothing
  moves. Then a verification email is sent (unverified accounts still work).
- **Sign in** to an existing account switches uid. `signIn` first snapshots the anonymous
  user's data (`migrate.ts`) — it must, because afterwards the rules deny reading it — then
  replays it under the new uid. The copies get a fresh `createdAt` and keep the training
  date in `performedAt`. The anonymous originals are orphaned, not deleted.
- **Sign out** → `onAuthStateChanged` sees no user and signs in anonymously again, so the
  app always has a uid.
- **Delete account** (`deleteAccount`, `DeleteAccount.svelte`, also offered to anonymous
  users as "Delete my data") → re-authenticate with the password (email accounts), delete
  every doc under `users/{uid}` (`deleteUserData`, awaited), *then* `deleteUser`. Order
  matters: once the auth user is gone the rules lock everyone out of the data, so a failure
  after that point would orphan it. Ends on a fresh anonymous session like sign-out.
  **Adding a new per-user collection means adding it to `deleteUserData` too.**

Read `auth.isAnonymous` / `auth.email` / `auth.emailVerified`, not `auth.user.*`: the
`User` is a class instance mutated in place by linking and `reload()`, so its fields
aren't reactive. Map new Firebase error codes in `authErrors` in `i18n.svelte.ts`.

Email/Password must be enabled in the Firebase Console (Authentication → Sign-in method),
or every attempt fails with `operation-not-allowed`.

### Privacy notice

`/privacy` is the GDPR notice (Datenschutzerklärung), German authoritative with an English
translation, linked from the Account tab. The text is written inline in
`src/routes/privacy/+page.svelte`, not in `i18n.svelte.ts`. **When the app starts
collecting or sending anything new** (analytics, another Firebase product, a new stored
field), update both language versions and `LAST_UPDATED` in that file.

### Translations

`src/lib/i18n.svelte.ts` holds the English and German UI strings and the reactive
`i18n.locale` (saved to localStorage, defaulting to the browser language). `de` is typed
against `en`, so a missing German string fails `npm run check`. Add new UI text to both.

Built-in exercise names are translated via `DEFAULT_EXERCISES` / `exerciseLabel()` in
`src/lib/firebase/exercises.ts`. The **English name is what gets stored** in workout
documents; translation is display-only, so switching language never forks history.
User-added exercise names are stored and shown exactly as typed.

Machines (`GYM80_MACHINES` in `src/lib/machines.ts`, McFIT's gym80 range) work the same way:
stored by English name in the same `exercise` field, so the data model and rules don't
distinguish them. `exerciseCategory()` derives the category from the name, and the picker
groups options under Machines / Exercises, with machines further split into one
sub-heading per entry of `GYM80_MACHINE_GROUPS` (product line · body part). Never rename a
shipped entry, and keep names unique across both lists.

## Notes

- `.firebaserc` is intentionally absent. Run `firebase use --add` to create it.
- `firestore.indexes.json` is empty. The queries in the app (`orderBy('createdAt')`, and
  `where('exercise', '==', …)` on the history page) are single-field, so they need no
  composite index. That's why `subscribeToExerciseHistory` sorts on the client rather
  than adding `orderBy` — combining the two would need one, and Firestore's error message
  links to a one-click creation URL.
- Bundle is ~204 KB gzipped, ~176 KB of which is the Firebase SDK. Svelte and the router
  are ~28 KB. If first paint becomes a concern, `await import()` the Firebase modules after
  the shell renders rather than trying to trim the SDK.
- The icons are generated placeholder art, not designed assets. `scripts/generate-icons.py`
  is pure stdlib (no Pillow); edit `BG`/`FG` there and re-run `npm run icons`.
