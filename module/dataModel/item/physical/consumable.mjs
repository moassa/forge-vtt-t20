import Tormenta20ItemData from "../item.mjs";

const fields = foundry.data.fields;

export default class ConsumableData extends Tormenta20ItemData {
	/** @override */
	static defineSchema() {
		let type = "consumivel";
		let schema = {
			...super.defineSchema(),
			...this.schemaPhysicalItem(type),
			...this.schemaActivation(type),
			...this.schemaSavingThrow(type),
			...this.schemaUpgrades(type),
			...this.schemaRolls(),
			tipo: new fields.StringField({
				required: true,
				blank: true,
				choices: {
					ammo: "T20.ConsumableTypeAmmo",
					scroll: "T20.ConsumableTypeScroll",
					alchemy: "T20.ConsumableTypeAlchemy",
					potion: "T20.ConsumableTypePotion",
					material: "T20.ConsumableTypeMaterial",
					food: "T20.ConsumableTypeFood",
				},
				initial: "",
				label: "T20.ItemType",
			}),
			subtipo: new fields.StringField({
				required: true,
				nullable: false,
				initial: "",
				label: "T20.ItemSubType",
				hint: "T20.ItemSubTypeHint"
			})
		};

		return schema;
	}
}
