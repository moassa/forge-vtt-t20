/* -------------------------------------------- */
/*  Tormenta20                                  */
/* -------------------------------------------- */

/**
 * Search the actors that must have their effects refreshed and call the registry
 * @param {*} combat
 */
export async function endScene() {
	const combat = game.combat;
	if (combat) {
		const confirm = await foundry.applications.api.DialogV2.confirm({
			window: { icon: "fa-solid fa-xmark", title: "COMBAT.EndTitle" },
			content: `<p>${_loc("COMBAT.EndConfirmation")}</p>`,
			yes: { callback: () => true },
			modal: true
		});
		if (!confirm) return;
	}
	const expiredEffects = {};
	const context = {
		combat: combat,
		actors: combat
			? new Set(combat.combatants.map((i) => i.actor))
			: new Set(game.actors.filter((i) => i.type == "character")),
		expiredEffects: expiredEffects
	};

	const segmentedScene = game.settings.get("tormenta20", "segmentedScene");
	await ActiveEffect.registry.refresh("sceneEnd", context);
	if (segmentedScene.max) {
		segmentedScene.value = 0;
		game.settings.set("tormenta20", "segmentedScene", segmentedScene);
	}
	if (combat) await combat.delete(); // Ending a scene should end a combat too;
	const content = document.createElement("div");
	content.innerHTML = `<h3 class="scene-ended"><i class="fa-solid fa-clapperboard"></i> ${_loc("T20.sceneEnded")}</h3>`;
	const list = document.createElement("ul");
	for (const expired of Object.values(expiredEffects)) {
		const li = document.createElement("li");
		li.innerHTML = expired.join(", ").replace(",", "");
		list.append(li);
	}
	content.append(list);
	ChatMessage.create({
		content: content.outerHTML
	});
}

/* -------------------------------------------- */
/*  Config Pre-Localization (From 5e)           */
/* -------------------------------------------- */

/**
 * Storage for pre-localization configuration.
 * @type {object}
 * @private
 */
const _preLocalizationRegistrations = {};

/**
 * Mark the provided config key to be pre-localized during the init stage.
 * @param {string} configKey              Key within `CONFIG.T20` to localize.
 * @param {object} [options={}]
 * @param {string} [options.key]          If each entry in the config enum is an object,
 *                                        localize and sort using this property.
 * @param {string[]} [options.keys=[]]    Array of localization keys. First key listed will be used for sorting
 *                                        if multiple are provided.
 * @param {boolean} [options.sort=false]  Sort this config enum, using the key if set.
 */
export function preLocalize(configKey, { key, keys = [], sort = false } = {}) {
	if (key) keys.unshift(key);
	_preLocalizationRegistrations[configKey] = { keys, sort };
}

/* -------------------------------------------- */

/**
 * Execute previously defined pre-localization tasks on the provided config object.
 * @param {object} config  The `CONFIG.T20` object to localize and sort. *Will be mutated.*
 */
export function performPreLocalization(config) {
	for (const [key, settings] of Object.entries(_preLocalizationRegistrations)) {
		_localizeObject(config[key], settings.keys);
		if (settings.sort) config[key] = sortObjectEntries(config[key], settings.keys[0]);
	}
}

/* -------------------------------------------- */

/**
 * Sort the provided object by its values or by an inner sortKey.
 * @param {object} obj                 The object to sort.
 * @param {string|Function} [sortKey]  An inner key upon which to sort or sorting function.
 * @returns {object}                   A copy of the original object that has been sorted.
 */
export function sortObjectEntries(obj, sortKey) {
	let sorted = Object.entries(obj);
	const sort = (lhs, rhs) =>
		foundry.utils.getType(lhs) === "string" ? lhs.localeCompare(rhs, game.i18n.lang) : lhs - rhs;
	if (foundry.utils.getType(sortKey) === "function") sorted = sorted.sort((lhs, rhs) => sortKey(lhs[1], rhs[1]));
	else if (sortKey) sorted = sorted.sort((lhs, rhs) => sort(lhs[1][sortKey], rhs[1][sortKey]));
	else sorted = sorted.sort((lhs, rhs) => sort(lhs[1], rhs[1]));
	return Object.fromEntries(sorted);
}

/* -------------------------------------------- */

/**
 * Localize the values of a configuration object by translating them in-place.
 * @param {object} obj       The configuration object to localize.
 * @param {string[]} [keys]  List of inner keys that should be localized if this is an object.
 * @private
 */
function _localizeObject(obj, keys) {
	for (const [k, v] of Object.entries(obj)) {
		const type = typeof v;
		if (type === "string") {
			obj[k] = game.i18n.localize(v);
			continue;
		}

		if (type !== "object") {
			console.error(
				new Error(`Pre-localized configuration values must be a string or object, ${type} found for "${k}" instead.`)
			);
			continue;
		}
		if (!keys?.length) {
			console.error(new Error("Localization keys must be provided for pre-localizing when target is an object."));
			continue;
		}

		for (const key of keys) {
			if (!v[key]) continue;
			v[key] = game.i18n.localize(v[key]);
		}
	}
}

/* -------------------------------------------- */
/*  Statblock Importer                          */
/* -------------------------------------------- */

/**
 * Tira o plural de palavras em Português.
 * Atenção para palavras terminadas em "us", que geralmente não estão no plural (deus, virus, ônibus, bônus).
 * @param {string} palavra
 * @param {boolean} pulaUS	Determina se a "us" deve ser considerado plural ou não.
 * @returns {string}
 */
export function despluralizar(palavra, pulaUS = true) {
	if (palavra.endsWith("ões") || palavra.endsWith("ães")) {
		return `${palavra.slice(0, -3)}ão`;
	} else if (palavra.endsWith("is") && palavra.length > 3) {
		return `${palavra.slice(0, -2)}l`;
	} else if (palavra.endsWith("res")) {
		return palavra.slice(0, -2);
	} else if (palavra.endsWith("ses")) {
		return palavra.slice(0, -2);
	} else if (palavra.endsWith("s") && (!pulaUS || !palavra.endsWith("us"))) {
		return palavra.slice(0, -1);
	}
	return palavra;
}

export function wordToNumber(str) {
	return (
		{
			zero: 0,
			um: 1,
			uma: 1,
			dois: 2,
			duas: 2,
			três: 3,
			quatro: 4,
			cinco: 5,
			seis: 6,
			sete: 7,
			oito: 8,
			nove: 9,
			dez: 10
		}[str.toLowerCase()] ?? 1
	);
}

/* -------------------------------------------- */
/*  Statblock Importer                          */
/* -------------------------------------------- */

/**
 * Convert strings formatadas como "1/4" em valores numéricos.
 * @param {string|number} fraction
 * @returns {number}
 */
export function parseFraction(fraction) {
	let [num, denom] = String(fraction).split("/").map(Number);
	denom = isNaN(denom) || denom === 0 ? 1 : denom;
	return num / denom;
}
