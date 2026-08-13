
/* -------------------------------------- */
/*  Helpers                               */
/* -------------------------------------- */

export function allowCompendiumMigration(pack) {
	// Migrate only Actors and Items
	if (!["Actor", "Item"].includes(pack.documentName)) return false;
	// Always migrate world compendiums
	if (pack.metadata.packageType == "world") return true;
	// System compendiums are downloaded migrated
	if (pack.metadata.packageType == "system") return false;
	// Module compendiums should only be migrated when they are local
	if (pack.metadata.packageType == "module") {
		const module = game.modules.get(pack.metadata.packageName);
		return !module.download && !module.manifest;
	}
	return false;
}


/* -------------------------------------- */
/*  V14 1.6.0                             */
/* -------------------------------------- */

export async function migration_1_6_0(params) {
	// Update Active Effect
	// - Update item effects with changes from the transfered copy
	// - Remove effects transfered to actors;
	const progress = ui.notifications.info("Applying Migration [1.6.0]", { console: true, progress: true });
	// Migrate World Actors
	progress.update({ pct: 0.10, message: "Applying Migration [1.6.0] to World Actors" });
	for (const actor of game.actors) {
		const operations = [];
		deleteLegacyTranferedEffects(actor, operations);
		await foundry.documents.modifyBatch(operations);
	}

	progress.update({ pct: 0.20, message: "Applying Migration [1.6.0] to Token Actors" });
	// Migrate Token Actors
	for (const scene of game.scenes) {
		const operations = [];
		for (const token of scene.tokens) {
			if (token.linked) continue;
			if (!token.actor) continue;
			deleteLegacyTranferedEffects(token.actor, operations);
		}
		await foundry.documents.modifyBatch(operations);
	}

	progress.update({ pct: 0.30, message: "Applying Migration [1.6.0] to Compendium Actors" });
	// Migrate compendium actors
	for (const pack of game.packs) {
		if (!allowCompendiumMigration(pack)) continue;

		if (pack.documentName == "Actor") {
			const documents = await pack.getDocuments();
			for (const actor of documents) {
				const operations = [];
				deleteLegacyTranferedEffects(actor, operations);
				await foundry.documents.modifyBatch(operations);
			}
		}
	}

	progress.update({ pct: 0.50, message: "Applying Migration [1.6.0] to World Items" });
	// Migrate World Items
	for (const item of game.items) {
		const operations = [];
		migrateEffectsSystemFlags(item, operations);
		await foundry.documents.modifyBatch(operations);
	}

	progress.update({ pct: 0.60, message: "Applying Migration [1.6.0] to Actor Items" });
	for (const actor of game.actors) {
		for (const item of actor.items) {
			const operations = [];
			migrateEffectsSystemFlags(item, operations);
			await foundry.documents.modifyBatch(operations);
		}
	}

	progress.update({ pct: 0.70, message: "Applying Migration [1.6.0] to Compendium Items" });
	// Migrate Compendium Items
	for (const pack of game.packs) {
		if (!allowCompendiumMigration(pack)) continue;
		if (pack.documentName == "Item") {
			const documents = await pack.getDocuments();
			for (const item of documents) {
				const operations = [];
				migrateEffectsSystemFlags(item, operations);
				await foundry.documents.modifyBatch(operations);
			}
		}

		if (pack.documentName == "Actor") {
			const documents = await pack.getDocuments();
			for (const actor of documents) {
				for (const item of actor.items) {
					const operations = [];
					migrateEffectsSystemFlags(item, operations);
					await foundry.documents.modifyBatch(operations);
				}
			}
		}
	}

	progress.update({ pct: 1, message: "Applying Migration [1.6.0] Concluded" });
}


export function deleteLegacyTranferedEffects(parentDocument, operations) {
	if (![parentDocument.id, parentDocument.parent?.id].includes("czEU9mC3uaWAfR7L")) return;

	const updates = [];
	const deleteIds = [];
	for (const effect of parentDocument.effects) {
		const origin = foundry.utils.fromUuidSync(effect.origin);
		if (!origin || origin.parent != effect.parent) continue;
		const original = origin.effects.getName(effect.name);
		if (!original.transfer) continue;
		deleteIds.push(effect.id);
		const diff = foundry.utils.diffObject(original._source, effect._source);
		const hasDiffFlags = foundry.utils.hasProperty(diff, "flags.tormenta20");
		const hasDiffChanges = foundry.utils.hasProperty(diff, "system.changes");
		if (hasDiffFlags || hasDiffChanges) {
			const updateData = { _id: original.id };
			if (hasDiffFlags) updateData.flags = diff.flags;
			if (hasDiffChanges) updateData.system = diff.system;
			operations.push({
				updates: [updateData],
				action: "update",
				documentName: "ActiveEffect",
				parent: origin,
			});
		}
	}

	operations.push({
		ids: deleteIds,
		action: "delete",
		documentName: "ActiveEffect",
		parent: parentDocument,
	});
}

export function migrateEffectsSystemFlags(parentDocument, operations) {
	if (![parentDocument.id, parentDocument.parent?.id].includes("czEU9mC3uaWAfR7L")) return;

	const updates = [];
	for (const effect of parentDocument.effects) {
		if (!effect.flags.tormenta20) continue;
		const flags = effect.flags.tormenta20;
		const typeKeys = ["self", "ability", "attack", "consumable", "equipment", "power", "skill", "spell"];
		const types = [];
		const isSpell = parentDocument.type == "magia" || (parentDocument.type == "consumivel" && parentDocument.system.tipo == "scroll");
		if (isSpell && flags.onuse && !effect.isTemporary) {
			types.push("self");
		} else {
			for (const key of typeKeys) {
				if (flags[key]) types.push(key);
			}
		}

		const items = flags.items?.replaceAll(",", ";").split(";").filter(Boolean) ?? [];
		const updateData = {
			_id: effect.id,
			disabled: flags.onuse ? true : effect.disabled,
			system: {
				onuse: flags.onuse,
				automatic: effect.disabled,
				duration: { scene: flags.durationScene },
				abilityUse: {
					aumenta: flags.aumenta ?? false,
					custo: flags.custo ?? 0,
					names: items,
					types: types,
				}
			},
			flags: {
				tormenta20: _replace({}),
			}
		};
		if (flags.durationScene) {
			updateData.duration = {
				expiry: "sceneEnd",
				value: null,
				units: "rounds",
			}
		}
		if (flags.onuse && parentDocument.name != effect.name) {
			updateData.name = origin.type == "magia" ? "Aprimoramento" : parentDocument.name;
			updateData.description = `<p>${effect.name}</p>`;
		}
		updates.push(updateData);
	}

	operations.push({
		updates,
		action: "update",
		documentName: "ActiveEffect",
		parent: parentDocument,
	});
}

/* -------------------------------------- */
/*  V14 1.6.X                             */
/* -------------------------------------- */