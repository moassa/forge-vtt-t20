import { effectMigration } from "./migrations.mjs";

/**
 * Extend the base ActiveEffect class to implement system-specific logic.
 */
export default class ActiveEffectT20 extends foundry.documents.ActiveEffect {

	/* Boolean cache supressed status between updates */
	#suppressed;

	/**
	 * Verify if the entry has an uuid and retrieve a cloned document if true
	 *  @inheritdoc */
	static async _fromStatusEffect(statusId, effectData, options) {
		const uuid = CONFIG.statusEffects[statusId]?.uuid;
		if (uuid) {
			const effect = await foundry.utils.fromUuid(uuid);
			if (!effect) return effect.clone({}, { keepId: false });
		}
		return new this(effectData, options);
	}

	/* -------------------------------------------- */
	/*  Migration                                   */
	/* -------------------------------------------- */

	/** @inheritdoc */
	static migrateData(data) {
		super.migrateData(data);
		effectMigration.migrateAbilitiesPath(data);
		effectMigration.migrateResistancesPath(data);
		return data;
	}

	/* -------------------------------------------- */
	/*  Getters and Setters                         */
	/* -------------------------------------------- */

	/** @override */
	get active() {
		return !this.disabled && !this.isSuppressed && !this.isUsage;
	}

	/* -------------------------------------------- */

