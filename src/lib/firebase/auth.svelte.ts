/**
 * Reactive auth state, as a rune-backed singleton.
 *
 * `.svelte.ts` lets us use runes outside a component. Consumers import
 * `auth` and read `auth.user` / `auth.loading` directly in markup — the
 * object is deeply reactive, so mutating a property re-renders readers.
 */
import { onAuthStateChanged, signInAnonymously, signOut, type User } from 'firebase/auth';

import { getFirebase } from './client';

export const auth = $state<{
	user: User | null;
	loading: boolean;
	error: string | null;
}>({
	user: null,
	loading: true,
	error: null
});

let started = false;

/**
 * Begin watching auth state, signing in anonymously if nobody is signed in.
 *
 * Anonymous auth gives every visitor a stable uid with no signup friction,
 * which is enough to make the security rules meaningful from day one. Upgrade
 * to a real provider later with `linkWithCredential` — the uid is preserved,
 * so existing workouts carry over.
 */
export function initAuth(): void {
	if (started) return;
	started = true;

	try {
		const { auth: firebaseAuth } = getFirebase();

		onAuthStateChanged(
			firebaseAuth,
			(user) => {
				auth.user = user;
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

export async function signOutUser(): Promise<void> {
	const { auth: firebaseAuth } = getFirebase();
	await signOut(firebaseAuth);
}

function describe(error: unknown): string {
	return error instanceof Error ? error.message : String(error);
}
