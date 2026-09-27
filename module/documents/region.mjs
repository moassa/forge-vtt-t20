/**
 * Extend the base RegionT20 class to implement system-specific logic.
 */
export default class RegionT20 extends foundry.documents.RegionDocument {
	/* -------------------------------------------- */
	/*  Database Operations                         */
	/* -------------------------------------------- */

	/** @inheritDoc */
	_onCreate(data, options, userId) {
		super._onCreate(data, options, userId);
		this._onCreateBehaviors(data, options, userId);
	}

	async _onCreateBehaviors(data, options, userId) {
		if (!game.user.isActiveGM) return;
		console.log("_onCreateBehaviors", this, data);
		const message = game.messages.get(this.getFlag("tormenta20", "message"));
		if (!message) return;
		const item = message.getFlag("tormenta20", "itemData");
		const effects = message.getFlag("tormenta20", "effects");
		try {
			const behaviors = JSON.parse(item.area_behaviors);
			for (const behavior of behaviors) {
				behavior._id = foundry.utils.randomID();

				if (behavior.type == "applyActiveEffect") {
					const uuids = [];
					for (const name of behavior.system.effects) {
						const chatEffects = effects.find((e) => e.at(0).name == name);
						if (chatEffects) {
							chatEffects.at(0)._id = foundry.utils.randomID();
							chatEffects.at(0).origin = `${this.uuid}.RegionBehavior.${behavior._id}`;
							console.log(chatEffects);
							const created = await message.speakerActor.createEmbeddedDocuments("ActiveEffect", chatEffects, {
								keepId: true
							});
							if (created.length) uuids.push(created.map((c) => c.uuid));
						}
					}
					behavior.system.effects = uuids;
				}
			}
			console.log(behaviors);
			this.createEmbeddedDocuments("RegionBehavior", behaviors, { keepId: true });
		} catch (error) {
			console.error(error);
		}
	}
}
