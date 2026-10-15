<script lang="ts">
	/**
	 * Type-to-filter dropdown for choosing an exercise, following the WAI-ARIA
	 * combobox pattern (input + listbox, focus stays on the input and the active
	 * option is tracked with aria-activedescendant).
	 *
	 * Each option has a stored `value` and a display `label` (they differ for
	 * translated built-ins). `value` is only ever an option's value, or '' when
	 * nothing valid is selected. Typing matches against both, so "squat" finds
	 * "Kniebeuge" in German. When the typed text matches nothing, an extra
	 * "Add …" option calls `onAdd`; the parent is expected to add it to `options`.
	 */
	import { i18n } from '$lib/i18n.svelte';

	export type PickerOption = { value: string; label: string };

	let {
		value = $bindable(''),
		options,
		onAdd,
		id = 'exercise-picker'
	}: {
		value?: string;
		options: PickerOption[];
		onAdd: (name: string) => void;
		id?: string;
	} = $props();

	type Item = { kind: 'option'; option: PickerOption } | { kind: 'add'; name: string };

	function labelFor(v: string): string {
		return options.find((o) => o.value === v)?.label ?? v;
	}

	let text = $state(labelFor(value));
	let open = $state(false);
	// True only after the user types. Opening the list with something already
	// selected shows every exercise, not just the one matching the current text.
	let filtering = $state(false);
	let activeIndex = $state(-1);
	let listEl = $state<HTMLUListElement>();
	let inputEl = $state<HTMLInputElement>();
	// The last value this component wrote, so the effect below can tell a
	// parent-driven change (e.g. clearing after save) from our own.
	let lastWritten = value;

	const listboxId = $derived(`${id}-listbox`);

	// Mirror changes made by the parent (e.g. clearing after a save) into the input.
	$effect(() => {
		if (value !== lastWritten) {
			text = labelFor(value);
			lastWritten = value;
		}
	});

	const query = $derived(text.trim());
	const exactMatch = $derived.by(() => {
		const q = query.toLowerCase();
		return (
			options.find((o) => o.label.toLowerCase() === q) ??
			options.find((o) => o.value.toLowerCase() === q) ??
			null
		);
	});

	// When the language switches, re-label the current selection.
	$effect(() => {
		if (value && document.activeElement !== inputEl) text = labelFor(value);
	});

	const items = $derived.by((): Item[] => {
		const q = filtering ? query.toLowerCase() : '';
		const collator = new Intl.Collator(i18n.locale);
		const rank = (o: PickerOption) => {
			const label = o.label.toLowerCase();
			if (label.startsWith(q)) return 0;
			if (label.includes(q)) return 1;
			return 2; // matched only on the stored (English) value
		};
		const matches = q
			? options
					.filter(
						(o) => o.label.toLowerCase().includes(q) || o.value.toLowerCase().includes(q)
					)
					.sort((a, b) => rank(a) - rank(b) || collator.compare(a.label, b.label))
			: [...options].sort((a, b) => collator.compare(a.label, b.label));

		const list: Item[] = matches.map((option) => ({ kind: 'option', option }));
		if (filtering && query && !exactMatch) list.push({ kind: 'add', name: query });
		return list;
	});

	function optionId(index: number) {
		return `${id}-option-${index}`;
	}

	function setValue(next: string) {
		lastWritten = next;
		value = next;
	}

	function syncValueFromText() {
		setValue(exactMatch?.value ?? '');
	}

	function choose(item: Item) {
		if (item.kind === 'add') {
			onAdd(item.name);
			setValue(item.name);
			text = item.name;
		} else {
			setValue(item.option.value);
			text = item.option.label;
		}
		open = false;
		filtering = false;
		activeIndex = -1;
	}

	function openList() {
		if (open) return;
		open = true;
		filtering = false;
		const current = items.findIndex((i) => i.kind === 'option' && i.option.value === value);
		activeIndex = current;
		if (current >= 0) {
			// Show the current pick in the list rather than the top of the alphabet.
			requestAnimationFrame(() =>
				listEl
					?.querySelector(`#${CSS.escape(optionId(current))}`)
					?.scrollIntoView({ block: 'nearest' })
			);
		}
	}

	function handleFocus() {
		openList();
		// Select the prefilled name so typing replaces it instead of appending.
		if (value) inputEl?.select();
	}

	function moveActive(delta: number) {
		if (!open) {
			openList();
			return;
		}
		if (items.length === 0) return;
		activeIndex = (activeIndex + delta + items.length) % items.length;
		listEl
			?.querySelector(`#${CSS.escape(optionId(activeIndex))}`)
			?.scrollIntoView({ block: 'nearest' });
	}

	function handleInput() {
		syncValueFromText();
		open = true;
		filtering = true;
		// Keep the top result highlighted so Enter picks it.
		activeIndex = items.length > 0 ? 0 : -1;
	}

	function handleKeydown(event: KeyboardEvent) {
		switch (event.key) {
			case 'ArrowDown':
				event.preventDefault();
				moveActive(1);
				break;
			case 'ArrowUp':
				event.preventDefault();
				moveActive(-1);
				break;
			case 'Enter':
				// Only swallow Enter when it picks something; otherwise let the form submit.
				if (open && activeIndex >= 0 && items[activeIndex]) {
					event.preventDefault();
					choose(items[activeIndex]);
				}
				break;
			case 'Escape':
				if (open) {
					event.preventDefault();
					open = false;
					activeIndex = -1;
				}
				break;
			case 'Tab':
				open = false;
				break;
		}
	}

	function handleBlur() {
		open = false;
		activeIndex = -1;
		// Snap the text to the display label of a match, e.g. "back SQUAT"
		// becomes "Back squat" (or "Kniebeuge" in German).
		if (exactMatch) text = exactMatch.label;
		syncValueFromText();
	}
