/**
 * Environment variables, read from `.env` at build time.
 *
 * The Firebase web config is public by design: it identifies the project and
 * authorises nothing (access control is firestore.rules). `static` inlines the
 * values into the bundle, which a static SPA needs — there is no server to
 * read them at runtime. No schema means each must be set but may be blank;
 * blank values leave the app in its "not configured" state (see client.ts).
 */
import { defineEnvVars } from '@sveltejs/kit/env';

const firebase = { public: true, static: true } as const;

export const variables = defineEnvVars({
	PUBLIC_FIREBASE_API_KEY: firebase,
	PUBLIC_FIREBASE_AUTH_DOMAIN: firebase,
	PUBLIC_FIREBASE_PROJECT_ID: firebase,
	PUBLIC_FIREBASE_STORAGE_BUCKET: firebase,
	PUBLIC_FIREBASE_MESSAGING_SENDER_ID: firebase,
	PUBLIC_FIREBASE_APP_ID: firebase,
	PUBLIC_USE_FIREBASE_EMULATORS: {
		...firebase,
		description: 'Set to "true" to use the local Firebase emulators.'
	}
});
