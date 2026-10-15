<script lang="ts">
	/**
	 * Single-series line chart of one value per training day, in plain SVG.
	 *
	 * A charting library would roughly double the non-Firebase bundle for one
	 * line. The x-axis is real time (not evenly spaced sessions) so a gap in
	 * training shows as a gap. A crosshair snaps to the nearest session on
	 * hover/touch, and the arrow keys step through sessions when focused.
	 */
	type Point = { date: Date; value: number };

	let {
		points,
		label,
		unit,
		locale,
		formatValue
	}: {
		points: Point[];
		/** Accessible name for the chart as a whole. */
		label: string;
		unit: string;
		locale: string;
		formatValue: (value: number) => string;
	} = $props();

	const HEIGHT = 200;
	const PAD = { top: 16, right: 16, bottom: 28, left: 44 };

	let width = $state(320);
	let active = $state<number | null>(null);

	const innerW = $derived(Math.max(width - PAD.left - PAD.right, 1));
	const innerH = HEIGHT - PAD.top - PAD.bottom;

	const xDomain = $derived.by(() => {
		const times = points.map((p) => p.date.getTime());
		const min = Math.min(...times);
		const max = Math.max(...times);
		// One day of breathing room so a single point isn't pinned to an edge.
		return min === max ? [min - 86_400_000, max + 86_400_000] : [min, max];
	});

	/** "Nice" y ticks: a round step so the axis reads 60 / 70 / 80, never 63.4. */
	const yTicks = $derived.by(() => {
		const values = points.map((p) => p.value);
		let lo = Math.min(...values);
		let hi = Math.max(...values);
		if (lo === hi) {
			lo -= Math.max(1, lo * 0.05);
			hi += Math.max(1, hi * 0.05);
		}
		const raw = (hi - lo) / 4;
		const mag = 10 ** Math.floor(Math.log10(raw));
		const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= raw) ?? raw;
		const start = Math.floor(lo / step) * step;
		const end = Math.ceil(hi / step) * step;
		const ticks: number[] = [];
		for (let v = start; v <= end + step / 2; v += step) ticks.push(Number(v.toFixed(6)));
		return ticks;
	});

	const yMin = $derived(yTicks[0]);
	const yMax = $derived(yTicks[yTicks.length - 1]);

	function x(date: Date) {
		const [a, b] = xDomain;
		return PAD.left + ((date.getTime() - a) / (b - a)) * innerW;
	}

	function y(value: number) {
		return PAD.top + innerH - ((value - yMin) / (yMax - yMin)) * innerH;
	}

	const path = $derived(
		points.map((p, i) => `${i === 0 ? 'M' : 'L'}${x(p.date)},${y(p.value)}`).join('')
	);
	const area = $derived(
		points.length > 1
			? `${path}L${x(points[points.length - 1].date)},${PAD.top + innerH}L${x(points[0].date)},${PAD.top + innerH}Z`
			: ''
	);

	const dateShort = $derived(new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short' }));
	const dateLong = $derived(new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }));

	/** Up to ~4 x labels, always including the first and last session. */
	const xLabels = $derived.by(() => {
		if (points.length <= 4) return points.map((p) => p.date);
		const n = Math.min(4, Math.floor(innerW / 70));
		const out: Date[] = [];
		for (let i = 0; i < n; i++) {
			out.push(points[Math.round((i * (points.length - 1)) / (n - 1))].date);
		}
		return out;
	});

	const last = $derived(points[points.length - 1]);
	const shown = $derived(active !== null ? points[active] : null);

	function nearest(clientX: number, svg: SVGSVGElement) {
		const rect = svg.getBoundingClientRect();
		const px = clientX - rect.left;
		let best = 0;
		let bestDist = Infinity;
		points.forEach((p, i) => {
			const d = Math.abs(x(p.date) - px);
			if (d < bestDist) {
				bestDist = d;
				best = i;
			}
		});
		return best;
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
			event.preventDefault();
			const delta = event.key === 'ArrowRight' ? 1 : -1;
			const from = active ?? (delta > 0 ? -1 : points.length);
			active = Math.min(points.length - 1, Math.max(0, from + delta));
		} else if (event.key === 'Escape') {
			active = null;
		}
	}

	// Keep the tooltip inside the chart near the edges.
	const tooltipX = $derived(
		shown ? Math.min(Math.max(x(shown.date), PAD.left + 50), width - PAD.right - 50) : 0
	);
