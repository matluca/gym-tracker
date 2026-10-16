<script lang="ts">
	/**
	 * Privacy notice (Datenschutzerklärung).
	 *
	 * The text lives here rather than in i18n.svelte.ts: it's long-form legal
	 * prose, and keeping each language as one readable block makes it easier
	 * to review and keep the two versions in step. German is the authoritative
	 * version; the English page says so.
	 *
	 * Keep this in sync with what the app actually does. If you add analytics,
	 * a new Firebase product, or another stored field, update both languages
	 * and `LAST_UPDATED` below.
	 */
	import { i18n } from '#lib/i18n.svelte.js';

	const t = $derived(i18n.t);
	const de = $derived(i18n.locale === 'de');

	const LAST_UPDATED = '2026-10-15';

	const updated = $derived(
		new Intl.DateTimeFormat(i18n.locale, { dateStyle: 'long' }).format(
			new Date(`${LAST_UPDATED}T12:00:00`)
		)
	);

</script>

<svelte:head>
	<title>{t.privacyTitle} · {t.appTitle}</title>
</svelte:head>

<main>
	<header>
		<h1>{t.privacyTitle}</h1>
	</header>

	<article>
		{#if de}
			<p class="meta">Stand: {updated}</p>

			<h2>1. Überblick</h2>
			<p>
				Gym Tracker ist ein Trainingstagebuch. Wir verarbeiten nur die Daten, die für diese Funktion
				nötig sind. Es gibt keine Werbung, kein Tracking, keine Analyse-Tools und keine Weitergabe
				zu Marketingzwecken.
			</p>

			<h2>2. Welche Daten wir verarbeiten</h2>
			<h3>Nutzung ohne Konto</h3>
			<p>
				Beim ersten Öffnen legt die App automatisch ein anonymes Konto an. Dafür wird eine zufällige
				Kennung (User-ID) erzeugt. Name oder E-Mail-Adresse werden dabei nicht erhoben. Mit dieser
				Kennung werden gespeichert:
			</p>
			<ul>
				<li>
					deine eingetragenen Sätze: Übung, Gewicht, Wiederholungen, Trainingsdatum und der Zeitpunkt
					der Eingabe,
				</li>
				<li>die Namen von Übungen, die du selbst hinzufügst.</li>
			</ul>

			<h3>Nutzung mit Konto</h3>
			<p>
				Wenn du ein Konto erstellst, verarbeiten wir zusätzlich deine E-Mail-Adresse, dein Passwort
				und ob deine E-Mail-Adresse bestätigt ist. Das Passwort wird von Firebase Authentication nur
				in verschlüsselter (gehashter) Form gespeichert und ist für uns nicht einsehbar. An deine
				E-Mail-Adresse senden wir ausschließlich Nachrichten, die für das Konto nötig sind
				(Bestätigung der Adresse, Zurücksetzen des Passworts), keinen Newsletter.
			</p>
			<p>
				Meldest du dich auf einem Gerät an, auf dem du vorher ohne Konto trainiert hast, werden diese
				Sätze in dein Konto kopiert.
			</p>

			<h3>Technische Daten</h3>
			<p>
				Beim Aufruf der App und bei jeder Verbindung zu Firebase werden technisch notwendige Daten
				verarbeitet, insbesondere deine IP-Adresse, Datum und Uhrzeit des Zugriffs sowie Browser- und
				Gerätetyp. Sie dienen der Auslieferung der App, der Anmeldung und der Abwehr von Missbrauch.
				Nach Angaben von Google speichert Firebase Authentication IP-Adressen für einige Wochen und
				Firebase Hosting für einige Monate.
			</p>

			<h2>3. Zwecke und Rechtsgrundlagen</h2>
			<ul>
				<li>
					<strong>Bereitstellung der App</strong> – Speichern deiner Trainingsdaten, Anmeldung,
					Synchronisation zwischen Geräten: Art. 6 Abs. 1 lit. b DSGVO (Erfüllung des
					Nutzungsverhältnisses).
				</li>
				<li>
					<strong>Sicherheit und Betrieb</strong> – technische Daten, Schutz vor Missbrauch: Art. 6
					Abs. 1 lit. f DSGVO. Unser berechtigtes Interesse ist ein sicherer und stabiler Betrieb.
				</li>
			</ul>
			<p>
				Die Bereitstellung der Daten ist freiwillig. Ohne sie lässt sich die App jedoch nicht nutzen.
				Es findet keine automatisierte Entscheidungsfindung oder Profilbildung statt.
			</p>

			<h2>4. Speicherung auf deinem Gerät</h2>
			<p>
				Die App speichert Daten in deinem Browser. Das ist für die angeforderten Funktionen technisch
				erforderlich (§ 25 Abs. 2 Nr. 2 TDDDG); eine Einwilligung ist dafür nicht nötig:
			</p>
			<ul>
				<li>Anmeldestatus (Firebase Authentication, IndexedDB),</li>
				<li>
					eine Kopie deiner Trainingsdaten, damit die App auch offline funktioniert (Firestore,
					IndexedDB),
				</li>
				<li>die App-Dateien selbst für die Offline-Nutzung (Service Worker),</li>
				<li>deine Sprachwahl und die zuletzt angesehene Übung (localStorage).</li>
			</ul>
			<p>Cookies zu Tracking- oder Werbezwecken setzen wir nicht.</p>

			<h2>5. Empfänger und Auftragsverarbeitung</h2>
			<p>
				Die App wird mit Google Firebase betrieben (Firebase Hosting, Firebase Authentication, Cloud
				Firestore). Anbieter ist die Google Ireland Limited, Gordon House, Barrow Street, Dublin 4,
				Irland. Google verarbeitet die Daten als Auftragsverarbeiter in unserem Auftrag auf Grundlage
				der Datenverarbeitungsbedingungen von Firebase bzw. Google Cloud (Art. 28 DSGVO).
			</p>

			<h2>6. Übermittlung in Drittländer</h2>
			<p>
				Firebase Authentication verarbeitet Kontodaten (Kennung, E-Mail-Adresse, Passwort-Hash,
				IP-Adresse) ausschließlich in den USA. Firebase Hosting ist ein weltweiter Dienst und kann
				Daten ebenfalls außerhalb der EU verarbeiten. Google LLC ist unter dem EU-U.S. Data Privacy
				Framework zertifiziert; für diese Übermittlungen besteht damit ein Angemessenheitsbeschluss der
				EU-Kommission (Art. 45 DSGVO).
			</p>

			<h2>7. Speicherdauer</h2>
			<ul>
				<li>
					Trainingsdaten und Konto speichern wir, bis du sie löschst. Einzelne Sätze kannst du
					jederzeit in der App löschen, dein gesamtes Konto mit allen Daten im Konto-Tab unter „Konto
					löschen“. Die Daten werden dabei sofort gelöscht; aus den Sicherungskopien von Google
					verschwinden sie nach dessen Angaben innerhalb von 180 Tagen.
				</li>
				<li>
					Ohne Konto kannst du deine Daten im Konto-Tab unter „Meine Daten löschen“ entfernen. Wenn du
					dich abmeldest oder die Websitedaten deines Browsers löschst, bevor du das tust, ist ein
					anonymes Konto nicht mehr erreichbar; die zugehörigen Daten bleiben dann gespeichert, bis du
					ihre Löschung verlangst.
				</li>
				<li>Technische Protokolle werden nach kurzer Zeit automatisch gelöscht (siehe Abschnitt 2).</li>
			</ul>

			<h2>8. Deine Rechte</h2>
			<p>Du hast nach der DSGVO folgende Rechte:</p>
			<ul>
				<li>Auskunft über deine gespeicherten Daten (Art. 15),</li>
				<li>Berichtigung unrichtiger Daten (Art. 16),</li>
				<li>Löschung (Art. 17) und Einschränkung der Verarbeitung (Art. 18),</li>
				<li>Datenübertragbarkeit (Art. 20),</li>
				<li>
					<strong>Widerspruch</strong> gegen Verarbeitungen auf Grundlage von Art. 6 Abs. 1 lit. f
					DSGVO aus Gründen, die sich aus deiner besonderen Situation ergeben (Art. 21).
				</li>
			</ul>
			<p>
				Wenn du uns dafür kontaktierst: Bei einem Konto genügt die E-Mail-Adresse, mit der du
				angemeldet bist. Bei anonymer Nutzung gib bitte die Kennung an, die im Konto-Tab angezeigt
				wird, damit wir deine Daten finden.
			</p>
			<p>
				Außerdem hast du das Recht, dich bei einer Datenschutz-Aufsichtsbehörde zu beschweren,
				insbesondere in dem Bundesland oder EU-Mitgliedstaat deines Wohnorts (Art. 77 DSGVO).
			</p>

			<h2>9. Änderungen</h2>
			<p>
				Wenn sich die App oder die rechtlichen Vorgaben ändern, passen wir diese Erklärung an. Es gilt
				die jeweils hier veröffentlichte Fassung.
			</p>
		{:else}
			<p class="meta">Last updated: {updated}</p>
			<p class="note">
				This is a translation for convenience. The German version is the legally binding one.
			</p>

			<h2>1. Overview</h2>
			<p>
				Gym Tracker is a workout log. We only process the data needed for that. There is no
				advertising, no tracking, no analytics, and no sharing of data for marketing.
			</p>

			<h2>2. What data we process</h2>
			<h3>Using the app without an account</h3>
			<p>
				When you first open the app, it automatically creates an anonymous account with a random
				identifier (user ID). No name or email address is collected. Stored under this identifier:
			</p>
			<ul>
				<li>the sets you log: exercise, weight, reps, training date, and when you entered them,</li>
				<li>the names of exercises you add yourself.</li>
			</ul>

			<h3>Using the app with an account</h3>
			<p>
				If you create an account, we also process your email address, your password, and whether
				your email address is confirmed. Firebase Authentication stores the password only in
				encrypted (hashed) form; we cannot see it. We only send account emails to your address
				(address confirmation, password reset), never newsletters.
			</p>
			<p>
				If you sign in on a device where you previously trained without an account, those sets are
				copied into your account.
			</p>

			<h3>Technical data</h3>
			<p>
				When you open the app and whenever it connects to Firebase, technically necessary data is
				processed, in particular your IP address, the date and time of access, and your browser and
				device type. This is used to deliver the app, sign you in, and prevent abuse. According to
				Google, Firebase Authentication keeps IP addresses for a few weeks and Firebase Hosting for a
				few months.
			</p>

			<h2>3. Purposes and legal bases</h2>
			<ul>
				<li>
					<strong>Providing the app</strong> — storing your training data, signing in, syncing between
					devices: Art. 6(1)(b) GDPR (performance of the user agreement).
				</li>
				<li>
					<strong>Security and operation</strong> — technical data, abuse prevention: Art. 6(1)(f)
					GDPR. Our legitimate interest is running the app securely and reliably.
				</li>
			</ul>
			<p>
				Providing data is voluntary, but the app can't work without it. There is no automated
				decision-making or profiling.
			</p>

			<h2>4. Storage on your device</h2>
			<p>
				The app stores data in your browser. This is strictly necessary for the features you use (§ 25
				(2) no. 2 TDDDG, the German telecommunications privacy law), so no consent is needed:
			</p>
			<ul>
				<li>your sign-in state (Firebase Authentication, IndexedDB),</li>
				<li>a copy of your training data so the app works offline (Firestore, IndexedDB),</li>
				<li>the app's own files for offline use (service worker),</li>
				<li>your language choice and the last exercise you viewed (localStorage).</li>
			</ul>
			<p>We do not set cookies for tracking or advertising.</p>

			<h2>5. Recipients and data processing</h2>
			<p>
				The app runs on Google Firebase (Firebase Hosting, Firebase Authentication, Cloud Firestore),
				provided by Google Ireland Limited, Gordon House, Barrow Street, Dublin 4, Ireland. Google
				processes data on our behalf as a processor under the Firebase / Google Cloud data
				processing terms (Art. 28 GDPR).
			</p>

			<h2>6. Transfers outside the EU</h2>
			<p>
				Firebase Authentication processes account data (identifier, email address, password hash, IP
				address) exclusively in the USA. Firebase Hosting is a global service and may also process
				data outside the EU. Google LLC is certified under the EU-U.S. Data Privacy Framework, so
				these transfers are covered by an adequacy decision of the European Commission (Art. 45 GDPR).
			</p>

			<h2>7. How long we keep data</h2>
			<ul>
				<li>
					We keep your training data and account until you delete them. You can delete individual sets
					in the app at any time, and your whole account with all its data on the Account tab under
					“Delete account”. The data is deleted immediately; according to Google, it is removed from
					its backups within 180 days.
				</li>
				<li>
					Without an account, you can remove your data on the Account tab under “Delete my data”. If
					you sign out or clear your browser's site data before doing so, an anonymous account can no
					longer be reached; its data then stays stored until you ask us to delete it.
				</li>
				<li>Technical logs are deleted automatically after a short time (see section 2).</li>
			</ul>

			<h2>8. Your rights</h2>
			<p>Under the GDPR you have the right to:</p>
			<ul>
				<li>access the data stored about you (Art. 15),</li>
				<li>have incorrect data corrected (Art. 16),</li>
				<li>have data deleted (Art. 17) or its processing restricted (Art. 18),</li>
				<li>data portability (Art. 20),</li>
				<li>
					<strong>object</strong> to processing based on Art. 6(1)(f) GDPR on grounds relating to your
					particular situation (Art. 21).
				</li>
			</ul>
			<p>
				When you contact us about them: with an account, the email address you sign in with is
				enough. For anonymous use, please include the identifier shown on the Account tab so we can
				find your data.
			</p>
			<p>
				You also have the right to lodge a complaint with a data protection supervisory authority, in
				particular in the German state or EU member state where you live (Art. 77 GDPR).
			</p>

			<h2>9. Changes</h2>
			<p>
				We update this notice when the app or the legal requirements change. The version published
				here applies.
			</p>
		{/if}
	</article>
</main>

<style>
	main {
		max-width: 40rem;
		margin: 0 auto;
		padding: 1.5rem 1rem 6rem;
	}

	header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.75rem;
		margin-bottom: 1.5rem;
	}

	h1 {
		font-size: 1.5rem;
		margin: 0;
	}

	article {
		color: #c3c9d1;
		font-size: 0.95rem;
		hyphens: auto;
	}

	h2 {
		font-size: 1.05rem;
		color: #e6e8eb;
		margin: 2rem 0 0.5rem;
	}

	h3 {
		font-size: 0.95rem;
		color: #e6e8eb;
		margin: 1.25rem 0 0.35rem;
	}

	p,
	ul {
		margin: 0 0 0.75rem;
	}

	ul {
		padding-left: 1.25rem;
	}

	li {
		margin-bottom: 0.35rem;
	}

	strong {
		color: #e6e8eb;
	}

	.meta {
		color: #78818c;
		font-size: 0.85rem;
	}

	.note {
		color: #9aa3ad;
		font-size: 0.85rem;
		font-style: italic;
	}

</style>
