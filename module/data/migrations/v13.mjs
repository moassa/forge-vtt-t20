export async function migration_1_4_100() {
	let oldActors = game.actors.filter((f) => !f._stats.systemVersion || f._stats.systemVersion < "1.4.100");
	// Migration
	for (const actor of oldActors) {
		let updateData = {};
		for (let [key, ability] of Object.entries(actor._source.system.atributos)) {
			updateData[`system.atributos.${key}.base`] = Math.floor((ability.value - 10) / 2);
			updateData[`system.atributos.${key}.bonus`] = ability.bonus !== 0 ? ability.bonus / 2 : 0;
		}

		if (actor.type === "npc") {
			updateData["system.attributes.defesa.base"] = 10 + actor._source.system.attributes.defesa.outros;
			updateData["system.attributes.defesa.outros"] = 0;
		}
		await actor.update(updateData);
	}
}

export async function migration_1_5_0() {
	const prototypeTokenOverrides = game.settings.get("core", "prototypeTokenOverrides");

	await game.settings.set(
		"core",
		"prototypeTokenOverrides",
		foundry.utils.mergeObject(prototypeTokenOverrides.toObject(), {
			character: { disposition: CONST.TOKEN_DISPOSITIONS.FRIENDLY, sight: { enabled: true } }
		})
	);
}

export async function migration_1_5_006() {
	const packs = game.packs.filter((p) => p.metadata.type === "Actor" && p.metadata.packageType !== "system");
	const consertaAtores = async (actors, pack) => {
		for (const actor of actors) {
			if (actor.type !== "npc") continue;
			const treino = actor.treino;
			const changes = {};
			try {
				for (const pericia of Object.keys(CONFIG.T20.resistencias)) {
					const { outros, value } = actor.system.pericias[pericia];
					const newBonus = 2 * outros - value;
					changes[`system.pericias.${pericia}.outros`] = newBonus;
				}
				if (actor.items.size) {
					const pericias = new Set();
					const bonus = {};

					for (const arma of actor.itemTypes.arma) {
						const rolls = arma.toObject().system.rolls;
						const index = rolls.findIndex((r) => r.type === "ataque");
						if (index === -1) continue;
						const ataque = rolls[index];
						const pericia = ataque.parts[1][0];
						pericias.add(pericia);
						if (!bonus[pericia]) bonus[pericia] = [];
						bonus[pericia].push(ataque.parts[2][0]);
					}
					for (const pericia of pericias) {
						const value = actor.system.pericias[pericia].value;
						const menorBonus = Math.min(...bonus[pericia]);
						const newBonus = menorBonus - value - treino;
						changes[`system.pericias.${pericia}.treinado`] = true;
						changes[`system.pericias.${pericia}.outros`] = newBonus;
					}
					for (const arma of actor.itemTypes.arma) {
						const rolls = arma.toObject().system.rolls;

						const index = rolls.findIndex((r) => r.type === "ataque");
						if (index === -1) continue;
						const ataque = rolls[index];
						const pericia = ataque.parts[1][0];
						ataque.parts[2][0] = Number(ataque.parts[2][0]) - Math.min(...bonus[pericia]);
						await arma.update({ [`system.rolls`]: rolls });
					}
				}
				await actor.update(changes);
			} catch (err) {
				if (pack) {
					err.message = `Falha ao migrar o ator ${actor.name} no compêndio ${pack.collection}: ${err.message}`;
				} else err.message = `Falha ao migrar o ator ${actor.name}`;
				console.error(err);
			}
		}
	};
	ui.notifications.info(
		"Iniciando conserto de resistências e ataques em Ameaças. Espere um momento e não feche o jogo",
		{
			console: false,
			permanent: true
		}
	);
	for (const pack of packs) {
		const wasLocked = pack.locked;
		try {
			await pack.configure({ locked: false });
			const actors = await pack.getDocuments();
			consertaAtores(actors, pack);
		} finally {
			await pack.configure({ locked: wasLocked });
		}
	}
	consertaAtores(game.actors.filter((a) => a.type === "npc"));
	ui.notifications.info("Conserto concluído", { console: false, permanent: true });
}

