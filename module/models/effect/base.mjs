const { ActiveEffectTypeDataModel } = foundry.data;
const { fields } = foundry.data;
/**
 * @import {ActiveEffectChangeData} from "@client/documents/_types.mjs"
 */
export default class BaseEffect extends ActiveEffectTypeDataModel {
	/** @inheritDoc */
	static defineSchema() {
		const schema = super.defineSchema();

		schema.onuse = new fields.BooleanField({
			required: true, initial: false,
			label: "T20.OnUseEffect",
		});
		schema.duration = new fields.SchemaField({
			scene: new fields.BooleanField({
				required: true, initial: false,
				label: "T20.TimeScene",
			}),
		});
		schema.abilityUse = new fields.SchemaField({
			description: new fields.StringField({
				required: true,
				label: "T20.Description",
			}),
			automatic: new fields.BooleanField({
				required: true, initial: false,
				label: "T20.AlwaysApply",
			}),
			aumenta: new fields.BooleanField({
				required: true, initial: false,
				label: "T20.AllowMultApply",
			}),
			custo: new fields.NumberField({
				required: true, nullable: true,
				initial: null,
				label: "T20.PMCost",
			}),
			names: new fields.SetField(new fields.StringField({ blank: false }), {
				label: "T20.SpecificItems",
			}),
			types: new fields.SetField(new fields.StringField({
				blank: false,
				choices: {
					self: "T20.ApplyToSelf",
					ability: "T20.Ability",
					attack: "T20.Attack",
					consumable: "T20.Consumable",
					equipment: "T20.Equipment",
					power: "T20.Power",
					skill: "T20.Skill",
					spell: "T20.Spell",
				}
			}), {
				label: "T20.ApplyTo",
			})
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