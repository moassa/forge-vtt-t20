import * as chat from "../chat.mjs";

/**
 *  Extends the chat message adding system related rendering and handlers
 */
export default class ChatMessageT20 extends ChatMessage {
	/** @inheritdoc */
	async renderHTML({ canDelete, canClose = false, ...rest } = {}) {
		const html = await super.renderHTML({ canDelete, canClose, ...rest });
		if (this.getFlag("tormenta20", "sustain")) this._renderSustainMessage(html);
		else {
			this._highlightCriticalSuccessFailure(html);
			this._hideDC(html);
		}
		return html;
	}

	/* --------------------------------------------- */

	/**
	 *
	 * @param {*} html
	 */
	_renderSustainMessage(html) {
		html.querySelector(".message-content").classList.add("tormenta20", "sustain", "flexcol");
		if (this.content) return;
		const button = document.createElement("button");
		button.type = "button";
		button.innerText = _loc("T20.sustainEffects");
		button.dataset.action = "sustainEffects";

		html.querySelector(".message-content")?.append(button);

		// Sustain Effects
		button.addEventListener("click", ChatMessageT20._onSustainEffect.bind(this));
	}

	/* --------------------------------------------- */

	_highlightCriticalSuccessFailure(html) {
		if (!this.isContentVisible || !this.rolls.length) return;
		// Highlight rolls where the first part is a d20 roll
		for (let [index, d20Roll] of this.rolls.entries()) {
			const d0 = d20Roll.dice[0];
			if (d0?.faces !== 20 || d0?.values.length !== 1) continue;

			// d20Roll = CONFIG.Dice.rolls.RollT20.fromRoll(d20Roll);
			const d = d20Roll.dice[0];

			// Ensure it is an un-modified d20 roll
			const isD20 = d.faces === 20 && d.values.length === 1;
			if (!isD20) return;
			const isModifiedRoll = "success" in d.results[0] || d.options.marginSuccess || d.options.marginFailure;
			if (isModifiedRoll) return;

			// Highlight successes and failures
			const total = html.querySelectorAll(".dice-total")[index];
			if (!total) continue;

			const isAttack = d20Roll.options.type === "attack";

			if (isAttack) {
				const critical = d.options.critical || 20;
				const fumble = d.options.fumble || 1;
				if (d.total >= critical) total.classList.add("success", "critical");
				else if (d.total <= fumble) total.classList.add("failure", "fumble");
				else if (d.options.target) {
					if (d.total >= d.options.target) total.classList.add("success");
					else total.classList.add("failure");
				}
			}
		}
	}

	/* --------------------------------------------- */

	_hideDC(html) {
		if (game.settings.get("tormenta20", "showFoeDc")) return;
		if (game.user.isGM) return;
		const actor = this.speakerActor;
		if (!actor) return;
		if (actor.type == "character") return;
		const header = html.querySelector(".card-item-header");
		if (!header) return;
		let content = header.innerHTML.replace(/CD \d+/i, "CD ??");
		header.innerHTML = content;
	}

	/* --------------------------------------------- */
	/*  Active Listeners                             */
	/* --------------------------------------------- */

	/**
	 * Method to add eventListeners to message buttons
	 * @todo Refactor ChatButtons, maybe add them to a mixin that implements them into ChatLog and ChatPopout classes;
	 * @param {*} app
	 * @param {*} html
	 * @param {*} data
	 */
	static renderChatMessageHTML(app, html, data) {
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

		html.querySelectorAll(".re-roll").forEach((el) => el.addEventListener("click", chat._onChatReRoll.bind(this)));
		html
			.querySelectorAll(".apply-dmg")
			.forEach((el) => el.addEventListener("click", chat._onChatApplyDamage.bind(this)));
		html
			.querySelectorAll(".chat-spend-mana")
			.forEach((el) => el.addEventListener("click", chat._onChatSpendMana.bind(this)));
	}

	/* --------------------------------------------- */

	/**
	 * Prompt the user to select wich effects they want to sustain
	 * @param {*} event
	 * @param {*} target
	 * @this {ChatMessageT20}
	 */
	static async _onSustainEffect(event, target) {
		target ??= event.target;
		const { createFormGroup, createMultiSelectInput } = foundry.applications.fields;
		const { messageId } = target.closest("li").dataset;
		const message = game.messages.get(messageId);
		const actor = message.speakerActor;
		const effects = actor.effects.filter((e) => e.isSustained);
		const choices = effects.map((e) => ({ value: e.id, label: e.name, img: e.img }));
		// .map(e => `<div class="flexrow"><img src="${e.img}" width="32px"><label>${e.label} <input type="checkbox" name="sustain" value=${e.value}></label></div>`).join("");

		const { sustain } = await foundry.applications.api.Dialog.input({
			title: "Sustentar Effeitos",
			content: createFormGroup({
				label: "Selecionar Efeitos",
				stacked: true,
				input: createMultiSelectInput({
					name: "sustain",
					options: choices,
					type: "checkboxes"
				})
			}).outerHTML
		});
		if (!sustain) return;
		const content = document.createElement("ul");
		const toUpdate = [];
		const toDelete = [];
		for (const effect of effects) {
			const li = foundry.utils.parseHTML(`<li class="flexrow"><img src="${effect.img}">${effect.name}</li>`);
			content.append(li);
			if (sustain.includes(effect._id)) {
				li.classList.add("active");
				toUpdate.push({ _id: effect._id, "duration.value": 1 });
			} else {
				toDelete.push(effect._id);
			}
		}
		await message.update({ content: content.outerHTML });
		await actor.deleteEmbeddedDocuments("ActiveEffect", toDelete);
		await actor.updateEmbeddedDocuments("ActiveEffect", toUpdate);
		if (toUpdate.length) await actor.spendMana(toUpdate.length, 0, false);
	}

	/* --------------------------------------------- */

	/* --------------------------------------------- */
}
