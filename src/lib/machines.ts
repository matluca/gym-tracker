export type Machine = {
	/**
	 * gym80 article number, lowercased as in their product URLs. Several
	 * articles can share one entry (e.g. two back extension models); `id` is
	 * the one linked to.
	 */
	id: string;
	en: string;
	de: string;
};

export type MachineGroup = {
	/** Stable id, used for ordering and DOM ids. Not stored anywhere. */
	key: string;
	/** gym80 product line, shown as-is in both languages. */
	line: string;
	en: string;
	de: string;
	machines: readonly Machine[];
};

/**
 * Built-in machines: gym80's strength range, which is what McFIT studios are
 * fitted with. Taken from the gym80 catalogue (gym80.de, October 2026):
 * SYGNUM (weight stack), PURE KRAFT (plate loaded), the BASIC benches and
 * machines, and the 80ATHLETICS machines. Left out are multi-user towers,
 * combo and Cable Art units, racks and accessories — nothing you'd log a set
 * "on". gym80 files the BASIC range under "Accessories & Essentials", but its
 * benches and stations are trained on, so they are included.
 *
 * `de` is gym80's own name, so it matches the label on the machine. Like
 * exercises, the English name is the value stored in workout documents and
 * must never change once shipped, or logged history splits in two. Names must
 * also not collide with DEFAULT_EXERCISES (case-insensitively), in either
 * language.
 *
 * Grouped by product line and body part; the picker shows one sub-heading per
 * group, in this order.
 */
