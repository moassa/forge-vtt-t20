const { ActiveEffectTypeDataModel } = foundry.data;
const { fields } = foundry.data;
/**
 * @import {ActiveEffectChangeData} from "@client/documents/_types.mjs"
 */
export default class BaseEffect extends ActiveEffectTypeDataModel {
	/** @inheritDoc */
	static defineSchema() {
		const schema = super.defineSchema();
		schema.targets = new fields.SetField(
			new fields.StringField({
				required: true,
				choices: {
					self: "T20.Self",
					ally: "T20.Ally",
					enemy: "T20.Enemy"
				}
			}), {
			required: true,
			label: "T20.EffectTargets",
			initial: []
		});
		schema.status = new fields.SchemaField({
			category: new fields.StringField({
				required: true,
				blank: true,
				label: "T20.EFFECT.STATUS.category.label"
			}),
			ignoreImunity: new fields.BooleanField({
				required: true,
				initial: false,
				label: "T20.EFFECT.STATUS.ignoreImunity.label"
			}),
			upgrade: new fields.StringField({
				required: true,
				blank: true,
				label: "T20.EFFECT.STATUS.upgrade.label"
			}),
			childEffect: new fields.SetField(
				new fields.StringField({
					required: true,
					blank: false
				}), {
				label: "T20.EFFECT.STATUS.childEffect.label"
			})
		}, { nullable: true, initial: null });

		schema.onuse = new fields.BooleanField({
			required: true,
			initial: false,
			label: "T20.OnUseEffect"
		});
		schema.abilityUse = new fields.SchemaField({
			description: new fields.StringField({
				required: true,
				label: "T20.Description"
			}),
			automatic: new fields.BooleanField({
				required: true,
				initial: false,
				label: "T20.AlwaysApply"
			}),
			aumenta: new fields.BooleanField({
				required: true,
				initial: false,
				label: "T20.AllowMultApply"
			}),
			custo: new fields.NumberField({
				required: true,
				nullable: true,
				initial: null,
				label: "T20.PMCost"
			}),
			names: new fields.SetField(new fields.StringField({ blank: false }), {
				label: "T20.SpecificItems"
			}),
			types: new fields.SetField(
				new fields.StringField({
					blank: false,
					choices: {
						self: "T20.ApplyToSelf",
						ability: "T20.Ability",
						attack: "T20.Attack",
						consumable: "T20.Consumable",
						equipment: "T20.Equipment",
						power: "T20.Power",
						skill: "T20.Skill",
						spell: "T20.Spell"
					}
				}),
				{
					label: "T20.ApplyTo"
				}
			)
		});
		schema.aura = new fields.SchemaField({
			isAura: new fields.BooleanField({
				required: true,
				initial: false,
				label: "T20.EFFECT.AURA.IsAura.label"
			}),
			range: new fields.NumberField({
				required: true,
				min: 0,
				initial: 0,
				label: "T20.EFFECT.AURA.range.label"
			}),
			behaviors: new fields.JSONField({
				gmOnly: true,
				nullable: true,
				label: "DOCUMENT.RegionBehaviors",
				hint: "T20.ConfigRegionBehaviorHint",
			}),
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

	get isCantrip() {
		return (
			this.onuse
			&& this.parent.item?.type == "magia"
			&& this.abilityUse.custo == null
			&& this.abilityUse.types.has("self")
		);
	}

	/* -------------------------------------------- */

	get isSuppressed() {
		if (!this.parent.isEmbedded) return false;
		if (!this.parent.target) return false;
		if (this.parent.target.documentName != "Actor") return false;
		let suppressed = super.isSuppressed ?? false;
		if (!suppressed) suppressed = this.isSupressedByEquipment;
		// if (!suppressed) suppressed = this.isSupressedByTarget;
		if (this.status) {
			if (!suppressed) suppressed = this.isSuppressedByInheritance;
			if (!suppressed) suppressed = this.isSuppressedByDuplicated;
			if (!suppressed) suppressed = this.isSuppressedByUpgrade;
			if (!suppressed) suppressed = this.isSuppressedByImunity;
		}
		return suppressed;
	}

	/* -------------------------------------------- */

	get isSupressedByEquipment() {
		const item = this.parent.item;
		if (item) return item.areEffectsSuppressed;
		return false;
	}

	/* -------------------------------------------- */

	get isSupressedByTarget() {
		if (!this.targets?.size) return false;
		if (!this.parent.origin) return false;
		const origin = foundry.utils.fromUuidSync(this.parent.origin);
		const ancestors = this.parent.getAncestors();
		console.log(ancestors);
		const originToken = ancestors.token ?? ancestors.actor?.getActiveTokens(true, true).at(0);
		// origin.documentName == "Actor"
		// 	? (origin.parent.actor.token ?? origin.parent.actor.getActiveTokens().at(0))
		// 	: origin.documentName == "RegionBehavior"
		// 		? origin.region.attachment.token
		// 		: null;

		const parentToken = this.parent.actor.token ?? this.parent.actor.getActiveTokens(true, true).at(0);
		if (!parentToken || !originToken) return false;
		const isSelf = parentToken.actor == originToken.actor;
		const isAlly = parentToken.disposition == originToken.disposition;

		if (this.targets.has("self") && isSelf) return false;
		if (this.targets.has("ally") && isAlly) return false;
		if (this.targets.has("enemy") && !isAlly) return false;
		return true;
	}

	/* -------------------------------------------- */

	// If Parent Condition is supressed, child will be supressed too
	get isSuppressedByInheritance() {
		if (this.parent.origin) {
			const effect = this.parent;
			const id = effect.origin.split(".").pop();
			const origin = effect.parent.effects.get(id);
			if (origin && origin.system.status) return !origin.active;
		}
		return false;
	}

	/* -------------------------------------------- */

	// If more than one of the same status are present, the oldest ones get supressed
	get isSuppressedByDuplicated() {
		const actor = this.parent.actor;
		const item = this.parent.item;
		const statusId = this.parent.statuses.first();
		const duplicate = actor.effects.some(
			(ef) =>
				ef.id != this.parent.id && ef.statuses.has(statusId) && ef._stats.createdTime > this.parent._stats.createdTime
		);
		return duplicate;
	}

	/* -------------------------------------------- */

	// If upgraded version is present
	get isSuppressedByUpgrade() {
		const actor = this.parent.actor;
		const hasUpgrade = !!this.status.upgrade;
		return hasUpgrade && actor.statuses.has(this.status.upgrade);
	}

	/* -------------------------------------------- */

	// Actor is Imunity
	get isSuppressedByImunity() {
		const actor = this.parent.actor;
		const status = this.status;
		const statusId = this.parent.statuses.first();
		if (!status.ignoreImunity) {
			const imunities = foundry.utils.getProperty(actor, "system.tracos.ic.value");
			if (statusId && imunities.has(statusId)) return true;
			if (status.category && imunities.has(status.category)) return true;
		}
		return false;
	}

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
	prepareDerivedData() {
		// prepareCostLabel
		if (this.onuse) {
			if (this.isCantrip) this.abilityUse.costLabel = _loc("T20.Cantrip");
			else if (this.abilityUse.custo == null) this.abilityUse.costLabel = "—";
			else this.abilityUse.costLabel = `${this.abilityUse.custo} ${_loc("T20.MP")}`;
		}
	}

	/* -------------------------------------------- */
	/*  Database Operations                         */
	/* -------------------------------------------- */

	/** @inheritDoc */
	async _preCreate(data, options, user) {
		if (await super._preCreate(data, options, user) === false) return false;

		if (!user.isActiveGM) return;

		// Avoid duplicate effects from RegionBehaviors
		const ancestors = this.parent.getAncestors();
		if (ancestors.actor == this.parent.parent) return false;
		else if (this.parent.parent.effects.some(e => e.name == this.parent.name)) return false;

		if (foundry.utils.getProperty(data, "system.aura.isAura")) {
			if (ancestors.behavior) {
				if (this.targets.size) {
					const originToken = ancestors.actor.token ?? ancestors.actor.getActiveTokens().at(0);
					const parentToken = this.parent.actor.token ?? this.parent.actor.getActiveTokens().at(0);
					let allowed = [...this.targets].map(t => {
						if (t == "self") return parentToken.actor == originToken.actor;
						else if (t == "ally") return parentToken.disposition == originToken.disposition;
						else if (t == "enemy") return parentToken.disposition != originToken.disposition;
					});
					if (allowed.every(i => i == false)) return false;
				}

				this.parent.updateSource({
					"system.aura.isAura": false,
					"system.aura.range": null,
					"system.aura.behaviors": [],
				});
			}
		}

		if (data.duration?.expiry == "sustainEnd" && data.origin) {
			if (foundry.utils.fromUuidSync(data.origin)) return;
			const [uuid, id] = data.origin.split(".ActiveEffect.");
			const origin = foundry.utils.fromUuidSync(uuid);
			const sustainEffect = (await ActiveEffect.fromStatusEffect("sustentando")).toObject();
			sustainEffect._id = id;
			sustainEffect.name += ` (${data.name})`;
			await ActiveEffect.create(sustainEffect, {
				keepId: true,
				parent: origin,
			});
		}
	}

	/** @inheritDoc */
	_onCreate(data, options, userId) {
		super._onCreate(data, options, userId);
		if (game.user.isActiveGM) {
			if (this.aura.isAura) canvas.regions.manageAuras(); // this._createAura();
		}
		if (game.userId == userId) {
			if (this.status) this._createChildStatus();
		}

	}

	/** @inheritDoc */
	_onUpdate(data, options, userId) {
		super._onUpdate(data, options, userId);
		if (game.user.isActiveGM) {
			if (this.aura.isAura) canvas.regions.manageAuras();
		}
		if (game.userId == userId) {
		}
	}
	/* -------------------------------------------- */

	/** @inheritdoc */
	_onDelete(options, userId) {
		super._onDelete(options, userId);
		if (game.user.isActiveGM) {
			if (this.parent.statuses.first() == "sustentando") this._deleteSustainEffects();
			if (this.aura.isAura) canvas.regions.manageAuras();
		}
		if (game.userId == userId) {
			if (this.status) this._deleteChildStatus();
		}
	}

	/* -------------------------------------------- */

	/**
	 *
	 * @returns
	 */
	async _createChildStatus() {
		if (!this.parent.isEmbedded) return;
		if (this.parent.parent.documentName != "Actor") return;
		const { childEffect } = this.status;
		const effects = [];
		for (const statusId of childEffect) {
			const effect = await ActiveEffect.fromStatusEffect(statusId);
			const source = effect.toObject();
			source.origin = this.parent.uuid;
			effects.push(source);
		}
		if (foundry.utils.isEmpty(effects)) return;
		await this.parent.actor.createEmbeddedDocuments("ActiveEffect", effects);
	}

	/* -------------------------------------------- */


	_deleteChildStatus() {
		if (!this.parent.isEmbedded) return;
		if (this.parent.parent?.documentName != "Actor") return;
		if (!this.status.childEffect.size) return;
		const effects = this.parent.actor.effects.filter((ef) => ef.origin == this.parent.uuid).map((ef) => ef.id);
		if (foundry.utils.isEmpty(effects)) return;
		this.parent.actor.deleteEmbeddedDocuments("ActiveEffect", effects);
	}

	/* -------------------------------------------- */

	async _deleteSustainEffects() {
		if (!this.parent.isEmbedded) return;
		if (this.parent.parent?.documentName != "Actor") return;
		const uuid = this.parent.uuid;
		const toDelete = [];
		for (const actor of game.actors) {
			const ids = actor.effects.filter(i => i.origin == uuid).map(i => i.id);
			if (!ids.length) continue;
			toDelete.push({
				ids: ids,
				action: "delete",
				documentName: "ActiveEffect",
				parent: actor
			});
		}
		foundry.documents.modifyBatch(toDelete);
	}
}
