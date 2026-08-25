

export default class CombatT20 extends foundry.documents.Combat {

	/** @inheritdoc */
	async endCombat() {
		/**
		 * When using Segmented Scene Rule ending a combat will not end scene effects.
		 */
		const segmentedScene = game.settings.get("tormenta20", "segmentedScene");
		if (segmentedScene.max > 0) return await super.endCombat();
		else {
			await tormenta20.helpers.endScene(this);
			return this;
		}
	}

	/* -------------------------------------------- */

	/**
	 * Add system logic to combatant StartTurn
	 * Manage sustained effects
	 * Roll Damage Over Time
	 * @param {*} combatant 
	 * @param {*} context 
	 */
	async _onStartTurn(combatant, context) {
		await super._onStartTurn(combatant, context);
		// TODO MOVE THIS TO DOCUMENT TYPE DATA MODEL?
		await this._manageSustainedEffects(combatant, context);
		await this._manageDOTEffects(combatant, context);
	}

	/* -------------------------------------------- */

	async _manageSustainedEffects(combatant, context) {
		if (!combatant.actor) return;
		if (!game.user.isActiveGM) return;
		if (!combatant.actor.effects.some(e => e.isSustained)) return;
		const messageData = {
			author: game.user.id,
			speaker: ChatMessage.getSpeaker({ actor: combatant.actor }),
			flags: { tormenta20: { sustain: true } },
		};
		if (combatant.actor.type == "character") {
			const representing = game.users.find(i => i.character == combatant.actor);
			if (representing?.active) messageData.author = representing.id;
			else {
				for (const user of game.users) {
					if (user.isSelf || !user.active) continue;
					if (combatant.actor.getUserLevel(user) > 3) messageData.author = user.id;
				}
			}
		}
		await ChatMessage.create(messageData);
	}

	/* -------------------------------------------- */

	async _manageDOTEffects(combatant, context) {
		if (!combatant.actor) return;

	}
}