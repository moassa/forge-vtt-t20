const { ActiveEffectTypeDataModel } = foundry.data;
const { fields } = foundry.data;
/**
 * @import {ActiveEffectChangeData} from "@client/documents/_types.mjs"
 */
export default class Tormenta20AETypeData extends ActiveEffectTypeDataModel {

	static LOCALIZATION_PREFIXES = ["TORMENTA20.DOCUMENT", "TORMENTA20.ACTIVEEFFECT.BASE"];

	/** @inheritDoc */
	static defineSchema() {
		const schema = super.defineSchema();

		schema.onuse = new fields.BooleanField({
			required: true, initial: false
		});
		schema.durationScene = new fields.BooleanField({
			required: true, initial: false
		});
		schema.abilityUse = new fields.SchemaField({
			aumenta: new fields.BooleanField({
				required: true, initial: false
			}),
			custo: new fields.NumberField({
				required: true, nullable: true,
				initial: null,
			}),
			names: new fields.SetField(new fields.StringField({ blank: false })),
			types: new fields.SetField(new fields.StringField({
				blank: false,
				choices: {
					self: "TORMENTA20.Self",
					ability: "TORMENTA20.Ability",
					attack: "TORMENTA20.Attack",
					consumable: "TORMENTA20.Self",
					equipment: "TORMENTA20.Self",
					power: "TORMENTA20.Self",
					skill: "TORMENTA20.Self",
					spell: "TORMENTA20.Self",
				}
			}))
		});
		return schema;
	}

	/* -------------------------------------------- */
	/*  Schema Factory                              */
	/* -------------------------------------------- */

	/* -------------------------------------------- */
	/*  Field Function                              */
	/* -------------------------------------------- */

	/* -------------------------------------------- */
	/*  Getters/Setters                             */
	/* -------------------------------------------- */


	/* -------------------------------------------- */
	/*  Migration                                   */
	/* -------------------------------------------- */

	static migrateData(source) {
		return super.migrateData(source);
	}

	/* -------------------------------------------- */
	/*  System Operations                           */
	/* -------------------------------------------- */


	/* -------------------------------------------- */
	/* Data Preparation                             */
	/* -------------------------------------------- */

	/** @inheritDoc */
	prepareBaseData() { }

	/* -------------------------------------------- */

	/** @inheritDoc */
	prepareDerivedData() { }

	/* -------------------------------------------- */

	/* -------------------------------------------- */
	/*  Database Operations                         */
	/* -------------------------------------------- */

}