	/** @override */
	get isSuppressed() {
		if (this.#suppressed) return this.#suppressed;
		this.#suppressed = super.isSuppressed;
		return this.#suppressed;
	}

	/* -------------------------------------------- */

	/** @override */
	get isUsage() {
		return this.system.onuse;
	}

	/* -------------------------------------------- */

	get isCondition() {
		return Boolean(this.system.status);
	}

	/* -------------------------------------------- */

	get isSustained() {
		if (this._stats.duplicateSource) {
			const origin = foundry.utils.fromUuidSync(this._stats.duplicateSource);
			if (origin != this.actor) return false;
		}
		return this.active && this.duration?.expiry == "sustainEnd";
	}

	/* -------------------------------------------- */

	get isOngoingDamage() {
		if (this._stats.duplicateSource) {
			const origin = foundry.utils.fromUuidSync(this._stats.duplicateSource);
			if (origin != this.actor) return false;
		}
		return this.system.changes.some(c => c.key == "danoContinuo");
	}

	/* -------------------------------------------- */
	/*  Methods                                     */
	/* -------------------------------------------- */

	/** @inheritdoc */
	shouldApplyChange(change, options) {
		if (!super.shouldApplyChange(change, options)) return false;
		// Effects withs
		if (change.key.match(/\.\?+\./)) return false;
		// Original Aura effects apply to parent when has self in targets
		if (this.system.aura?.isAura) {
			const aura = this.system.aura;
			for (const behavior of Object.values(aura.behaviors)) {
				if (behavior.type != "applyActiveEffect") continue;
				if (!behavior.targets.has("self")) return false;
			}
		}
		return true;
	}

	/* -------------------------------------------- */

	/** @inheritdoc */
	static applyChange(targetDoc, change, options) {
		if (change.key?.startsWith("flags.tormenta20")) {
			this._prepareFlagChange(targetDoc, change);
		}
		if (change.key.startsWith("system.attributes.movement") && change.key.match(/(walk|fly|burrow|climb|swim)$/)) {
			change.key += change.type == "add" ? ".bonus" : ".base";
		}
		if (change.key.search(/\.\*\./) > 0) {
			return this._prepareProxyChange(targetDoc, change, options);
		}
		return super.applyChange(targetDoc, change, options);
	}

	/**
	 * Transform the data type of the change to match the type expected for flags.
	 * @param {ActorT20} actor           The Actor to whom this effect should be applied.
	 * @param {EffectChangeData} change  The change being applied.
	 * @returns {EffectChangeData}       The change with altered types if necessary.
	 */
	static _prepareFlagChange(actor, change) {
		const { key, value } = change;
		const data = CONFIG.T20.characterFlags[key.replace("flags.tormenta20.", "")];
		if (!data) return change;

		// Set flag to initial value if it isn't present
		const current = foundry.utils.getProperty(actor, key) ?? null;
		if (current === null) {
			let initialValue = null;
			if (data.placeholder) initialValue = data.placeholder;
			else if (data.type === Boolean) initialValue = false;
			else if (data.type === Number) initialValue = 0;
			foundry.utils.setProperty(actor, key, initialValue);
		}

		// Coerce change data into the correct type
		if (data.type === Boolean) {
			if (value === "false") change.value = false;
			else change.value = Boolean(value);
		} else if (data.type === Number) {
			if (value.startsWith("@")) {
				let rolldata = actor.getRollData();
				let numvalue = Roll.replaceFormulaData(value, rolldata);
				change.value = Number(numvalue);
			}
		}
		return change;
	}

	/**
	 * Apply a change to multiple entries from an object.
	 * @param {*} targetDoc 
	 * @param {*} change 
	 * @param {*} options 
	 * @returns 
	 */
	static _prepareProxyChange(targetDoc, change, options) {
		const PROXY_KEYS = [
			"system.atributos.*.value",
			"system.atributos.*.bonus",
			"system.pericias.*.bonus",
			"system.pericias.*.condi",
			"system.attributes.movement.*.value",
			"system.attributes.movement.*.base",
			"system.attributes.movement.*.bonus"
		];
		if (!PROXY_KEYS.includes(change.key)) return;

		const filters = {
			// Movement contains keys that are not MovementObject (ie: hover, flags);
			"system.attributes.movement": (key) => T20.movementTypes[key]
		};
		let [fieldPath, field] = change.key.split(".*");
		field ??= "";
		// Replica `system.path.*.key` pra todas as chaves de `system.path`
		const property = foundry.utils.getProperty(targetDoc, fieldPath);

		const filter = filters[fieldPath] ?? (() => true);
		for (const key of Object.keys(property).filter(filter)) {
			change.key = `${fieldPath}.${key}${field}`;
			super.applyChange(targetDoc, change, options);
		}
	}

	/* -------------------------------------------- */

	/** @inheritdoc */
	isExpiryEvent(event, context) {
		let isExpiryEvent = super.isExpiryEvent(event, context);
		if (event == "sceneEnd" && context.combat) {
			// Combat related events should also terminate
			const combatEvents = new Set(["sustainEnd", "combatEnd", "roundStart", "roundEnd", "turnStart", "turnEnd"]);
			if (combatEvents.has(this.duration.expiry)) isExpiryEvent = true;
		}

		if (isExpiryEvent && context.expiredEffects) {
			if (this.actor?.id) {
				const actor = this.actor.token ?? this.actor;
				context.expiredEffects[actor.id] ??= [`<b>${actor.name}:</b>`];
				context.expiredEffects[actor.id].push(this.name);
			}
		}
		// TODO determine if effect should be deleted or updated
		return isExpiryEvent;
	}

	/* -------------------------------------------- */
	/*  Data Preparation                            */
	/* -------------------------------------------- */

	/**
	 * Prepare derived data related to active effect duration
	 * @internal
	 */
	_prepareDuration() {
		if (this.duration.expiry == "sceneEnd") {
			let duration = this.duration;
			duration.expired = false;
			duration.value = 1;
			duration.label = _loc(CONFIG.ActiveEffect.expiryEvents.sceneEnd);
			return duration;
		} else return super._prepareDuration();
	}

	/* -------------------------------------------- */
	/*  Database Operation                          */
	/* -------------------------------------------- */

	/** @inheritDoc */
	async _preCreate(data, options, user) {
		const allowed = await super._preCreate(data, options, user);
		if (allowed === false) return false;
		if (this._stats.duplicateSource) {
			// Avoid duplicate effects from RegionBehaviors
			const origin = foundry.utils.fromUuidSync(this._stats.duplicateSource);
			if (origin?.actor == this.parent) return false;
		}
		if (this.parent && ["comodo", "mobilia"].includes(this.parent.type)) {
			this.updateSource({ transfer: !this.parent.system.residentes });
		}
	}

	/* -------------------------------------------- */

	/** @inheritDoc */
	async _preDelete(options, user) {
		if ((await super._preDelete(options, user)) === false) return false;
		console.log(options, user);
	}

	/* -------------------------------------------- */

	/** @inheritDoc */
	_onDelete(options, userId) {
		super._onDelete(options, userId);
		console.log(options, userId);
	}

	/* -------------------------------------------- */
	/*  Deprecated Requires Migration               */
	/* -------------------------------------------- */

	/**
	 * Manage Active Effect instances through the Actor Sheet via effect control buttons.
	 * @param {MouseEvent} event        The left-click event on the effect control
	 * @param {ActorT20|ItemT20} owner  The owning document which manages this effect
	 * @returns {Promise|null}          Promise that resolves when the changes are complete.
	 */
	static async onManageActiveEffect(event, owner) {
		event.preventDefault();
		const a = event.currentTarget;
		const li = a.closest("li");
		const effect = li.dataset.effectId ? owner.effects.get(li.dataset.effectId) : null;
		const type = li.dataset.effectType === "onuseTemp" ? "onuse" : li.dataset.effectType;
		const temp = li.dataset.effectType === "onuseTemp";
		switch (a.dataset.action) {
			case "create": {
				const isOnUse = type === "onuse";
				const itemEffect = owner.documentName === "Item";
				const abilityUseTypes = [];
				if (owner.type === "magia") abilityUseTypes.push("self");
				const effectData = {
					name: isOnUse || !itemEffect ? game.i18n.localize("T20.EffectNewLabel") : owner.name,
					img: isOnUse ? "icons/svg/upgrade.svg" : itemEffect ? owner.img : "icons/svg/aura.svg",
					origin: itemEffect ? null : owner.uuid,
					tint: "#FFFFFF",
					transfer: false,
					system: {
						onuse: isOnUse,
						abilisyUse: { types: abilityUseTypes }
					},
					duration: {
						units: type === "temporary" || temp ? "rounds" : null,
						expiry: type === "temporary" || temp ? "sceneEnd" : null,
					},
					disabled: ["inactive", "onuse"].includes(type)
				};
				if (event.type == "contextmenu") {
					return await owner.createEmbeddedDocuments("ActiveEffect", [effectData], { renderSheet: true });
				}
				return new ActiveEffectWizard(owner, effectData).render({ force: true });
			}
			case "create-status": {
				const statusEffect = await ActiveEffect.fromStatusEffect(a.dataset.statusId);
				if (!statusEffect) return false;
				statusEffect.transfer = false;
				return owner.createEmbeddedDocuments("ActiveEffect", [statusEffect.toObject()]);
			}
			case "edit":
				return effect.sheet.render(true);
			case "delete":
				return effect.delete();
			case "toggle":
				return effect.update({ disabled: !effect.disabled });
		}
	}

	/* --------------------------------------------- */

	/**
	 * Prepare the data structure for Active Effects which are currently applied to an Actor or Item.
	 * @param {ActiveEffect[]} effects    The array of Active Effect instances to prepare sheet data for
	 * @return {object}                   Data for rendering
	 */
	static async prepareActiveEffectCategories(effects) {
		// Define effect header categories
		const categories = {
			onuse: {
				type: "onuse",
				label: game.i18n.localize("T20.OnUseEffects"), // "Efeitos de Uso",
				effects: []
			},
			onuseTemp: {
				type: "onuseTemp",
				label: game.i18n.localize("T20.OnUseEffectTemporary"), // "Efeitos de Uso Temporários",
				effects: []
			},
			temporary: {
				type: "temporary",
				label: game.i18n.localize("T20.EffectTemporary"), // "Efeitos Temporários",
				effects: []
			},
			passive: {
				type: "passive",
				label: game.i18n.localize("T20.EffectPassive"), // "Efeitos Passivos",
				effects: []
			},
			inactive: {
				type: "inactive",
				label: game.i18n.localize("T20.EffectInactive"), // "Efeitos Inativos",
				effects: []
			},
			suppressed: {
				type: "suppressed",
				label: game.i18n.localize("T20.EffectSuppressed"),
				effects: [],
				info: [game.i18n.localize("T20.EffectSuppressedHint")]
			}
		};
		const TextEditor = await foundry.applications.ux.TextEditor.implementation;

		// Iterate over active effects, classifying them into categories
		for (let e of effects) {
			if (e.system.onuse) {
				const label = document.createElement("label");
				label.innerText = `${e.system.abilityUse.costLabel} ${e.name}: `
				if (!e.description) {
					const description = document.createElement("p");
					description.prepend(label);
					e.descriptionEnriched = description.outerHTML;
				} else {
					let description = await TextEditor.enrichHTML(e.description);
					description = foundry.utils.parseHTML(description);
					description.prepend(label);
					e.descriptionEnriched = description.outerHTML;
				}
			}

			if (e.isSuppressed) categories.suppressed.effects.push(e);
			else if (e.system.onuse && e.isTemporary) categories.onuseTemp.effects.push(e);
			else if (e.system.onuse) categories.onuse.effects.push(e);
			else if (e.disabled) categories.inactive.effects.push(e);
			else if (e.isTemporary) categories.temporary.effects.push(e);
			else categories.passive.effects.push(e);
		}

		return categories;
	}
}