export async function migration_1_5_007() {
	const packs = game.packs.filter((p) => p.metadata.type === "Actor" && p.metadata.packageType !== "system");
	const consertaAtores = async (actors, pack) => {
		for (const actor of actors) {
			if (actor.type !== "npc") continue;
			const changes = {};
			try {
				if (actor.system.atributos.des.value !== 0) {
					const defBase = actor.system.attributes.defesa.base;
					changes["system.attributes.defesa.base"] = defBase - actor.system.atributos.des.value;
				}
				await actor.update(changes);
			} catch (err) {
				if (pack) {
					err.message = `Falha ao migrar o ator ${actor.name} no compêndio ${pack.collection}: ${err.message}`;
				} else err.message = `Falha ao migrar o ator ${actor.name}`;
				console.error(err);
			}
		}
	};
	ui.notifications.info("Iniciando conserto de defesas em Ameaças. Espere um momento e não feche o jogo", {
		console: false,
		permanent: true
	});
	for (const pack of packs) {
		const wasLocked = pack.locked;
		try {
			await pack.configure({ locked: false });
			const actors = await pack.getDocuments();
			consertaAtores(actors, pack);
		} finally {
			await pack.configure({ locked: wasLocked });
		}
	}
	consertaAtores(game.actors.filter((a) => a.type === "npc"));
	ui.notifications.info("Conserto concluído", { console: false, permanent: true });
}

export async function migration_1_5_010() {
	const packs = game.packs.filter((p) => p.metadata.type === "Actor" && p.metadata.packageType !== "system");
	const consertaAtores = async (actors, pack) => {
		for (const actor of actors) {
			if (!actor.system.pericias) continue;
			const changes = {};
			try {
				const initial = new tormenta20.data.fields.SkillData();
				const cls = CONFIG.Actor.dataModels[actor.type];
				if (actor.system.pericias.ofi0) changes["system.pericias.-=ofi0"] = null;
				if (actor.system.pericias._pc0) changes["system.pericias.-=_pc0"] = null;
				if (actor.system.pericias.acro?.st && actor.system.pericias.reli?.pda && actor.system.pericias.guer?.pda) {
					for (const [key, value] of Object.entries(actor.system.pericias)) {
						changes[`system.pericias.${key}`] = cls._initialSkillValue(key, initial, value);
					}
				}
				for (const key of CONFIG.T20.oficios) {
					if (!actor.system.pericias[key]) {
						changes[`system.pericias.${key}`] = cls._initialSkillValue(key, initial, CONFIG.T20.pericias[key]);
					}
				}
				await actor.update(changes);
			} catch (err) {
				if (pack) {
					err.message = `Falha ao migrar o ator ${actor.name} no compêndio ${pack.collection}: ${err.message}`;
				} else err.message = `Falha ao migrar o ator ${actor.name}`;
				console.error(err);
			}
		}
	};
	ui.notifications.info("Iniciando migração do sistema Tormenta20 1.5.010. Espere um momento e não feche o jogo", {
		console: false,
		permanent: true
	});
	for (const pack of packs) {
		const wasLocked = pack.locked;
		try {
			await pack.configure({ locked: false });
			const actors = await pack.getDocuments();
			consertaAtores(actors, pack);
		} finally {
			await pack.configure({ locked: wasLocked });
		}
	}
	consertaAtores(game.actors.filter((a) => !!a.system.pericias));
	ui.notifications.info("Migração concluída", { console: false, permanent: true });
}

export async function migration_1_5_012() {
	// Fix Skills with Armor Penalty
	const fixed = new CONFIG.Actor.dataModels.character();

	const updateData = {};
	Object.entries(fixed.pericias).reduce((acc, [key, value]) => {
		acc[`system.pericias.${key}.pda`] = value.pda;
		acc[`system.pericias.${key}.st`] = value.st;
		return acc;
	}, updateData);

	const characters = game.actors.filter((i) => i.type == "character");
	for (let character of characters) await character.update(updateData);
}

export async function migration_1_5_013() {
	const oldActors = game.actors.filter((f) => !f._stats.systemVersion || f._stats.systemVersion < "1.5.000");
	for (const actor of oldActors) {
		const updateData = {};
		updateData.items = actor.items
			.filter((item) => item.flags?.favorito)
			.map((item) => {
				return {
					_id: item.id,
					"flags.favorito": _del,
					"flags.tormenta20.favorito": true
				};
			});
		if (updateData.items.length) await actor.update(updateData);
	}
}