</script>

<div class="picker">
	<div class="field">
		<input
			{id}
			bind:this={inputEl}
			bind:value={text}
			placeholder={i18n.t.pickerPlaceholder}
			type="text"
			role="combobox"
			autocomplete="off"
			autocapitalize="sentences"
			spellcheck="false"
			aria-autocomplete="list"
			aria-expanded={open}
			aria-controls={listboxId}
			aria-activedescendant={open && activeIndex >= 0 ? optionId(activeIndex) : undefined}
			aria-invalid={query.length > 0 && !value}
			oninput={handleInput}
			onkeydown={handleKeydown}
			onfocus={handleFocus}
			onclick={openList}
			onblur={handleBlur}
		/>
		<button
			type="button"
			class="toggle"
			tabindex="-1"
			aria-label={open ? i18n.t.pickerHide : i18n.t.pickerShow}
			onmousedown={(e) => e.preventDefault()}
			onclick={() => {
				if (open) {
					open = false;
				} else {
					inputEl?.focus();
					openList();
				}
			}}
		>
			<svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true">
				<path d="M5 7.5 10 12.5 15 7.5" fill="none" stroke="currentColor" stroke-width="2" />
			</svg>
		</button>
	</div>

	{#if open}
		<ul id={listboxId} role="listbox" class="list" bind:this={listEl}>
			{#each items as item, index (item.kind === 'add' ? 'add' : 'opt:' + item.option.value)}
				<!-- Focus never leaves the input; keyboard handling lives there. -->
				<!-- svelte-ignore a11y_click_events_have_key_events -->
				<li
					id={optionId(index)}
					role="option"
					aria-selected={index === activeIndex}
					class:active={index === activeIndex}
					class:add={item.kind === 'add'}
					onmousedown={(e) => e.preventDefault()}
					onclick={() => choose(item)}
					onmousemove={() => (activeIndex = index)}
				>
					{#if item.kind === 'add'}
						+ {i18n.t.pickerAdd(item.name)}
					{:else}
						{item.option.label}
					{/if}
				</li>
			{:else}
				<li class="empty" role="presentation">{i18n.t.pickerEmpty}</li>
			{/each}
		</ul>
	{/if}
</div>

<style>
	.picker {
		position: relative;
	}

	.field {
		position: relative;
		display: flex;
	}

	input {
		flex: 1;
		min-width: 0;
		background: #0f1115;
		border: 1px solid #2d333d;
		border-radius: 0.5rem;
		padding: 0.6rem 2.4rem 0.6rem 0.7rem;
		color: #e6e8eb;
		font-size: 1rem;
		font-family: inherit;
	}

	input:focus-visible {
		outline: 2px solid #4c8dff;
		outline-offset: 1px;
	}

	.toggle {
		position: absolute;
		right: 0.25rem;
		top: 50%;
		transform: translateY(-50%);
		display: grid;
		place-items: center;
		background: transparent;
		color: #9aa3ad;
		border: none;
		padding: 0.4rem;
		cursor: pointer;
	}

	.list {
		position: absolute;
		z-index: 10;
		left: 0;
		right: 0;
		top: calc(100% + 0.25rem);
		max-height: 16rem;
		overflow-y: auto;
		margin: 0;
		padding: 0.25rem;
		list-style: none;
		background: #171a21;
		border: 1px solid #2d333d;
		border-radius: 0.5rem;
		box-shadow: 0 8px 24px rgb(0 0 0 / 0.4);
	}

	li {
		padding: 0.5rem 0.6rem;
		border-radius: 0.35rem;
		color: #e6e8eb;
		font-size: 0.95rem;
		cursor: pointer;
	}

	li.active {
		background: #252a33;
	}

	li.add {
		color: #4c8dff;
		font-weight: 600;
	}

	li.empty {
		color: #78818c;
		cursor: default;
	}
</style>
