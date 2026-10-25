import * as chat from "./chat.mjs";
import { migrateWorld } from "./data/migrations.mjs";
import * as macros from "./macros.mjs";

export default function () {
	/* -------------------------------------------------- */
	/*   Setup Hook                                       */
	/* -------------------------------------------------- */

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

		prepareStatusesCompendium();
		prepareUpgradesCompendium();
		if (!game.user.isActiveGM) return;

		/**
		 * Fix OnUse Effects with duplicated effect ids
		 */
		for (let actor of game.actors) {
			const uniqueIds = new Set();
			for (let item of actor.items) {
				for (let effect of item.effects) {
					if (!effect.system.onuse) continue;
					if (!uniqueIds.has(effect.id)) uniqueIds.add(effect.id);
					else {
						await effect.clone({}, { save: true });
						await effect.delete();
					}
				}
			}
		}

		/** */
	});

	/**
	 * Create World Status Compendiums and populate with system effects;
	 */
	async function prepareStatusesCompendium() {
		let pack = game.packs.get("world.statuses");

		if (!pack && game.user.isActiveGM) {
			pack = await foundry.documents.collections.CompendiumCollection.createCompendium({
				label: "Condições",
				name: "statuses",
				type: "ActiveEffect",
				ownership: {
					ASSISTANT: "OWNER",
					PLAYER: "OBSERVER"
				}
			});
		}
		if (!pack.index.size && game.user.isActiveGM) {
			await pack.configure({ locked: false });
			// Copy Effects from system compendium;
			const effects = game.packs.get("tormenta20.efeitos");
			const docs = await effects.getDocuments();
			const create = [];
			for (const doc of docs) {
				if (doc.folder.id == "STATUSEFFECTS000") {
					create.push(doc.toObject());
				}
			}
			await ActiveEffect.createDocuments(create, { keepId: true, pack: "world.statuses" });
		}

		// Prepare CONFIG data
		const TextEditor = foundry.applications.ux.TextEditor.implementation;
		CONFIG.statusEffects = {};
		const docs = await pack.getDocuments();
		for (const effect of docs) {
			const identifier = effect.statuses.first();
			CONFIG.statusEffects[identifier] = {
				id: identifier,
				uuid: effect.uuid,
				name: effect.name,
				img: effect.img,
				link: effect.toAnchor().outerHTML,
				category: effect.system.status?.category,
				description: await TextEditor.enrichHTML(effect.description),
				// SOME PLACES RETRIEVED EFFECT DATA FROM T20.conditions SYNCHRONOUSLY
				// CONVERTING THEM TO ASYNC WILL REQUIRE MORE WORK
				_source: effect.clone({}, { keepId: false }).toObject()
			};
		}

		CONFIG.controlIcons.defeated = CONFIG.statusEffects.inconsciente.img;
		CONFIG.specialStatusEffects.BLIND = "cego";
		CONFIG.specialStatusEffects.DEFEATED = "morto";
		CONFIG.specialStatusEffects.INVISIBLE = "invisivel";

		if (game.user.isActiveGM) await pack.configure({ locked: true });
	}

	/**
	 * Create World Equipment Upgrade Compendium and populate with system effects;
	 */
	async function prepareUpgradesCompendium() {
		const collectionName = "world.item-upgrades";
		let pack = game.packs.get(collectionName);
		if (!pack && game.user.isActiveGM) {
			pack = await foundry.documents.collections.CompendiumCollection.createCompendium({
				label: "Melhorias e Encantos",
				name: "item-upgrades",
				type: "ActiveEffect",
				ownership: {
					ASSISTANT: "OWNER",
					PLAYER: "OBSERVER"
				}
			});
		}
		if (!pack.index.size && game.user.isActiveGM) {
			await pack.configure({ locked: false });
			const effects = game.packs.get("tormenta20.efeitos");
			const docs = await effects.getDocuments();

			const folders = effects.folders
				.filter((f) => f.ancestors.some((f) => f._id == "p3kj1VMampfit35C"))
				.map((f) => f.toObject());
			await Folder.implementation.createDocuments(folders, {
				pack: collectionName,
				keepId: true
			});

			const create = docs
				.filter((d) => d.folder?.ancestors.some((f) => f._id == "p3kj1VMampfit35C"))
				.map((d) => d.toObject());
			await ActiveEffect.createDocuments(create, {
				pack: collectionName,
				keepId: true
			});
		}

		// Prepare CONFIG data
		CONFIG.upgradeEffects = [];
		const TextEditor = foundry.applications.ux.TextEditor.implementation;
		const docs = await pack.getDocuments();
		for (const effect of docs) {
			CONFIG.upgradeEffects.push({
				identifier: effect.system.identifier,
				uuid: effect.uuid,
				name: effect.name,
				img: effect.img,
				link: effect.toAnchor().outerHTML,
				type: effect.system.upgrade?.type,
				group: effect.folder.name,
				itemType: effect.system.upgrade?.itemType,
				description: await TextEditor.enrichHTML(effect.description)
			});
		}
		CONFIG.upgradeEffects.sort((a, b) => a.name.localeCompare(b.name));

		if (game.user.isActiveGM) await pack.configure({ locked: true });
	}

	Hooks.once("ready", migrateWorld);

	/* -------------------------------------------- */
	/*  Other Hooks                                 */
	/* -------------------------------------------- */

	// Manage Auras
	Hooks.on("canvasReady", (_) => {
		if (game.user.isActiveGM) canvas.regions.manageAuras();
	});

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
