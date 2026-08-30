import { applyOnUseEffects } from "./ability-use.mjs";

const TextEditor = foundry.applications.ux.TextEditor.implementation;

/**
 * A specialized Dialog subclass for ability usage
 * @type {Dialog}
 */
export default class AbilityUseDialog extends Dialog {
	constructor(item, dialogData = {}, options = {}) {
		super(dialogData, options);
		this.options.classes.push(...["tormenta20", "ability-use-form"]);

		/**
		 * Store a reference to the Item document being used
		 * @type {ItemT20}
		 */
		this.item = item;
	}

	/** @override */
	activateListeners(html) {
		super.activateListeners(html);

		// Add controles para números
		html.find(".numCtrl").click(this.numberControl.bind(this));
		html.find(".item-cost input").on("click", () => {
			this._onInputChange(html);
		});
	}

	numberControl(ev) {
		ev.preventDefault();
		let target;
		if (ev.target.tagName == "I") {
			target = $(ev.target).parent(".numCtrl");
		} else {
			target = ev.target;
		}
		let campo = $(target).siblings(".numInp")[0];
		if ($(target).val() === "+") {
			campo.value = parseInt(campo.value) + parseInt($(campo).prop("step"));
		} else if ($(target).val() === "-" && campo.value > 0) {
			campo.value = parseInt(campo.value) - parseInt($(campo).prop("step"));
		}

		this._onInputChange(this.element);
	}

	_onInputChange(html) {
		html = html[0];
		const effects = html.querySelectorAll(".aprimoramentos-list li input:not([type=hidden])");
		let totalCost = 0;
		let hasCost = false;
		for (const input of effects) {
			const cost = input.closest("div").querySelector("input[type=hidden]");
			if (!cost) continue;
			if (input.type == "checkbox") {
				if (!input.checked) continue;
				if (Number(cost.value)) {
					totalCost += Number(cost.value);
					hasCost = true;
				}
			} else {
				if (input.value == 0) continue;
				if (Number(cost.value)) {
					totalCost += Number(cost.value) * input.value;
					hasCost = true;
				}
			}
		}
		const inputCost = html.querySelector(".total-cost .cost");
		const { initialCost } = inputCost.dataset;
		totalCost += Number(initialCost);
		hasCost = Number(initialCost) > 0;
		const bonusCost = html.querySelector("input[name=ajustecusto]");
		if (bonusCost) {
			totalCost += Number(bonusCost.value);
		}

		inputCost.value = hasCost ? Math.max(totalCost, 1) : 0;
	}

	/* -------------------------------------------- */
	/*  Rendering                                   */
	/* -------------------------------------------- */

