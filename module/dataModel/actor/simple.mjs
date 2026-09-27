import CreatureData from "./templates/creature.mjs";

import AttributesFields from "./templates/attributes.mjs";

export default class SimpleData extends CreatureData {
	static actorType = "simple";

	prepareBaseData() {
		this.prepareBaseAtributos();
	}

	prepareDerivedData() {
		const rollData = this.parent.getRollData();
		this.prepareAtributos({ rollData });
		AttributesFields.prepareDefense.call(this, rollData);
		this.prepareSkills({ rollData });

		AttributesFields.prepareEncumbrance.call(this, rollData);
		AttributesFields.prepareMovement.call(this);
		AttributesFields.prepareDamageResistances.call(this, rollData);
	}


	/* -------------------------------------------- */
	/*  Database Operations                         */
	/* -------------------------------------------- */

	/** @inheritdoc */
	async _preCreate(data, options, user) {
		if (await super._preCreate(data, options, user) === false) return false;

		const updates = foundry.utils.mergeObject({
			prototypeToken: {
				actorLink: false,
				disposition: CONST.TOKEN_DISPOSITIONS.NEUTRAL,
			},
		}, data, { insertKeys: false, insertValues: false });
		this.parent.updateSource(updates);
	}
}