</script>

<div class="chart" bind:clientWidth={width}>
	<!-- Focusable so keyboard users can step through sessions with the arrow
	     keys; the readout below is aria-live, so each step is announced. -->
	<!-- svelte-ignore a11y_no_noninteractive_tabindex, a11y_no_noninteractive_element_interactions -->
	<svg
		{width}
		height={HEIGHT}
		role="img"
		aria-label={label}
		tabindex="0"
		onpointermove={(e) => (active = nearest(e.clientX, e.currentTarget))}
		onpointerdown={(e) => (active = nearest(e.clientX, e.currentTarget))}
		onpointerleave={(e) => {
			// Touch: keep the readout after lifting the finger.
			if (e.pointerType === 'mouse') active = null;
		}}
		onkeydown={handleKeydown}
		onblur={() => (active = null)}
	>
		{#each yTicks as tick (tick)}
			<line class="grid" x1={PAD.left} x2={width - PAD.right} y1={y(tick)} y2={y(tick)} />
			<text class="tick" x={PAD.left - 8} y={y(tick)} text-anchor="end" dominant-baseline="middle">
				{formatValue(tick)}
			</text>
		{/each}

		{#each xLabels as date, i (date.getTime())}
			<text
				class="tick"
				x={x(date)}
				y={HEIGHT - 8}
				text-anchor={i === 0 && xLabels.length > 1
					? 'start'
					: i === xLabels.length - 1 && xLabels.length > 1
						? 'end'
						: 'middle'}
			>
				{dateShort.format(date)}
			</text>
		{/each}

		{#if area}
			<path class="area" d={area} />
		{/if}
		<path class="line" d={path} />

		{#each points as p, i (p.date.getTime())}
			<circle class="dot" class:dot--active={i === active} cx={x(p.date)} cy={y(p.value)} r="4" />
		{/each}

		{#if shown}
			<line
				class="crosshair"
				x1={x(shown.date)}
				x2={x(shown.date)}
				y1={PAD.top}
				y2={PAD.top + innerH}
			/>
			<circle class="dot dot--active" cx={x(shown.date)} cy={y(shown.value)} r="5" />
		{:else if last}
			<!-- Direct label on the latest value only; the tooltip carries the rest. -->
			<text
				class="end-label"
				x={x(last.date)}
				y={y(last.value) - 12}
				text-anchor={points.length > 1 ? 'end' : 'middle'}
			>
				{formatValue(last.value)}
				{unit}
			</text>
		{/if}
	</svg>

	{#if shown}
		<div class="tooltip" style:left="{tooltipX}px" aria-live="polite">
			<strong>{formatValue(shown.value)} {unit}</strong>
			<span>{dateLong.format(shown.date)}</span>
		</div>
	{/if}
</div>

<style>
	.chart {
		position: relative;
		touch-action: pan-y;
	}

	svg {
		display: block;
		overflow: visible;
		cursor: crosshair;
	}

	svg:focus-visible {
		outline: 2px solid #4c8dff;
		outline-offset: 4px;
		border-radius: 0.25rem;
	}

	.grid {
		stroke: #252a33;
		stroke-width: 1;
	}

	.tick {
		fill: #78818c;
		font-size: 11px;
		font-variant-numeric: tabular-nums;
	}

	.line {
		fill: none;
		stroke: #4c8dff;
		stroke-width: 2;
		stroke-linejoin: round;
		stroke-linecap: round;
	}

	.area {
		fill: #4c8dff;
		opacity: 0.1;
	}

	.dot {
		fill: #4c8dff;
		/* Surface ring keeps dots legible where they sit on the line. */
		stroke: #171a21;
		stroke-width: 2;
	}

	.dot--active {
		fill: #e6e8eb;
	}

	.crosshair {
		stroke: #4a525e;
		stroke-width: 1;
	}

	.end-label {
		fill: #e6e8eb;
		font-size: 12px;
		font-weight: 600;
	}

	.tooltip {
		position: absolute;
		top: 0;
		transform: translate(-50%, -100%);
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 0.35rem 0.6rem;
		background: #0f1115;
		border: 1px solid #2d333d;
		border-radius: 0.4rem;
		white-space: nowrap;
		pointer-events: none;
		font-size: 0.8rem;
	}

	.tooltip strong {
		color: #e6e8eb;
		font-size: 0.95rem;
	}

	.tooltip span {
		color: #9aa3ad;
	}
</style>
