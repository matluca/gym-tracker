export type MachineGroup = {
	/** Stable id, used for ordering and DOM ids. Not stored anywhere. */
	key: string;
	/** gym80 product line, shown as-is in both languages. */
	line: string;
	en: string;
	de: string;
	machines: readonly { en: string; de: string }[];
};

/**
 * Built-in machines: gym80's strength range, which is what McFIT studios are
 * fitted with. Taken from the gym80 catalogue (gym80.de, October 2026):
 * SYGNUM (weight stack), PURE KRAFT (plate loaded) and the 80ATHLETICS
 * machines. Left out are multi-user towers, combo and Cable Art units, racks
 * and accessories — nothing you'd log a set "on".
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
			{ en: 'Seated leg extension', de: 'Beinstrecker sitzend' }, // 3001
			{ en: 'Lying leg extension', de: 'Beinstrecker liegend' }, // 3123
			{ en: 'Lying leg curl', de: 'Beinbeuger liegend' }, // 3002
			{ en: 'Seated leg curl', de: 'Beinbeuger sitzend' }, // 3003
			{ en: 'Standing leg curl', de: 'Beinbeuger stehend' }, // 3013
			{ en: 'Seated leg press', de: 'Beinpresse sitzend' }, // 3030
			{ en: 'Lying leg press', de: 'Beinpresse liegend' }, // 3031
			{ en: 'Leg press dual', de: 'Beinpresse Dual' }, // 3046
			{ en: 'Kneeling glute kick', de: 'Gluteus Kick kniend' }, // 3004
			{ en: 'Radial glute kick', de: 'Gluteus Kick radial' }, // 3005
			{ en: 'Kick machine', de: 'Kickmaschine' }, // 3006
			{ en: 'Abductor machine', de: 'Abduktionsmaschine' }, // 3028
			{ en: 'Adductor machine', de: 'Adduktionsmaschine' }, // 3029
			{ en: 'Standing abduction', de: 'Stehende Abduktion' }, // 3069
			{ en: 'Bootymizer', de: 'Bootymizer' }, // 4416
			{ en: 'Standing calf machine', de: 'Wadenmaschine stehend' }, // 3018
			{ en: 'Seated calf press', de: 'Wadenpresse sitzend' }, // 3027
			{ en: 'Donkey calf raise', de: 'Donkey Calf Raise' } // 3094
		]
	},
	{
		key: 'sygnum-chest',
		line: 'SYGNUM',
		en: 'Chest',
		de: 'Brust',
		machines: [
			{ en: 'Chest press', de: 'Brustpresse' }, // 3016
			{ en: 'Chest press dual', de: 'Brustpresse Dual' }, // 3041
			{ en: 'Chest machine', de: 'Brustmaschine' }, // 3014
			{ en: 'Standing chest machine', de: 'Brustmaschine stehend' }, // 3121
			{ en: 'Inner chest press', de: 'Inner Chest Press' }, // 3097
			{ en: 'Incline press machine', de: 'Schrägbank' }, // 3023N
			{ en: 'Incline press dual', de: 'Schrägbank Dual' }, // 3042
			{ en: 'Butterfly', de: 'Butterfly' }, // 3022
			{ en: 'Butterfly with pads', de: 'Butterfly mit Pads' }, // 3021
			{ en: 'Pullover machine', de: 'Überzugmaschine' } // 3012N
		]
	},
	{
		key: 'sygnum-back',
		line: 'SYGNUM',
		en: 'Back',
		de: 'Rücken',
		machines: [
			{ en: 'Lat pulldown machine', de: 'Rückenzugmaschine' }, // 3020
			{ en: 'Lat pulldown dual', de: 'Rückenzugmaschine Dual' }, // 3044
			{ en: 'Iso lat', de: 'Iso Lat' }, // 3047
			{ en: 'Row machine', de: 'Rudermaschine' }, // 3040
			{
				en: 'Row machine without chest pad',
				de: 'Rudermaschine ohne Brustpolster'
			}, // 3039
			{ en: 'Row dual', de: 'Rudermaschine Dual' }, // 3045
			{ en: 'Back extension machine', de: 'Rückenstrecker' }, // 3007, 3038
			{ en: 'Assisted pull-up and dip machine', de: 'Klimmzug-Barrenmaschine' } // 3017
		]
	},
	{
		key: 'sygnum-shoulders',
		line: 'SYGNUM',
		en: 'Shoulders',
		de: 'Schultern',
		machines: [
			{ en: 'Shoulder press machine', de: 'Schulterpresse' }, // 3032
			{ en: 'Shoulder press dual', de: 'Schulterpresse Dual' }, // 3043
			{ en: 'Neck press machine', de: 'Nackendrückmaschine' }, // 3096
			{ en: 'Lateral raise machine', de: 'Seithebemaschine' }, // 3050
			{ en: 'Standing lateral raise machine', de: 'Seithebemaschine stehend' }, // 3099
			{ en: 'Reverse butterfly', de: 'Butterfly Reverse' } // 3025
		]
	},
	{
		key: 'sygnum-arms',
		line: 'SYGNUM',
		en: 'Arms',
		de: 'Arme',
		machines: [
			{ en: 'Biceps machine', de: 'Bizepsmaschine' }, // 3010
			{ en: 'Horizontal biceps machine', de: 'Bizeps horizontal' }, // 3098
			{ en: 'Triceps machine', de: 'Trizepsmaschine' }, // 3011
			{ en: 'Overhead triceps machine', de: 'Trizeps Überkopf' }, // 3095
			{ en: 'Dip machine', de: 'Dipmaschine' }, // 3036
			{ en: 'Forearm machine', de: 'Unterarmmaschine' } // 3071
		]
	},
	{
		key: 'sygnum-core',
		line: 'SYGNUM',
		en: 'Core',
		de: 'Rumpf',
		machines: [
			{ en: 'Ab machine', de: 'Bauchmuskelmaschine' }, // 3037
			{ en: 'Crunch machine', de: 'Crunchmaschine' }, // 3124
			{ en: 'Seated jackknife', de: 'Klappsitz' }, // 3008
			{ en: 'Lying jackknife', de: 'Klappsitz liegend' }, // 3034
			{ en: 'Rotary torso', de: 'Rotationsmaschine' } // 3225
		]
	},
	{
		key: 'sygnum-innovation',
		line: 'SYGNUM',
		en: 'Innovation & FTM',
		de: 'Innovation & FTM',
		machines: [
			{ en: 'Innovation leg press', de: 'Innovation Beinpresse' }, // 5001
			{ en: 'Innovation glute machine', de: 'Innovation Gluteusmaschine' }, // 5002
			{ en: 'Innovation row', de: 'Innovation Rudermaschine' }, // 5003
			{
				en: 'Innovation multi-extension',
				de: 'Innovation Multistreckmaschine'
			}, // 5006
			{ en: 'Innovation curl machine', de: 'Innovation Curler-Maschine' }, // 5004
			{ en: 'FTM deadlift machine', de: 'FTM Deadlift-Maschine' }, // 4401
			{
				en: 'FTM shoulder and chest press',
				de: 'FTM Schulter- und Brustpresse'
			}, // 4402
			{ en: 'FTM pull and push machine', de: 'FTM Zug- und Drückmaschine' } // 4403
		]
	},
	{
		key: 'sygnum-cable',
		line: 'SYGNUM',
		en: 'Cable stations',
		de: 'Kabelzugstationen',
		machines: [
			{ en: 'Cable crossover', de: 'Kabelzug Crossover' }, // 4004
			{
				en: 'Adjustable cable crossover',
				de: 'Kabelzug Crossover verstellbar'
			}, // 4012
			{ en: 'Dual adjustable cable', de: 'Dual verstellbarer Seilzug' }, // 4034
			{ en: 'Universal cable', de: 'Seilzug universal' }, // 4134
			{ en: 'Explosive cable', de: 'Seilzug Explosiv' }, // 4125
			{ en: 'Cable V-station', de: 'Seilzug V-Station' }, // 4042
			{ en: 'Seated row station', de: 'Ruderstation' }, // 4016
			{ en: 'Lat pulldown station', de: 'Rückenzugstation' }, // 4116
			{ en: 'Incline row combo', de: 'Incline Row Combo' } // 4900
		]
	},
	{
		key: 'pure-kraft-legs',
		line: 'PURE KRAFT',
		en: 'Legs & glutes',
		de: 'Beine & Po',
		machines: [
			{ en: 'Pure Kraft squat machine', de: 'Pure Kraft Kniebeugemaschine' }, // 4038N
			{ en: 'Pure Kraft hack squat', de: 'Pure Kraft Hackenschmidt' }, // 4159N
			{ en: 'Pure Kraft pendulum squat', de: 'Pure Kraft Pendulum Squat' }, // 4353N
			{ en: 'Pure Kraft belt squat', de: 'Pure Kraft Belt Squat' }, // 4360
			{ en: 'Pure Kraft leverage squat', de: 'Pure Kraft Leverage Squat' }, // 4389
			{ en: 'Pure Kraft 45° leg press', de: 'Pure Kraft 45-Grad-Beinpresse' }, // 4023
			{
				en: 'Pure Kraft 45° pivot leg press',
				de: 'Pure Kraft 45-Grad-Pivot-Beinpresse'
			}, // 4324
			{
				en: 'Pure Kraft seated leg press dual',
				de: 'Pure Kraft Beinpresse sitzend Dual'
			}, // 4314
			{
				en: 'Pure Kraft vertical leg press',
				de: 'Pure Kraft Vertikale Beinpresse'
			}, // 4354
			{ en: 'Pure Kraft 3D leg machine', de: 'Pure Kraft 3D Leg Machine' }, // 4391
			{ en: 'Pure Kraft leg extension', de: 'Pure Kraft Beinstrecker' }, // 4336N
			{
				en: 'Pure Kraft standing leg extension',
				de: 'Pure Kraft Beinstrecker stehend'
			}, // 4392
			{ en: 'Pure Kraft leg curl', de: 'Pure Kraft Beinbeuger' }, // 4337N
			{
				en: 'Pure Kraft standing leg curl',
				de: 'Pure Kraft Beinbeuger stehend'
			}, // 4373
			{ en: 'Pure Kraft inverse leg curl', de: 'Pure Kraft Inverse Leg Curl' }, // 4375
			{ en: 'Pure Kraft glute kick', de: 'Pure Kraft Gluteus-Kick-Maschine' }, // 4321
			{ en: 'Pure Kraft booty booster', de: 'Pure Kraft Booty Booster' }, // 4352
			{
				en: 'Pure Kraft booty booster special',
				de: 'Pure Kraft Booty Booster Special'
			}, // 4386N
			{
				en: 'Pure Kraft standing abduction',
				de: 'Pure Kraft Stehende Abduktion'
			}, // 4374
			{ en: 'Pure Kraft abduction 3D', de: 'Pure Kraft Abduktion 3D' }, // 4384
			{
				en: 'Pure Kraft seated calf machine',
				de: 'Pure Kraft Wadenmaschine sitzend'
			}, // 4026
			{
				en: 'Pure Kraft 55° standing calf machine',
				de: 'Pure Kraft 55-Grad-Wadenmaschine stehend'
			}, // 4345
			{ en: 'Pure Kraft donkey calf', de: 'Pure Kraft Donkey Calf' }, // 4380
			{
				en: 'Pure Kraft seated tibialis machine',
				de: 'Pure Kraft Tibialismaschine sitzend'
			} // 4348
		]
	},
	{
		key: 'pure-kraft-chest',
		line: 'PURE KRAFT',
		en: 'Chest',
		de: 'Brust',
		machines: [
			{
				en: 'Pure Kraft seated bench press dual',
				de: 'Pure Kraft Bankdrückmaschine sitzend Dual'
			}, // 4328
			{
				en: 'Pure Kraft lying press dual',
				de: 'Pure Kraft Drückbank liegend Dual'
			}, // 4331
			{ en: 'Pure Kraft incline press dual', de: 'Pure Kraft Schrägbank Dual' }, // 4329N
			{
				en: 'Pure Kraft decline press dual',
				de: 'Pure Kraft Negativdrückbank Dual'
			}, // 4346
			{
				en: 'Pure Kraft chest machine dual',
				de: 'Pure Kraft Brustmaschine Dual'
			}, // 4326
			{
				en: 'Pure Kraft lying inner chest dual',
				de: 'Pure Kraft Inner Chest liegend Dual'
			}, // 4376
			{ en: 'Pure Kraft butterfly dual', de: 'Pure Kraft Butterfly Dual' }, // 4341
			{ en: 'Pure Kraft butterfly 50°', de: 'Pure Kraft Butterfly 50 Grad' }, // 4390
			{ en: 'Pure Kraft pullover machine', de: 'Pure Kraft Überzugmaschine' } // 4350N
		]
	},
	{
		key: 'pure-kraft-back',
		line: 'PURE KRAFT',
		en: 'Back',
		de: 'Rücken',
		machines: [
			{
				en: 'Pure Kraft lat pulldown dual',
				de: 'Pure Kraft Rückenzugmaschine Dual'
			}, // 4311
			{ en: 'Pure Kraft high row dual', de: 'Pure Kraft High Row Dual' }, // 4340
			{
				en: 'Pure Kraft high row with moving handles',
				de: 'Pure Kraft High Row mit beweglichen Griffen'
			}, // 4382
			{ en: 'Pure Kraft low row dual', de: 'Pure Kraft Low Row Dual' }, // 4319
			{
				en: 'Pure Kraft seated row dual',
				de: 'Pure Kraft Rudermaschine sitzend Dual'
			}, // 4322
			{ en: 'Pure Kraft power row dual', de: 'Pure Kraft Power Row Dual' }, // 4327
			{
				en: 'Pure Kraft 55° row machine',
				de: 'Pure Kraft 55-Grad-Rudermaschine'
			}, // 4383
			{ en: 'Pure Kraft T-bar row', de: 'Pure Kraft Rudermaschine T-Bar' }, // 4018
			{
				en: 'Pure Kraft multi-grip landmine',
				de: 'Pure Kraft Bodenhantel Multi-Grip'
			}, // 4318
			{
				en: 'Pure Kraft deadlift rotating handles dual',
				de: 'Pure Kraft Deadlift Drehgriffe Dual'
			}, // 4332
			{
				en: 'Pure Kraft deadlift double handles dual',
				de: 'Pure Kraft Deadlift Doppelgriffe Dual'
			}, // 4333
			{
				en: 'Pure Kraft standing multi-joint',
				de: 'Pure Kraft Multigelenk stehend'
			} // 4372
		]
	},
	{
		key: 'pure-kraft-shoulders',
		line: 'PURE KRAFT',
		en: 'Shoulders',
		de: 'Schultern',
		machines: [
			{
				en: 'Pure Kraft shoulder machine dual',
				de: 'Pure Kraft Schultermaschine Dual'
			}, // 4320
			{
				en: 'Pure Kraft neck press machine',
				de: 'Pure Kraft Nackendrückmaschine'
			}, // 4371
			{ en: 'Pure Kraft viking press', de: 'Pure Kraft Viking Press' }, // 4388
			{
				en: 'Pure Kraft lateral raise dual',
				de: 'Pure Kraft Seithebemaschine Dual'
			}, // 4325
			{
				en: 'Pure Kraft standing lateral raise',
				de: 'Pure Kraft Seithebemaschine stehend'
			}, // 4385
			{
				en: 'Pure Kraft reverse butterfly dual',
				de: 'Pure Kraft Butterfly Reverse Dual'
			} // 4344
		]
	},
	{
		key: 'pure-kraft-arms',
		line: 'PURE KRAFT',
		en: 'Arms',
		de: 'Arme',
		machines: [
			{ en: 'Pure Kraft biceps machine', de: 'Pure Kraft Bizepsmaschine' }, // 4338N
			{
				en: 'Pure Kraft biceps machine dual',
				de: 'Pure Kraft Bizepsmaschine Dual'
			}, // 4355
			{ en: 'Pure Kraft overhead biceps', de: 'Pure Kraft Bizeps Überkopf' }, // 4366
			{ en: 'Pure Kraft triceps machine', de: 'Pure Kraft Trizepsmaschine' }, // 4339N
			{ en: 'Pure Kraft overhead triceps', de: 'Pure Kraft Trizeps Überkopf' }, // 4379
			{
				en: 'Pure Kraft triceps dip machine dual',
				de: 'Pure Kraft Trizeps-Dip-Maschine Dual'
			} // 4335
		]
	},
	{
		key: 'pure-kraft-core',
		line: 'PURE KRAFT',
		en: 'Core',
		de: 'Rumpf',
		machines: [
			{
				en: 'Pure Kraft lying ab bench',
				de: 'Pure Kraft Bauchmuskelbank liegend'
			}, // 4307
			{
				en: 'Pure Kraft ab swing',
				de: 'Pure Kraft Bauchmuskelmaschine Ab Swing'
			}, // 4317
			{
				en: 'Pure Kraft jackknife',
				de: 'Pure Kraft Bauchmuskelmaschine Klappsitz'
			}, // 4342N
			{
				en: 'Pure Kraft crunch machine',
				de: 'Pure Kraft Bauchmuskelmaschine Crunch'
			} // 4343
		]
	},
	{
		key: 'pure-kraft-strong',
		line: 'PURE KRAFT STRONG',
		en: 'Heavy presses',
		de: 'Schwere Pressen',
		machines: [
			{
				en: 'Pure Kraft Strong leg press dual',
				de: 'Pure Kraft Strong Beinpresse Dual'
			}, // 4361
			{
				en: 'Pure Kraft Strong press dual',
				de: 'Pure Kraft Strong Drückbank Dual'
			}, // 4364
			{
				en: 'Pure Kraft Strong incline press dual',
				de: 'Pure Kraft Strong Schrägbank Dual'
			}, // 4365
			{
				en: 'Pure Kraft Strong decline press dual',
				de: 'Pure Kraft Strong Negativdrückbank Dual'
			}, // 4362
			{
				en: 'Pure Kraft Strong shoulder press dual',
				de: 'Pure Kraft Strong Schulterdrückmaschine Dual'
			} // 4363
		]
	},
	{
		key: '80athletics',
		line: '80ATHLETICS',
		en: 'Functional',
		de: 'Functional',
		machines: [
			{ en: 'Reverse hyper extension', de: 'Reverse Hyper Extension' }, // 80A00013
			{ en: 'Rowing bench', de: 'Rowing Bench' }, // 80A00028
			{ en: 'Glute booster rack', de: 'Glute Booster Rack' }, // 4423
			{ en: 'Glute ham developer', de: 'Glute Ham Developer' }, // 4434
			{ en: 'Sissy squat', de: 'Sissy Squat' }, // 4347
			{ en: 'Standing chest press', de: 'Stehende Brustpresse' }, // 80A00014
			{
				en: 'Bent-over lateral raise machine',
				de: 'Seithebemaschine vorgebeugt'
			}, // 80A00016
			{ en: 'Sliding hip extension', de: 'Sliding Hip Extension' } // 80A00033
		]
	}
];

export const GYM80_MACHINES = GYM80_MACHINE_GROUPS.flatMap((g) => g.machines);
