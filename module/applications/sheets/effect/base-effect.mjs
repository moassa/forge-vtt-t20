import * as abstract from "../abstract/_module.mjs";

const { DocumentSheet } = foundry.applications.api;
const { ActiveEffectConfig } = foundry.applications.sheets;
const { renderTemplate } = foundry.applications.handlebars;
const { Tormenta20ApplicationMixin, SheetActionEditImage } = abstract;

const DURATION_UNITS = CONST.ACTIVE_EFFECT_DURATION_UNITS;
const TIME_DURATION_UNITS = CONST.ACTIVE_EFFECT_TIME_DURATION_UNITS;

/**
 * @import ActiveEffect from "@client/documents/active-effect.mjs"
 */

/**
 * Extends base DocumentSheet implementing handlebars and commom actions;
 * @extends {ApplicationT20, DocumentSheet}
 */
export default class ActiveEffectBaseSheet extends Tormenta20ApplicationMixin({
	Base: ActiveEffectConfig,
	hasHAM: true,
	mixins: []
}) {
	/** @override */
	static DEFAULT_OPTIONS = {
		classes: ["active-effect", "active-effect-config"],
		window: {
			contentClasses: ["standard-form"],
			icon: "fa-solid fa-person-rays",
			controls: [{
				icon: "fa-solid fa-clock-rotate-left",
				label: "Reset Tempo de ínicio",
				action: "resetStart",
				visible: true,
			}],
		},
		form: {
			submitOnChange: true,
			closeOnSubmit: false,
		},
		actions: {
			resetStart: ActiveEffectBaseSheet.#onResetStart,
		},
		position: { width: 560 },
	};

	static PARTS = {
		header: {
			template: "templates/sheets/active-effect/header.hbs"
		},
		tabs: {
			template: "templates/generic/tab-navigation.hbs"
		},
		details: {
			template: "templates/sheets/active-effect/details.hbs", scrollable: [""]
		},
		duration: {
			template: "templates/sheets/active-effect/duration.hbs"
		},
		onuse: {
			template: "systems/tormenta20/templates/sheets/active-effect/onuse.hbs"
		},
		changes: {
			template: "templates/sheets/active-effect/changes.hbs",
			templates: ["templates/sheets/active-effect/change.hbs"],
			scrollable: ["ol[data-changes]"]
		},
	};


	/** @override */
	static TABS = {
		sheet: {
			tabs: [
				{ id: "details", icon: "fa-solid fa-book" },
				{ id: "duration", icon: "fa-solid fa-clock" },
				{ id: "onuse", icon: "fa-solid fa-hand-fist", label: "T20.OnUseEffect" },
				{ id: "changes", icon: "fa-solid fa-gears" }
			],
			initial: "details",
			labelPrefix: "EFFECT.TABS"
		}
	}

	/* -------------------------------------------- */
	/* Rendering                                    */
	/* -------------------------------------------- */

	/** @inheritDoc */
	async _onRender(context, options) {
		await super._onRender(context, options);
	}

	/* -------------------------------------------- */

	/** @override */
	async _preparePartContext2(partId, context) {
		const partContext = await super._preparePartContext(partId, context);
		if (!partContext.tabs) partContext.tabs = this._prepareTabs("sheet");
		if (partId in partContext.tabs) partContext.tab = partContext.tabs[partId];
		console.log(partId, Object.keys(partContext));
		switch (partId) {
			case "onuse": await this._prepareOnUsePartContext(partContext, context);
				break;
			// case "details": await this._prepareDetailsPartContext(partContext, context);
			// 	break;
			// case "duration": await this._prepareDurationPartContext(partContext, context);
			// 	break;
			// case "changes": await this._prepareChangesPartContext(partContext, context);
			// 	break;
		}
		return partContext;
	}


	/* -------------------------------------------- */

	async _prepareOnUsePartContext(partContext, context) {

	}

	/**
	 * Prepare data relative to Details core and system fields
	 * @param {*} partContext
	 * @param {*} context
	 */
	async _prepareDetailsPartContext(partContext, context) {
		const effect = this.document;
		partContext.isActorEffect = effect.parent?.documentName === "Actor";
		partContext.isItemEffect = effect.parent?.documentName === "Item";
		partContext.statuses = Object.values(CONFIG.statusEffects)
			.map(s => ({ value: s.id, label: _loc(s.name) }));
		partContext.showIconOptions = Object.entries(CONST.ACTIVE_EFFECT_SHOW_ICON).map(([k, value]) => ({
			value, label: _loc(`EFFECT.SHOW_ICON.${k.toLowerCase()}`)
		})).reverse();
	}

	/* -------------------------------------------- */

	/**
	 * Prepare data relative to Duration core and system fields
	 * @param {*} partContext
	 * @param {*} context
	 */
	async _prepareDurationPartContext(partContext, context) {
		partContext.start = await this._prepareStartContext();
		partContext.hasDuration = typeof context.source.duration.value === "number";
		const groups = {
			time: _loc("EFFECT.DURATION.UNITS.GROUPS.time"),
			combat: _loc("EFFECT.DURATION.UNITS.GROUPS.combat")
		};
		partContext.durationUnits = DURATION_UNITS.map(
			value => ({
				value,
				label: _loc(`EFFECT.DURATION.UNITS.${value}`),
				group: TIME_DURATION_UNITS.includes(value) ? groups.time : groups.combat
			})
		);
		partContext.expiryEvents = Object.entries(ActiveEffect.EXPIRY_EVENTS)
			.map(([value, label]) => ({ value, label: _loc(label) }))
			.sort((a, b) => a.label.localeCompare(b.label, game.i18n.lang))
			.reduce((events, { value, label }) => {
				events[value] = label;
				return events;
			}, {});
	}

	/**
	 * Prepare display context for {@link EffectStartData}.
	 * @returns {object}
	 * @protected
	 */
	async _prepareStartContext() {
		const effect = this.document;
		const start = effect._source.start;
		if (!start) return null;
		const time = game.time.calendar.format(game.time.worldTime - start.time, "ago");
		const combat = effect.start.combat ?? null;
		const combatant = combat?.combatants.get(start.combatant) ?? null;
		const combatantName = combatant?.visible ? combatant.name : "???";
		const combatantInitiative = combatant?.visible === false
			? "???"
			: typeof combatant?.initiative === "number"
				? combatant.initiative
				: _loc("EFFECT.START.NoInitiative");
		return { ...start, time, combat, combatant, combatantName, combatantInitiative };
	}

	/* -------------------------------------------- */

	/**
	 * Prepare data relative to Changes
	 * @param {*} partContext
	 * @param {*} context
	 */
	// async _prepareChangesPartContext(partContext, context) {
	// 	const effect = this.document;
	// 	const fields = effect.system.schema.fields.changes.element.fields;
	// 	const changeTypes = Object.entries(ActiveEffect.CHANGE_TYPES)
	// 		.map(([type, { label }]) => ({ type, label: _loc(label) }))
	// 		.sort((a, b) => a.label.localeCompare(b.label, game.i18n.lang))
	// 		.reduce((types, { type, label }) => {
	// 			types[type] = label;
	// 			return types;
	// 		}, {});
	// 	partContext.changes = await Promise.all(foundry.utils.deepClone(context.source.changes).map((change, index) => {
	// 		const defaultPriority = ActiveEffect.CHANGE_TYPES[change.type]?.defaultPriority ?? 0;
	// 		return this._renderChange({ change, index, fields, defaultPriority, changeTypes });
	// 	}));
	// }

	/**
	 * Prepare render context for a single change object.
	 * @param {object} context                   Data for rendering the change row
	 * @param {EffectChangeData} context.change  A copy of the change from the Effect"s source array
	 * @param {number} context.index             The change object"s index in the array
	 * @param {DataSchema} context.fields        The defined fields of the change data
	 * @param {number} context.defaultPriority   The change type"s default priority
	 * @param {Record<string, string>} context.changeTypes All change types and their localized labels
	 * @returns {Promise<string>}
	 * @protected
	 */
	// async _renderChange(context) {
	// 	const { change, index } = context;
	// 	if (("value" in change) && (typeof change.value !== "string")) change.value = JSON.stringify(change.value);
	// 	Object.assign(
	// 		change,
	// 		["key", "type", "value", "phase", "priority"].reduce((paths, fieldName) => {
	// 			if (fieldName in change) paths[`${fieldName}Path`] = `system.changes.${index}.${fieldName}`;
	// 			return paths;
	// 		}, {}));
	// 	const changeType = ActiveEffect.CHANGE_TYPES[change.type];
	// 	context.changeType = changeType;
	// 	console.log("renderChange", changeType, context);
	// 	return changeType?.render?.(context) ?? renderTemplate("templates/sheets/active-effect/change.hbs", context);
	// }

	/* -------------------------------------------- */

	/** @override */
	async _prepareContext(options) {
		const context = await super._prepareContext(options);
		console.group(`${this.constructor.name} Context`);
		console.log(context);
		console.groupEnd();
		return context;
	}


	/* -------------------------------------------- */
	/*  Event Listeners & Handlers                  */
	/* -------------------------------------------- */

	static #onResetStart(event, target) {
		this.document.update({
			start: this.document.constructor.getEffectStart()
		});
	}
}