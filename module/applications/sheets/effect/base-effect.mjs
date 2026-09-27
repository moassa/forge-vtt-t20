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
			controls: [
				{
					icon: "fa-solid fa-clock-rotate-left",
					label: "Reset Tempo de ínicio",
					action: "resetStart",
					visible: true
				}
			]
		},
		form: {
			submitOnChange: true,
			closeOnSubmit: false
		},
		actions: {
			resetStart: ActiveEffectBaseSheet.#onResetStart,
			editJson: ActiveEffectBaseSheet.#onEditJson,
			toggle: ActiveEffectBaseSheet.#onToggle
		},
		position: { width: 560 }
	};

	static PARTS = {
		header: {
			template: "systems/tormenta20/templates/sheets/active-effect/header.hbs"
		},
		tabs: {
			template: "templates/generic/tab-navigation.hbs"
		},
		details: {
			template: "templates/sheets/active-effect/details.hbs",
			scrollable: [""]
		},
		duration: {
			template: "templates/sheets/active-effect/duration.hbs"
		},
		onuse: {
			template: "systems/tormenta20/templates/sheets/active-effect/onuse.hbs"
		},
		tormenta20: {
			template: "systems/tormenta20/templates/sheets/active-effect/tormenta20.hbs"
		},
		changes: {
			template: "templates/sheets/active-effect/changes.hbs",
			templates: ["templates/sheets/active-effect/change.hbs"],
			scrollable: ["ol[data-changes]"]
		}
	};

	/** @override */
	static TABS = {
		sheet: {
			tabs: [
				{ id: "details", icon: "fa-solid fa-book" },
				{ id: "duration", icon: "fa-solid fa-clock" },
				{ id: "onuse", icon: "fa-solid fa-hand-fist", label: "T20.OnUseEffect" },
				{ id: "changes", icon: "fa-solid fa-gears" },
				{ id: "tormenta20", icon: "fa-solid fa-spaghetti-monster-flying", label: "T20" }
			],
			initial: "details",
			labelPrefix: "EFFECT.TABS"
		}
	};

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
		switch (partId) {
			case "onuse":
				await this._prepareOnUsePartContext(partContext, context);
				break;
			case "tormenta20":
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

	async _prepareOnUsePartContext(partContext, context) {}

	/**
	 * Prepare data relative to Details core and system fields
	 * @param {*} partContext
	 * @param {*} context
	 */
	async _prepareDetailsPartContext(partContext, context) {
		const effect = this.document;
		partContext.isActorEffect = effect.parent?.documentName === "Actor";
		partContext.isItemEffect = effect.parent?.documentName === "Item";
		partContext.statuses = Object.values(CONFIG.statusEffects).map((s) => ({ value: s.id, label: _loc(s.name) }));
		partContext.showIconOptions = Object.entries(CONST.ACTIVE_EFFECT_SHOW_ICON)
			.map(([k, value]) => ({
				value,
				label: _loc(`EFFECT.SHOW_ICON.${k.toLowerCase()}`)
			}))
			.reverse();
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
		partContext.durationUnits = DURATION_UNITS.map((value) => ({
			value,
			label: _loc(`EFFECT.DURATION.UNITS.${value}`),
			group: TIME_DURATION_UNITS.includes(value) ? groups.time : groups.combat
		}));
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
		const combatantInitiative =
			combatant?.visible === false
				? "???"
				: typeof combatant?.initiative === "number"
					? combatant.initiative
					: _loc("EFFECT.START.NoInitiative");
		return { ...start, time, combat, combatant, combatantName, combatantInitiative };
	}

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

	static #onToggle(event, target) {
		const { fieldPath } = target.dataset;
		const current = foundry.utils.getProperty(this.document, fieldPath);
		const field = this.document.getFieldForProperty(fieldPath);
		this.document.update({
			[fieldPath]: current ? null : field.clean({})
		});
	}

	static #onEditJson(event, target) {
		const { fieldPath } = target.dataset;
		new tormenta20.applications.api.DocumentFieldSheet({
			document: this.document,
			fields: [fieldPath]
		}).render(true);
	}
}