export const GYM80_MACHINE_GROUPS: readonly MachineGroup[] = [
	{
		key: 'sygnum-legs',
		line: 'SYGNUM',
		en: 'Legs & glutes',
		de: 'Beine & Po',
		machines: [
			{ id: '3001', en: 'Seated leg extension', de: 'Beinstrecker sitzend' },
			{ id: '3123', en: 'Lying leg extension', de: 'Beinstrecker liegend' },
			{ id: '3002', en: 'Lying leg curl', de: 'Beinbeuger liegend' },
			{ id: '3003', en: 'Seated leg curl', de: 'Beinbeuger sitzend' },
			{ id: '3013', en: 'Standing leg curl', de: 'Beinbeuger stehend' },
			{ id: '3030', en: 'Seated leg press', de: 'Beinpresse sitzend' },
			{ id: '3031', en: 'Lying leg press', de: 'Beinpresse liegend' },
			{ id: '3046', en: 'Leg press dual', de: 'Beinpresse Dual' },
			{ id: '3004', en: 'Kneeling glute kick', de: 'Gluteus Kick kniend' },
			{ id: '3005', en: 'Radial glute kick', de: 'Gluteus Kick radial' },
			{ id: '3006', en: 'Kick machine', de: 'Kickmaschine' },
			{ id: '3028', en: 'Abductor machine', de: 'Abduktionsmaschine' },
			{ id: '3029', en: 'Adductor machine', de: 'Adduktionsmaschine' },
			{ id: '3069', en: 'Standing abduction', de: 'Stehende Abduktion' },
			{ id: '4416', en: 'Bootymizer', de: 'Bootymizer' },
			{ id: '3018', en: 'Standing calf machine', de: 'Wadenmaschine stehend' },
			{ id: '3027', en: 'Seated calf press', de: 'Wadenpresse sitzend' },
			{ id: '3094', en: 'Donkey calf raise', de: 'Donkey Calf Raise' }
		]
	},
	{
		key: 'sygnum-chest',
		line: 'SYGNUM',
		en: 'Chest',
		de: 'Brust',
		machines: [
			{ id: '3016', en: 'Chest press', de: 'Brustpresse' },
			{ id: '3041', en: 'Chest press dual', de: 'Brustpresse Dual' },
			{ id: '3014', en: 'Chest machine', de: 'Brustmaschine' },
			{ id: '3121', en: 'Standing chest machine', de: 'Brustmaschine stehend' },
			{ id: '3097', en: 'Inner chest press', de: 'Inner Chest Press' },
			{ id: '3023n', en: 'Incline press machine', de: 'Schrägbank' },
			{ id: '3042', en: 'Incline press dual', de: 'Schrägbank Dual' },
			{ id: '3022', en: 'Butterfly', de: 'Butterfly' },
			{ id: '3021', en: 'Butterfly with pads', de: 'Butterfly mit Pads' },
			{ id: '3012n', en: 'Pullover machine', de: 'Überzugmaschine' }
		]
	},
	{
		key: 'sygnum-back',
		line: 'SYGNUM',
		en: 'Back',
		de: 'Rücken',
		machines: [
			{ id: '3020', en: 'Lat pulldown machine', de: 'Rückenzugmaschine' },
			{ id: '3044', en: 'Lat pulldown dual', de: 'Rückenzugmaschine Dual' },
			{ id: '3047', en: 'Iso lat', de: 'Iso Lat' },
			{ id: '3040', en: 'Row machine', de: 'Rudermaschine' },
			{
				id: '3039',
				en: 'Row machine without chest pad',
				de: 'Rudermaschine ohne Brustpolster'
			},
			{ id: '3045', en: 'Row dual', de: 'Rudermaschine Dual' },
			{ id: '3007', en: 'Back extension machine', de: 'Rückenstrecker' },
			{ id: '3017', en: 'Assisted pull-up and dip machine', de: 'Klimmzug-Barrenmaschine' }
		]
	},
	{
		key: 'sygnum-shoulders',
		line: 'SYGNUM',
		en: 'Shoulders',
		de: 'Schultern',
		machines: [
			{ id: '3032', en: 'Shoulder press machine', de: 'Schulterpresse' },
			{ id: '3043', en: 'Shoulder press dual', de: 'Schulterpresse Dual' },
			{ id: '3096', en: 'Neck press machine', de: 'Nackendrückmaschine' },
			{ id: '3050', en: 'Lateral raise machine', de: 'Seithebemaschine' },
			{ id: '3099', en: 'Standing lateral raise machine', de: 'Seithebemaschine stehend' },
			{ id: '3025', en: 'Reverse butterfly', de: 'Butterfly Reverse' }
		]
	},
	{
		key: 'sygnum-arms',
		line: 'SYGNUM',
		en: 'Arms',
		de: 'Arme',
		machines: [
			{ id: '3010', en: 'Biceps machine', de: 'Bizepsmaschine' },
			{ id: '3098', en: 'Horizontal biceps machine', de: 'Bizeps horizontal' },
			{ id: '3011', en: 'Triceps machine', de: 'Trizepsmaschine' },
			{ id: '3095', en: 'Overhead triceps machine', de: 'Trizeps Überkopf' },
			{ id: '3036', en: 'Dip machine', de: 'Dipmaschine' },
			{ id: '3071', en: 'Forearm machine', de: 'Unterarmmaschine' }
		]
	},
	{
		key: 'sygnum-core',
		line: 'SYGNUM',
		en: 'Core',
		de: 'Rumpf',
		machines: [
			{ id: '3037', en: 'Ab machine', de: 'Bauchmuskelmaschine' },
			{ id: '3124', en: 'Crunch machine', de: 'Crunchmaschine' },
			{ id: '3008', en: 'Seated jackknife', de: 'Klappsitz' },
			{ id: '3034', en: 'Lying jackknife', de: 'Klappsitz liegend' },
			{ id: '3225', en: 'Rotary torso', de: 'Rotationsmaschine' }
		]
	},
	{
		key: 'sygnum-innovation',
		line: 'SYGNUM',
		en: 'Innovation & FTM',
		de: 'Innovation & FTM',
		machines: [
			{ id: '5001', en: 'Innovation leg press', de: 'Innovation Beinpresse' },
			{ id: '5002', en: 'Innovation glute machine', de: 'Innovation Gluteusmaschine' },
			{ id: '5003', en: 'Innovation row', de: 'Innovation Rudermaschine' },
			{
				id: '5006',
				en: 'Innovation multi-extension',
				de: 'Innovation Multistreckmaschine'
			},
			{ id: '5004', en: 'Innovation curl machine', de: 'Innovation Curler-Maschine' },
			{ id: '4401', en: 'FTM deadlift machine', de: 'FTM Deadlift-Maschine' },
			{
				id: '4402',
				en: 'FTM shoulder and chest press',
				de: 'FTM Schulter- und Brustpresse'
			},
			{ id: '4403', en: 'FTM pull and push machine', de: 'FTM Zug- und Drückmaschine' }
		]
	},
	{
		key: 'sygnum-cable',
		line: 'SYGNUM',
		en: 'Cable stations',
		de: 'Kabelzugstationen',
		machines: [
			{ id: '4004', en: 'Cable crossover', de: 'Kabelzug Crossover' },
			{
				id: '4012',
				en: 'Adjustable cable crossover',
				de: 'Kabelzug Crossover verstellbar'
			},
			{ id: '4034', en: 'Dual adjustable cable', de: 'Dual verstellbarer Seilzug' },
			{ id: '4134', en: 'Universal cable', de: 'Seilzug universal' },
			{ id: '4125', en: 'Explosive cable', de: 'Seilzug Explosiv' },
			{ id: '4042', en: 'Cable V-station', de: 'Seilzug V-Station' },
			{ id: '4016', en: 'Seated row station', de: 'Ruderstation' },
			{ id: '4116', en: 'Lat pulldown station', de: 'Rückenzugstation' },
			{ id: '4900', en: 'Incline row combo', de: 'Incline Row Combo' }
		]
	},
	{
		key: 'pure-kraft-legs',
		line: 'PURE KRAFT',
		en: 'Legs & glutes',
		de: 'Beine & Po',
		machines: [
			{ id: '4038n', en: 'Pure Kraft squat machine', de: 'Pure Kraft Kniebeugemaschine' },
			{ id: '4159n', en: 'Pure Kraft hack squat', de: 'Pure Kraft Hackenschmidt' },
			{ id: '4353n', en: 'Pure Kraft pendulum squat', de: 'Pure Kraft Pendulum Squat' },
			{ id: '4360', en: 'Pure Kraft belt squat', de: 'Pure Kraft Belt Squat' },
			{ id: '4389', en: 'Pure Kraft leverage squat', de: 'Pure Kraft Leverage Squat' },
			{ id: '4023', en: 'Pure Kraft 45° leg press', de: 'Pure Kraft 45-Grad-Beinpresse' },
			{
				id: '4324',
				en: 'Pure Kraft 45° pivot leg press',
				de: 'Pure Kraft 45-Grad-Pivot-Beinpresse'
			},
			{
				id: '4314',
				en: 'Pure Kraft seated leg press dual',
				de: 'Pure Kraft Beinpresse sitzend Dual'
			},
			{
				id: '4354',
				en: 'Pure Kraft vertical leg press',
				de: 'Pure Kraft Vertikale Beinpresse'
			},
			{ id: '4391', en: 'Pure Kraft 3D leg machine', de: 'Pure Kraft 3D Leg Machine' },
			{ id: '4336n', en: 'Pure Kraft leg extension', de: 'Pure Kraft Beinstrecker' },
			{
				id: '4392',
				en: 'Pure Kraft standing leg extension',
				de: 'Pure Kraft Beinstrecker stehend'
			},
			{ id: '4337n', en: 'Pure Kraft leg curl', de: 'Pure Kraft Beinbeuger' },
			{
				id: '4373',
				en: 'Pure Kraft standing leg curl',
				de: 'Pure Kraft Beinbeuger stehend'
			},
			{ id: '4375', en: 'Pure Kraft inverse leg curl', de: 'Pure Kraft Inverse Leg Curl' },
			{ id: '4321', en: 'Pure Kraft glute kick', de: 'Pure Kraft Gluteus-Kick-Maschine' },
			{ id: '4352', en: 'Pure Kraft booty booster', de: 'Pure Kraft Booty Booster' },
			{
				id: '4386n',
				en: 'Pure Kraft booty booster special',
				de: 'Pure Kraft Booty Booster Special'
			},
			{
				id: '4374',
				en: 'Pure Kraft standing abduction',
				de: 'Pure Kraft Stehende Abduktion'
			},
			{ id: '4384', en: 'Pure Kraft abduction 3D', de: 'Pure Kraft Abduktion 3D' },
			{
				id: '4026',
				en: 'Pure Kraft seated calf machine',
				de: 'Pure Kraft Wadenmaschine sitzend'
			},
			{
				id: '4345',
				en: 'Pure Kraft 55° standing calf machine',
				de: 'Pure Kraft 55-Grad-Wadenmaschine stehend'
			},
			{ id: '4380', en: 'Pure Kraft donkey calf', de: 'Pure Kraft Donkey Calf' },
			{
				id: '4348',
				en: 'Pure Kraft seated tibialis machine',
				de: 'Pure Kraft Tibialismaschine sitzend'
			}
		]
	},
	{
		key: 'pure-kraft-chest',
		line: 'PURE KRAFT',
		en: 'Chest',
		de: 'Brust',
		machines: [
			{
				id: '4328',
				en: 'Pure Kraft seated bench press dual',
				de: 'Pure Kraft Bankdrückmaschine sitzend Dual'
			},
			{
				id: '4331',
				en: 'Pure Kraft lying press dual',
				de: 'Pure Kraft Drückbank liegend Dual'
			},
			{ id: '4329n', en: 'Pure Kraft incline press dual', de: 'Pure Kraft Schrägbank Dual' },
			{
				id: '4346',
				en: 'Pure Kraft decline press dual',
				de: 'Pure Kraft Negativdrückbank Dual'
			},
			{
				id: '4326',
				en: 'Pure Kraft chest machine dual',
				de: 'Pure Kraft Brustmaschine Dual'
			},
			{
				id: '4376',
				en: 'Pure Kraft lying inner chest dual',
				de: 'Pure Kraft Inner Chest liegend Dual'
			},
			{ id: '4341', en: 'Pure Kraft butterfly dual', de: 'Pure Kraft Butterfly Dual' },
			{ id: '4390', en: 'Pure Kraft butterfly 50°', de: 'Pure Kraft Butterfly 50 Grad' },
			{ id: '4350n', en: 'Pure Kraft pullover machine', de: 'Pure Kraft Überzugmaschine' }
		]
	},
	{
		key: 'pure-kraft-back',
		line: 'PURE KRAFT',
		en: 'Back',
		de: 'Rücken',
		machines: [
			{
				id: '4311',
				en: 'Pure Kraft lat pulldown dual',
				de: 'Pure Kraft Rückenzugmaschine Dual'
			},
			{ id: '4340', en: 'Pure Kraft high row dual', de: 'Pure Kraft High Row Dual' },
			{
				id: '4382',
				en: 'Pure Kraft high row with moving handles',
				de: 'Pure Kraft High Row mit beweglichen Griffen'
			},
			{ id: '4319', en: 'Pure Kraft low row dual', de: 'Pure Kraft Low Row Dual' },
			{
				id: '4322',
				en: 'Pure Kraft seated row dual',
				de: 'Pure Kraft Rudermaschine sitzend Dual'
			},
			{ id: '4327', en: 'Pure Kraft power row dual', de: 'Pure Kraft Power Row Dual' },
			{
				id: '4383',
				en: 'Pure Kraft 55° row machine',
				de: 'Pure Kraft 55-Grad-Rudermaschine'
			},
			{ id: '4018', en: 'Pure Kraft T-bar row', de: 'Pure Kraft Rudermaschine T-Bar' },
			{
				id: '4318',
				en: 'Pure Kraft multi-grip landmine',
				de: 'Pure Kraft Bodenhantel Multi-Grip'
			},
			{
				id: '4332',
				en: 'Pure Kraft deadlift rotating handles dual',
				de: 'Pure Kraft Deadlift Drehgriffe Dual'
			},
			{
				id: '4333',
				en: 'Pure Kraft deadlift double handles dual',
				de: 'Pure Kraft Deadlift Doppelgriffe Dual'
			},
			{
				id: '4372',
				en: 'Pure Kraft standing multi-joint',
				de: 'Pure Kraft Multigelenk stehend'
			}
		]
	},
	{
		key: 'pure-kraft-shoulders',
		line: 'PURE KRAFT',
		en: 'Shoulders',
		de: 'Schultern',
		machines: [
			{
				id: '4320',
				en: 'Pure Kraft shoulder machine dual',
				de: 'Pure Kraft Schultermaschine Dual'
			},
			{
				id: '4371',
				en: 'Pure Kraft neck press machine',
				de: 'Pure Kraft Nackendrückmaschine'
			},
			{ id: '4388', en: 'Pure Kraft viking press', de: 'Pure Kraft Viking Press' },
			{
				id: '4325',
				en: 'Pure Kraft lateral raise dual',
				de: 'Pure Kraft Seithebemaschine Dual'
			},
			{
				id: '4385',
				en: 'Pure Kraft standing lateral raise',
				de: 'Pure Kraft Seithebemaschine stehend'
			},
			{
				id: '4344',
				en: 'Pure Kraft reverse butterfly dual',
				de: 'Pure Kraft Butterfly Reverse Dual'
			}
		]
	},
	{
		key: 'pure-kraft-arms',
		line: 'PURE KRAFT',
		en: 'Arms',
		de: 'Arme',
		machines: [
			{ id: '4338n', en: 'Pure Kraft biceps machine', de: 'Pure Kraft Bizepsmaschine' },
			{
				id: '4355',
				en: 'Pure Kraft biceps machine dual',
				de: 'Pure Kraft Bizepsmaschine Dual'
			},
			{ id: '4366', en: 'Pure Kraft overhead biceps', de: 'Pure Kraft Bizeps Überkopf' },
			{ id: '4339n', en: 'Pure Kraft triceps machine', de: 'Pure Kraft Trizepsmaschine' },
			{ id: '4379', en: 'Pure Kraft overhead triceps', de: 'Pure Kraft Trizeps Überkopf' },
			{
				id: '4335',
				en: 'Pure Kraft triceps dip machine dual',
				de: 'Pure Kraft Trizeps-Dip-Maschine Dual'
			}
		]
	},
	{
		key: 'pure-kraft-core',
		line: 'PURE KRAFT',
		en: 'Core',
		de: 'Rumpf',
		machines: [
			{
				id: '4307',
				en: 'Pure Kraft lying ab bench',
				de: 'Pure Kraft Bauchmuskelbank liegend'
			},
			{
				id: '4317',
				en: 'Pure Kraft ab swing',
				de: 'Pure Kraft Bauchmuskelmaschine Ab Swing'
			},
			{
				id: '4342n',
				en: 'Pure Kraft jackknife',
				de: 'Pure Kraft Bauchmuskelmaschine Klappsitz'
			},
			{
				id: '4343',
				en: 'Pure Kraft crunch machine',
				de: 'Pure Kraft Bauchmuskelmaschine Crunch'
			}
		]
	},
	{
		key: 'pure-kraft-strong',
		line: 'PURE KRAFT STRONG',
		en: 'Heavy presses',
		de: 'Schwere Pressen',
		machines: [
			{
				id: '4361',
				en: 'Pure Kraft Strong leg press dual',
				de: 'Pure Kraft Strong Beinpresse Dual'
			},
			{
				id: '4364',
				en: 'Pure Kraft Strong press dual',
				de: 'Pure Kraft Strong Drückbank Dual'
			},
			{
				id: '4365',
				en: 'Pure Kraft Strong incline press dual',
				de: 'Pure Kraft Strong Schrägbank Dual'
			},
			{
				id: '4362',
				en: 'Pure Kraft Strong decline press dual',
				de: 'Pure Kraft Strong Negativdrückbank Dual'
			},
			{
				id: '4363',
				en: 'Pure Kraft Strong shoulder press dual',
				de: 'Pure Kraft Strong Schulterdrückmaschine Dual'
			}
		]
	},
	{
		key: '80athletics',
		line: '80ATHLETICS',
		en: 'Functional',
		de: 'Functional',
		machines: [
			{ id: '80a00013', en: 'Reverse hyper extension', de: 'Reverse Hyper Extension' },
			{ id: '80a00028', en: 'Rowing bench', de: 'Rowing Bench' },
			{ id: '4423', en: 'Glute booster rack', de: 'Glute Booster Rack' },
			{ id: '4434', en: 'Glute ham developer', de: 'Glute Ham Developer' },
			{ id: '4347', en: 'Sissy squat', de: 'Sissy Squat' },
			{ id: '80a00014', en: 'Standing chest press', de: 'Stehende Brustpresse' },
			{
				id: '80a00016',
				en: 'Bent-over lateral raise machine',
				de: 'Seithebemaschine vorgebeugt'
			},
			{ id: '80a00033', en: 'Sliding hip extension', de: 'Sliding Hip Extension' }
		]
	},
	{
		key: 'basic-core',
		line: 'BASIC',
		en: 'Core',
		de: 'Rumpf',
		machines: [
			{ id: '4027', en: 'Basic abdominal bench', de: 'Basic Bauchmuskelbank' },
			{ id: '4028', en: 'Basic Roman chair', de: 'Basic Roman Chair' },
			// An abdominal bench despite the name; see 4847 for the press bench.
			{ id: '4107', en: 'Basic decline bench', de: 'Basic Negativbank' },
			{
				id: '4007',
				en: 'Basic negative bench with double roll',
				de: 'Basic Negativbank mit Doppelrolle'
			},
			{ id: '4046', en: 'Basic abdominal flexor', de: 'Basic Beinhebegerät' },
			{
				id: '4031',
				en: 'Basic abdominal flexor with chinning bar',
				de: 'Basic Beinhebegerät mit Klimmzugstange'
			}
		]
	},
	{
		key: 'basic-chest',
		line: 'BASIC',
		en: 'Chest',
		de: 'Brust',
		machines: [
			{ id: '4097', en: 'Basic press bench', de: 'Basic Drückbank' },
			{ id: '4103', en: 'Basic press bench adjustable', de: 'Basic Drückbank verstellbar' },
			{ id: '4096', en: 'Basic incline bench', de: 'Basic Schrägbank' },
			{ id: '4005', en: 'Basic flat bench', de: 'Basic Flachbank' },
			// gym80 calls this "Basic decline bench" too; renamed here to tell it
			// apart from 4107, the abdominal decline bench.
			{ id: '4847', en: 'Basic decline press bench', de: 'Basic Negativdrückbank' }
		]
	},
	{
		key: 'basic-back',
		line: 'BASIC',
		en: 'Back',
		de: 'Rücken',
		machines: [
			{ id: '4165', en: 'Basic Roman chair adjustable', de: 'Basic Roman Chair verstellbar' },
			{ id: '4119', en: 'Basic 45° back extension', de: 'Basic 45-Grad Rückenstrecker' },
			{ id: '4370', en: 'Basic dumbbell row bench', de: 'Basic Dumbbell Row Bench' }
		]
	},
	{
		key: 'basic-arms',
		line: 'BASIC',
		en: 'Arms',
		de: 'Arme',
		machines: [
			{ id: '4093', en: 'Basic seated Scott curl', de: 'Basic Scott Curl sitzend' },
			{ id: '4019', en: 'Basic standing Scott curl', de: 'Basic Scott Curler stehend' },
			{ id: '4021', en: 'Basic dip station', de: 'Basic Barren' }
		]
	},
	{
		key: 'basic-benches',
		line: 'BASIC',
		en: 'Multi-purpose benches',
		de: 'Mehrzweckbänke',
		machines: [
			{ id: '4010', en: 'Basic multi position bench', de: 'Basic Universalbank' },
			{
				id: '4011',
				en: 'Basic multi position bench with footrest',
				de: 'Basic Universalbank mit Fußablage'
			},
			{ id: '4112', en: 'Basic multi position bench light', de: 'Basic Universalbank leicht' }
		]
	}
];

export const GYM80_MACHINES = GYM80_MACHINE_GROUPS.flatMap((g) => g.machines);

/** The machine's page in gym80's catalogue, in the app's language. */
export function gym80ProductUrl(machine: Machine, locale: 'en' | 'de'): string {
	return locale === 'de'
		? `https://gym80.de/produkt/${machine.id}/`
		: `https://gym80.de/en/product/${machine.id}/`;
}