	/**
	 * A constructor function which displays the Spell Cast Dialog app for a given Actor and Item.
	 * Returns a Promise which resolves to the dialog FormData once the workflow has been completed.
	 * @param {ItemT20} item
	 * @return {Promise}
	 */
	static async create(item) {
		if (!item.isOwned) ui.notifications.error(game.i18n.localize("T20.ActionWarningItemNotOwned"));
		// Prepare data
		const itemData = item.system;
		const pmCost = itemData?.ativacao.custo > 0;
		let aprimoramentos = item.applicableOnUseEffects;

		if (!["atributo", "pericia"].includes(item.type) && !itemData.rolls?.length && !aprimoramentos.length) {
			return applyOnUseEffects(item, {});
		}
		let initialCost = 0;
		initialCost += pmCost ? Number(itemData?.ativacao.custo) : 0;
		for (const ef of aprimoramentos) {
			await this.prepareDescription(ef);
			if (ef.disabled) continue;
			const cost = ef.system.abilityUse.custo;
			initialCost += Number.isNumeric(cost) ? Number(cost) : 0;
		}

		// TODO Check if Actor have sufficient MP
		// TODO Include consume os Ammunition, Itens, Money?
		// TODO Include measured templates placement
		// Prepare dialog form data
		const data = {
			item: itemData,
			title: game.i18n.format("T20.AbilityUseHint", item),
			note: "",
			custo: itemData?.custo ?? null,
			initialCost,
			formula:
				["atributo", "pericia"].includes(item.type)
				|| !!itemData.rolls?.find((r) => ["ataque", "formula"].includes(r.type)),
			formuladano: !!itemData.rolls?.find((r) => r.type === "dano"),
			itype: item.type,
			consumeMP: pmCost,
			aprimoramentos: aprimoramentos,
			messageMode: game.settings.get("core", "messageMode"),
			// rollModes: CONFIG.Dice.rollModes,
			messageModes: CONFIG.ChatMessage.modes,
			// rollKeeping: event?.altKey ? "khd20" : event?.ctrlKey ? "kld20" : "",
			rollKeeping: "",
			rollKeep: { khd20: "Melhor de 2d20", kld20: "Pior de 2d20" },
			errors: []
		};

		// Render the ability usage template
		const html = await foundry.applications.handlebars.renderTemplate(
			"systems/tormenta20/templates/apps/ability-use.hbs",
			data
		);

		// Create the Dialog and return data as a Promise
		const icon = item.type === "magia" ? "fa-hand-sparkles" : "fa-hand-fist";
		const label = item.type === "magia"
			? game.i18n.localize("T20.AbilityUseCast")
			: game.i18n.localize("T20.AbilityUseUse");

		return await new Promise((resolve) => {
			const dlg = new this(item, {
				title: game.i18n.format("T20.AbilityUseHint", {
					name: item.name,
					type: item.type
				}),
				content: html,
				buttons: {
					use: {
						icon: `<i class="fas ${icon}"></i>`,
						label: label,
						callback: async (html) => {
							const fd = new foundry.applications.ux.FormDataExtended(html[0].querySelector("form"));
							let op = applyOnUseEffects(item, fd.object);
							resolve(foundry.utils.mergeObject(fd.object, op));
						}
					}
				},
				default: "use",
				close: () => resolve(null)
			});
			if (item.type === "magia" && (item.actor.getFlag("tormenta20", "createPotion") || game.user.isGM)) {
				dlg.data.buttons.brew = {
					icon: '<i class="fas fa-flask"></i>',
					label: game.i18n.localize("T20.BrewPotion"),
					callback: async (html) => {
						const fd = new foundry.applications.ux.FormDataExtended(html[0].querySelector("form"));
						fd.object.brew = true;
						let op = applyOnUseEffects(item, fd.object);
						resolve(foundry.utils.mergeObject(fd.object, op));
					}
				};
			}
			dlg.options.width = 600;
			dlg.position.width = 600;
			dlg.render(true);
		});
	}

	static async prepareDescription(effect) {
		const label = document.createElement("label");
		label.innerText = `${effect.name}:`
		if (!effect.description) {
			const description = document.createElement("p");
			description.prepend(label);
			effect.descriptionEnriched = description.outerHTML;
		} else {
			let description = await TextEditor.enrichHTML(effect.description);
			description = foundry.utils.parseHTML(description);
			description.prepend(label, " ");
			effect.descriptionEnriched = description.outerHTML;
		}
	}

	filterEffects() {
		function filterAE(ae, keys = [], tags = []) {
			const name = item.name;
			let items = ae.getFlag("tormenta20", "items");
			items = items ? items.split(";").map((i) => i.trim()) : [];
			if (!foundry.utils.isEmpty(items) && !items.includes(name)) return false;
			for (let k of keys) {
				if (!ae.flags?.tormenta20 || !ae.flags?.tormenta20[k]) return false;
			}
			return true;
		}

		const relate = {
			atributo: "ability",
			pericia: "skill",
			arma: "attack",
			magia: "spell",
			poder: "power",
			consumivel: "consumable",
			equipamento: "equipment"
		};
		let utype = "";
		switch (item.type) {
			case "atributo":
			case "pericia":
				utype = relate[item.type];
				aprimoramentos = [...item.actor.effects.filter((ae) => filterAE(ae, ["onuse", utype]))];
				break;
			case "arma":
			case "magia":
			case "poder":
			case "equipamento":
			case "consumivel":
				utype = relate[item.type];
				aprimoramentos = [
					...item.effects.filter((ae) => filterAE(ae, ["onuse", "self"])),
					...item.actor.effects.filter((ae) => filterAE(ae, ["onuse", utype]))
				];
				break;
		}
	}
}


