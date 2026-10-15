/**
 * Reactive auth state, as a rune-backed singleton.
 *
 * `.svelte.ts` lets us use runes outside a component. Consumers import
 * `auth` and read its fields directly in markup — the object is deeply
 * reactive, so mutating a property re-renders readers.
 *
 * Every visitor starts on an anonymous account. Email + password is an
 * upgrade on top: `createAccount` links a credential to the anonymous user
 * (same uid, so all data stays put), `signIn` switches to an existing
 * account and copies this device's anonymous data across.
 */
import {
	deleteUser,
	EmailAuthProvider,
	linkWithCredential,
	reauthenticateWithCredential,
	onAuthStateChanged,
	reload,
	sendEmailVerification,
	sendPasswordResetEmail,
	signInAnonymously,
	signInWithEmailAndPassword,
	signOut,
	type User
} from 'firebase/auth';
import { FirebaseError } from 'firebase/app';

import { getFirebase } from './client';
import { deleteUserData, importUserData, readUserData } from './migrate';

export const auth = $state<{
	user: User | null;
	loading: boolean;
	error: string | null;
	/**
	 * Mirrored from `user`: the User object is a class instance (not deeply
	 * reactive) and is mutated in place by linking and `reload()`, so these
	 * are what markup should read.
	 */
	isAnonymous: boolean;
	email: string | null;
	emailVerified: boolean;
}>({
	user: null,
	loading: true,
	error: null,
	isAnonymous: true,
	email: null,
	emailVerified: false
});

function sync(user: User | null): void {
	auth.user = user;
	auth.isAnonymous = user?.isAnonymous ?? true;
	auth.email = user?.email ?? null;
	auth.emailVerified = user?.emailVerified ?? false;
}

let started = false;

/**
 * Begin watching auth state, signing in anonymously if nobody is signed in —
 * including straight after `signOutUser()`, which lands on a fresh, empty
 * anonymous account.
 */
export function initAuth(): void {
	if (started) return;
	started = true;

	try {
		const { auth: firebaseAuth } = getFirebase();

		onAuthStateChanged(
			firebaseAuth,
			(user) => {
				sync(user);
				auth.loading = false;

				if (!user) {
					signInAnonymously(firebaseAuth).catch((error: unknown) => {
						auth.error = describe(error);
						auth.loading = false;
					});
				}
			},
			(error) => {
				auth.error = describe(error);
				auth.loading = false;
			}
		);
	} catch (error) {
		auth.error = describe(error);
		auth.loading = false;
	}
}

/** Language for Firebase's emails (verification, password reset). */
export function setAuthLanguage(locale: string): void {
	getFirebase().auth.languageCode = locale;
}

/**
 * Turn the current anonymous account into an email + password one. The uid
 * is unchanged, so every set and custom exercise carries over untouched.
 */
export async function createAccount(email: string, password: string): Promise<void> {
	const { auth: firebaseAuth } = getFirebase();
	const user = firebaseAuth.currentUser;
	if (!user) throw new Error('Not signed in.');

	const { user: linked } = await linkWithCredential(
		user,
		EmailAuthProvider.credential(email, password)
	);
	// Linking keeps the same user, so onAuthStateChanged doesn't fire.
	sync(linked);
	// Best effort: the account works either way, and there's a resend button.
	await sendEmailVerification(linked).catch(() => {});
}

/**
 * Sign in to an existing account. Anything logged anonymously on this device
 * is copied into it; returns how much was copied.
 */
export async function signIn(
	email: string,
	password: string,
	onCopyError: (error: Error) => void
): Promise<{ sets: number; exercises: number }> {
	const { auth: firebaseAuth } = getFirebase();
	const previous = firebaseAuth.currentUser;

	// Must be read before switching: afterwards the rules deny access to it.
	const pending = previous?.isAnonymous ? await readUserData(previous.uid) : null;

	const { user } = await signInWithEmailAndPassword(firebaseAuth, email, password);
	sync(user);

	if (!pending || (pending.workouts.length === 0 && pending.exercises.length === 0)) {
		return { sets: 0, exercises: 0 };
	}
	return importUserData(user.uid, pending, onCopyError);
}

export async function resetPassword(email: string): Promise<void> {
	const { auth: firebaseAuth } = getFirebase();
	await sendPasswordResetEmail(firebaseAuth, email);
}

export async function resendVerification(): Promise<void> {
	const user = getFirebase().auth.currentUser;
	if (user) await sendEmailVerification(user);
}

/** Re-fetch the user, e.g. to pick up a verification done in another tab. */
export async function refreshUser(): Promise<void> {
	const user = getFirebase().auth.currentUser;
	if (!user) return;
	await reload(user);
	sync(user);
}

/**
 * Permanently delete the current user: all their Firestore data, then the
 * auth account. `onAuthStateChanged` then sees no user and signs in a fresh
 * anonymous one, so the app keeps working.
 *
 * Email accounts must re-enter their password first. Firebase refuses to
 * delete an account without a recent sign-in, and asking up front avoids
 * deleting the data and then failing on the account.
 */
export async function deleteAccount(password?: string): Promise<void> {
	const { auth: firebaseAuth } = getFirebase();
	const user = firebaseAuth.currentUser;
	if (!user) throw new Error('Not signed in.');

	if (!user.isAnonymous) {
		if (!user.email || !password) throw new Error('Password required.');
		await reauthenticateWithCredential(user, EmailAuthProvider.credential(user.email, password));
	}

	// Data first: once the account is gone the rules lock everyone out of it.
	await deleteUserData(user.uid);
	await deleteUser(user);
}

export async function signOutUser(): Promise<void> {
	const { auth: firebaseAuth } = getFirebase();
	await signOut(firebaseAuth);
}

/** Firebase Auth error code without the `auth/` prefix, if it is one. */
export function authErrorCode(error: unknown): string | null {
	return error instanceof FirebaseError ? error.code.replace(/^auth\//, '') : null;
}

function describe(error: unknown): string {
	return error instanceof Error ? error.message : String(error);
}
