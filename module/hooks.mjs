import * as chat from "./chat.mjs";
import { migrateWorld } from "./data/migrations.mjs";
import * as macros from "./macros.mjs";

export default function () {



	/* -------------------------------------------------- */
	/*   Setup Hook                                       */
	/* -------------------------------------------------- */

	Hooks.once("setup", () => {
		prepareStatusesCompendium();
		// prepareUpgradesCompendium();
	});

	/**
	 * Once the entire VTT framework is initialized, check to see if we should perform a data migration
	 */
	Hooks.once("ready", async function () {
		// Wait to register hotbar drop hook on ready so that modules could register earlier if they want to
		Hooks.on("hotbarDrop", (bar, data, slot) => {
			if (["Item", "ActiveEffect"].includes(data.type)) {
				macros.createT20Macro(data, slot);
				return false;
			}
		});

		// prepareStatusesCompendium();
		// prepareUpgradesCompendium();
	});

	/**
	 * Create World Status Compendiums and populate with system effects;
	 */
	async function prepareStatusesCompendium() {
		let pack = game.packs.get("world.statuses");
		console.log(pack);
		if (!pack) {
			pack = await foundry.documents.collections.CompendiumCollection.createCompendium({
				label: "Condições",
				name: "statuses",
				type: "ActiveEffect",
				ownership: {
					ASSISTANT: "OWNER",
					PLAYER: "OBSERVER"
				}
			});
			// Copy Effects from system compendium;
			const effects = game.packs.get("tormenta20.efeitos");
			const docs = await effects.getDocuments();
			const create = [];
			for (const doc of docs) {
				if (doc.folder.id == "69zW3EVSgASXTmsp") {
					create.push(doc.toObject());
				}
			}
			await ActiveEffect.createDocuments(create, { keepId: true, pack: "world.statuses" });
			pack.configure({ locked: true });
		}
		CONFIG.statusEffects = {};
		const docs = await pack.getDocuments();
		docs.forEach(effect => {
			const identifier = effect.statuses.first();
			CONFIG.statusEffects[identifier] = {
				id: identifier,
				uuid: effect.uuid,
				name: effect.name,
				img: effect.img,
				link: effect.toAnchor().outerHTML,
				description: effect.description,
			}
		});

		CONFIG.controlIcons.defeated = CONFIG.statusEffects["inconsciente"].img;
		CONFIG.specialStatusEffects.BLIND = "cego";
		CONFIG.specialStatusEffects.DEFEATED = "morto";
		CONFIG.specialStatusEffects.INVISIBLE = "invisivel";
	}

	/**
	 * Create World Equipment Upgrade Compendium and populate with system effects;
	 */
	async function prepareUpgradesCompendium() {
		let pack = game.packs.get("world.upgrades");
		if (!pack) {
			pack = await foundry.documents.collections.CompendiumCollection.createCompendium({
				label: "Melhorias e Encantos",
				name: "upgrades",
				type: "ActiveEffect",
			});
		}
		CONFIG.upgradeEffects = [];
		const docs = await pack.getDocuments();
		docs.forEach(effect => {
			const { category, item } = effect.system.upgrade;
			CONFIG.upgradeEffects.category = {

			}
		});
	}

	Hooks.once("ready", migrateWorld);



	/* -------------------------------------------- */
	/*  Other Hooks                                 */
	/* -------------------------------------------- */

	// Render Sidebar
	Hooks.on("renderSettings", (app, html) => {
		const documentation = html.querySelector(".documentation.flexcol");
		const section = document.createElement("section");
		section.classList.add("flexcol");

		const divider = document.createElement("h4");
		divider.classList.add("divider");
		divider.textContent = "Visite";

		const jambo = document.createElement("a");
		jambo.classList.add("button");
		jambo.href = "https://jamboeditora.com.br/";
		jambo.rel = "nofollow noopener";
		jambo.target = "_blank";
		jambo.textContent = "Jambô Editora";

		documentation.insertAdjacentElement("afterend", section);
		section.appendChild(divider);
		section.appendChild(jambo);
	});

	/* Chat Hooks */
	Hooks.on("renderChatMessageHTML", tormenta20.documents.ChatMessageT20.renderChatMessageHTML);
	Hooks.on("renderChatMessageHTML_DEPRECATED", (app, html, data) => {
		chat.hideDieFlavor(app, html, data);
		chat.ApplyButtons(app, html, data);
		// Highlight critical success or failure die
		// chat.highlightCriticalSuccessFailure(app, html, data);

		// Optionally collapse the content
		const cardContent = html.querySelector(".card-content");
		const cardDamageDetails = html.querySelector(".card-damage-details");
		if (cardContent && (!cardContent.textContent.trim() || game.settings.get("tormenta20", "autoCollapseItemCards"))) {
			cardContent.style.display = "none";
		}

		if (cardDamageDetails) cardDamageDetails.style.display = "none";

		html
			.querySelectorAll(".item-name")
			.forEach((el) => el.addEventListener("click", chat._onChatCardToggleContent.bind(this)));
		html
			.querySelectorAll(".chat-message")
			.forEach((el) => el.addEventListener("click", chat._onChatCardToggleDamage.bind(this)));
		html
			.querySelectorAll(".chat-apply-ae")
			.forEach((el) => el.addEventListener("click", chat._onChatCardApplyEffect.bind(this)));
		html
			.querySelectorAll(".chat-place-template")
			.forEach((el) => el.addEventListener("click", chat._onChatPlaceTemplate.bind(this)));

		html
			.querySelectorAll(".apply-dmg")
			.forEach((el) => el.addEventListener("click", chat._onChatApplyDamage.bind(this)));
		html
			.querySelectorAll(".chat-spend-mana")
			.forEach((el) => el.addEventListener("click", chat._onChatSpendMana.bind(this)));
	});

	/* Debug hook */
	// Hooks.on("modifyTokenAttribute", async (attribute, value, isDelta, isBar) => {
	// console.log("Debug hook: Debug hook");
	// }) ;
	/* Measured Templates*/
	// Hooks.on("preCreateActiveEffect", (ActiveEffect, object, options, userId) => {

	// });

	Hooks.on("getSceneControlButtons", (controls) => {
		controls.tokens.tools.range = {
			active: game.settings.get("tormenta20", "drawRanges"),
			icon: "fa-regular fa-circle-dot",
			name: "range",
			order: 5,
			title: "Alcances",
			visible: true,
			toggle: true,
			onChange: (_event, active) => {
				canvas.tokens.controlled.forEach((t) => t.renderFlags.set({ refreshState: true }));
				game.settings.set("tormenta20", "drawRanges", active);
			}
		};
	});

	Hooks.on("closeCompendiumT20", (compendium, html) => {
		compendium.collection.apps = [new Compendium(compendium.collection)];
	});

	Hooks.on("renderDialogV2", (_dialog, html) => {
		if (html.classList.contains("dialog-item-create")) {
			const select = html.querySelector("select[name=type]");
			const option = select?.querySelector("option");
			if (select && option) {
				const localize = (str) => game.i18n.localize(`T20.Item.CreationDialog.Categories.${str}`);
				select.append(extractOptGroup(select, localize("Physical"), ["arma", "equipamento", "consumivel", "tesouro"]));
				select.append(extractOptGroup(select, localize("Character"), ["classe", "poder", "race"]));
				select.append(extractOptGroup(select, localize("Other")));
				option.selected = true;
			}
		}
	});
}

function extractOptGroup(select, label, types) {
	const options = select.querySelectorAll(":scope > option");
	const filtered = [...options.values()].filter((option) => !types || types.includes(option.value));
	const optgroup = document.createElement("optgroup");
	optgroup.label = label;
	for (const physicalElement of filtered) {
		optgroup.appendChild(physicalElement);
	}

	return optgroup;
}
