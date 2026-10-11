import * as abstract from "../abstract/_module.mjs";
const Autocomplete = foundry.applications.ux.Autocomplete;

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

	/**
	 * The auto-complete menu.
	 * @type {Autocomplete}
	 */
	#autocomplete = new foundry.applications.ux.Autocomplete({ onSelect: this.#onAutocomplete.bind(this) });

	/**
	 * Current input for auto-complete menu.
	 * @type {HTMLInputElement}
	 */
	#autocompleteInput;

	/**
	 * Auto-complete context suggestions.
	 * @type {{ identifier: string, label: string }[]}
	 */
	autocompleteContext;

	/* -------------------------------------------- */
	/* Rendering                                    */
	/* -------------------------------------------- */

	/** @inheritDoc */
	async _onRender(context, options) {
		await super._onRender(context, options);

		this._createAutoComplete();
	}

	/* -------------------------------------------- */

	/**
	 * Register autocomplete entries.
	 * @protected
	 */
	_createAutoComplete() {
		this._prepareAutocompleteContext();
		const changeInputs = this.element.querySelectorAll(`.tab.changes li .key input`);

		const activateAutocomplete = (event, input) => {
			if (input.value) {
				const value = new RegExp(input.value.slugify(), "gi");
				const filtered = this.autocompleteContext.filter(
					(i) => i.identifier.match(value) || i.label.slugify().match(value)
				);
				if (filtered.length) {
					this.#autocomplete.activate(input, filtered);
					this.#autocompleteInput = input;
				} else {
					this.#autocomplete.dismiss();
					this.#autocompleteInput = undefined;
				}
			} else {
				this.#autocomplete.dismiss();
				this.#autocompleteInput = undefined;
			}
			// Dismiss is click somewhere else
			if (this.#autocomplete.element) {
				const controller = new AbortController();
				document.addEventListener(
					"click",
					(event) => {
						if (event.target.closest("menu#autocomplete")) {
						} else if (event.target == this.#autocompleteInput) {
						} else {
							this.#autocomplete.dismiss();
							controller.abort();
						}
					},
					{ signal: controller.signal }
				);
			}
		};

		for (const input of [...changeInputs]) {
			input.addEventListener("focus", (event) => {
				activateAutocomplete(event, input);
			});
			input.addEventListener("keyup", (event) => {
				if (["Escape", "Enter", "Tab", "ArrowDown", "ArrowUp"].includes(event.key)) return;
				activateAutocomplete(event, input);
			});
		}
	}

	/**
	 * Prepare autocomplete properties
	 * @protected
	 */
	_prepareAutocompleteContext() {
		if (this.autocompleteContext) return this.autocompleteContext;
		const actor = new CONFIG.Actor.documentClass({
			type: "character",
			name: "autocomplete"
		});
		const character = actor.system;
		const paths = {};
		const choices = [];

		function register(key, property, path = "", record = null) {
			path = [path, key].filterJoin(".");
			const field = character.getFieldForProperty(path);
			// console.log(key, property, field);

			if (!field) {
				return;
			} else if (field.element) {
				for (let [k, p] of Object.entries(property)) {
					register(k, p, path, property[k]);
				}
			} else if (field.fields) {
				for (let [k, p] of Object.entries(property)) {
					register(k, p, path, record);
				}
			} else if (field instanceof foundry.data.fields.StringField && !field.choices) {
			} else if (path.startsWith("dinheiro")) {
			} else if (path.startsWith("pericias") && ["value", "other"].includes(key)) {
			} else if (path.startsWith("attributes.p") && key == "value") {
			} else if (!path.startsWith("atributos") && key == "other") {
			} else if (["min", "max", "temp", "base", "name"].includes(key)) {
			} else {
				let parent = field.parent;
				let labels = [field.label];
				const skip = ["tracos", "attributes", "modificadores", "system"];
				while (parent) {
					if (skip.includes(parent.name)) break;
					if (parent.parent?.name == "modificadores") break;
					const label = parent.name == "element" ? record.label || record.name : parent.label || parent.name;
					labels.unshift(label);
					parent = parent.parent;
				}
				const label = labels.map((l) => _loc(l)).filterJoin(" ");
				paths[`system.${path}`] = label;
				choices.push({
					identifier: `system.${path}`,
					label: label
				});
			}
		}

		for (let [key, property] of Object.entries(character)) register(key, property);

		this.autocompleteContext = choices;
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

	/**
	 * Handle selecting an auto-complete option.
	 * @param {string} identifier        The selected entry's identifier.
	 * @param {string} label             The selected entry's label.
	 * @param {object} [options]
	 * @param {string} [options.prefix]  The originally matched prefix.
	 */
	#onAutocomplete(identifier, label, { prefix } = {}) {
		this.#autocompleteInput.value = identifier;
	}

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
