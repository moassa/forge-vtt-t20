
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
	progress.update({ pct: 0.10, message: "Applying Migration to World Actors" });
	for (const actor of game.actors) {
		const toDelete = [];
		deleteLegacyTransferedEffects(actor, toDelete);
		await foundry.documents.modifyBatch(toDelete);

		// Actor Effects 
		const operations = [];
		migrateEffectsV2(actor, operations);
		await foundry.documents.modifyBatch(operations);
	}
	progress.update({ pct: 0.20, message: "Applying Migration to World Items" });

	// Migrate World Items
	for (const item of game.items) {
		const operations = [];
		migrateEffectsV2(item, operations);
		await foundry.documents.modifyBatch(operations);
	}
	progress.update({ pct: 0.40, message: "Applying Migration to Actor Tokens" });

	// Migrate Token Actors
	for (const scene of game.scenes) {
		const toDelete = [];
		for (const token of scene.tokens) {
			if (token.linked || !token.actor) continue;
			deleteLegacyTransferedEffects(token.actor, toDelete);
		}
		await foundry.documents.modifyBatch(toDelete);
		const operations = [];
		for (const token of scene.tokens) {
			if (token.linked || !token.actor) continue;
			const operations = [];
			migrateEffectsV2(token.actor, operations);
		}
		await foundry.documents.modifyBatch(operations);
	}

	// Migrate Compendium Pacts

	progress.update({ pct: 0.60, message: "Applying Migration to Compendium Actors" });
	for (const pack of game.packs) {
		if (pack.documentName != "Actor") continue;
		if (!allowCompendiumMigration(pack)) continue;
		const wasLocked = pack.config.locked;
		if (wasLocked) await pack.configure({ locked: false });
		const documents = await pack.getDocuments();
		const toDelete = [];
		for (const actor of documents) {
			deleteLegacyTransferedEffects(actor, toDelete);
		}
		await foundry.documents.modifyBatch(toDelete);
		// Actor Effects 
		const operations = [];
		for (const actor of documents) {
			migrateEffectsV2(actor, operations);
		}
		await foundry.documents.modifyBatch(operations);
		if (wasLocked) await pack.configure({ locked: true });
	}

	progress.update({ pct: 0.80, message: "Applying Migration to Compendium Items" });
	for (const pack of game.packs) {
		if (pack.documentName != "Item") continue;
		if (!allowCompendiumMigration(pack)) continue;
		const documents = await pack.getDocuments();
		const wasLocked = pack.config.locked;
		if (wasLocked) await pack.configure({ locked: false });
		const operations = [];
		for (const actor of documents) {
			migrateEffectsV2(actor, operations);
		}
		await foundry.documents.modifyBatch(operations);
		if (wasLocked) await pack.configure({ locked: true });
	}
	progress.update({ pct: 1, message: "Applying Migration Concluded" });
}

/**
 * Effects may now be applied to actors directly form items remove the copy created on creation.
 * @param {*} parentDocument 
 * @param {*} operations 
 */
export function deleteLegacyTransferedEffects(parentDocument, operations) {
	const deleteIds = [];
	for (const effect of parentDocument.effects) {
		if (effect.origin?.startsWith("Compendium")) continue;
		const origin = foundry.utils.fromUuidSync(effect.origin);
		if (!origin || origin.parent != effect.parent) continue;
		const original = origin.effects?.getName(effect.name);
		if (!original?.transfer) continue;
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

/**
 * Migrate ActiveEffect data to the new ActiveEffectV2 standards
 * @param {*} parentDocument 
 * @param {*} operations 
 * @returns 
 */
export function migrateEffectsV2(parentDocument, operations) {
	const updates = [];
	for (const effect of parentDocument.effects) {
		const updateData = {};
		/**
		 * Fix items with Temporary Effects that are transfered to the actor
		 */
		if (effect.parent.documentName == "Item") {
			if (effect._source.duration.value > 0 || effect._source.duration.expiry) {
				updateData.transfer = false;
			}
		}

		/**
		 * Move System Flags to system data and new duration
		 */
		const flags = effect.flags.tormenta20;
		if (flags?.onuse) {
			const typeKeys = ["self", "ability", "attack", "consumable", "equipment", "power", "skill", "spell"];
			const types = [];
			const isSpell = effect.parent?.type == "magia"
				|| (effect.parent?.type == "consumivel" && effect.parent?.system.tipo == "scroll");
			if (isSpell && flags.onuse && !effect.isTemporary) {
				types.push("self");
			} else {
				for (const key of typeKeys) {
					if (flags[key]) types.push(key);
				}
			}
			const items = flags.items?.replaceAll(",", ";").split(";").filter(Boolean) ?? [];

			if (effect.parent.name != effect.name) {
				Object.assign(updateData, {
					name: origin.type == "magia" ? "Aprimoramento" : effect.parent.name,
					description: `<p>${effect.name}</p>`,
				});
			}
			Object.assign(updateData, {
				disabled: flags.onuse ? true : effect.disabled,
				flags: {
					tormenta20: _replace({}),
				},
				system: {
					onuse: flags.onuse,
					abilityUse: {
						automatic: !effect.disabled,
						aumenta: flags.aumenta ?? false,
						custo: flags.custo,
						names: items,
						types: types,
					}
				}
			});
		}
		if (flags?.condition) {
			Object.assign(updateData, {
				status: {
					category: flags.category,
					ignoreImunity: flags.ignoreImunity,
					upgrade: flags.stack,
					childEffect: flags.childEffect,
				}
			});
		}
		if (flags?.durationScene) {
			Object.assign(updateData, {
				duration: {
					expiry: "sceneEnd",
					value: null,
					units: "rounds",
				}
			});
		}


		if (foundry.utils.isEmpty(updateData)) continue;
		updateData._id = effect.id;
		updates.push(updateData);
	}
	operations.push({
		updates,
		action: "update",
		documentName: "ActiveEffect",
		parent: parentDocument,
	});

	if (parentDocument.documentName != "Actor") return;
	for (const item of parentDocument.items) {
		migrateEffectsV2(item, operations);
	}
}


/* -------------------------------------- */
/*  V14 1.6.X                             */
/* -------------------------------------- */
