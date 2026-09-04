/**
 * Firebase client singletons.
 *
 * Everything here is browser-only. Initialisation is lazy so that importing
 * this module never has a side effect during the build — only the first call
 * to `getFirebase()` actually spins Firebase up.
 */
import { getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import { connectAuthEmulator, getAuth, type Auth } from 'firebase/auth';
import {
	connectFirestoreEmulator,
	initializeFirestore,
	persistentLocalCache,
	persistentMultipleTabManager,
	type Firestore
} from 'firebase/firestore';

import {
	PUBLIC_FIREBASE_API_KEY,
	PUBLIC_FIREBASE_APP_ID,
	PUBLIC_FIREBASE_AUTH_DOMAIN,
	PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
	PUBLIC_FIREBASE_PROJECT_ID,
	PUBLIC_FIREBASE_STORAGE_BUCKET,
	PUBLIC_USE_FIREBASE_EMULATORS
} from '$env/static/public';

const firebaseConfig = {
	apiKey: PUBLIC_FIREBASE_API_KEY,
	authDomain: PUBLIC_FIREBASE_AUTH_DOMAIN,
	projectId: PUBLIC_FIREBASE_PROJECT_ID,
	storageBucket: PUBLIC_FIREBASE_STORAGE_BUCKET,
	messagingSenderId: PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
	appId: PUBLIC_FIREBASE_APP_ID
};

const useEmulators = PUBLIC_USE_FIREBASE_EMULATORS === 'true';

/** True once the blank placeholders in `.env` have been replaced with real values. */
export const isConfigured = firebaseConfig.apiKey.length > 0 && firebaseConfig.projectId.length > 0;

type FirebaseServices = { app: FirebaseApp; auth: Auth; db: Firestore };

let services: FirebaseServices | undefined;

export function getFirebase(): FirebaseServices {
	if (services) return services;

	if (!isConfigured) {
		throw new Error(
			'Firebase is not configured. Copy .env.example to .env and fill in your project values.'
		);
	}

	const app = getApps()[0] ?? initializeApp(firebaseConfig);

	// `initializeFirestore` (rather than `getFirestore`) is what lets us opt into
	// the IndexedDB-backed offline cache. This is the modern replacement for the
	// deprecated `enableIndexedDbPersistence()`, and it is what makes reads and
	// writes work with no network — the offline half of "progressive web app".
	const db = initializeFirestore(app, {
		localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() })
	});

	const auth = getAuth(app);

	if (useEmulators) {
		connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
		connectFirestoreEmulator(db, '127.0.0.1', 8080);
	}

	services = { app, auth, db };
	return services;
}
