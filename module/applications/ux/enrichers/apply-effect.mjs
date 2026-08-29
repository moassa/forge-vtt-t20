






export const id = "applyEffect";
export const pattern = new RegExp("@STATUS\\[(?<identifier>\\w+)\\]", "ig");

export async function enricher(match, options) {
	const { identifier } = match.groups;
	const status = CONFIG.statusEffects[identifier];
	if (!status) return;
	// const effect = await foundry.utils.fromUuid(status.uuid);
	// if (!effect) return;
	console.log(match, options);
	const apply = foundry.utils.parseHTML(status.link);
	const open = document.createElement("a");
	open.classList.add("apply-effect", "icon", "fa-solid", "fa-users-viewfinder");
	open.dataset.identifier = identifier;
	const container = document.createElement("span");
	container.append(apply, open);
	return container;
}

export async function onRender(element) {
	const apply = element.querySelector(".apply-effect");
	apply.addEventListener("click", onClickApply);
}


async function onClickApply() {
	console.log("onClickApply");
	const tokens = canvas?.tokens?.controlled ?? [];
	if (!tokens.length) {
		return ui.notifications.error("T20.SelectToken");
	}
	const uuid = CONFIG.statusEffects[this.dataset.identifier].uuid;
	const effect = await foundry.utils.fromUuid(uuid);

	const operations = [];
	for (const token of tokens) {
		if (!token.actor) continue;
		const source = effect.toObject();
		operations.push({
			action: "create",
			parent: token.actor,
			documentName: "ActiveEffect",
			data: [source],
			keepId: false,
		})
	}

	await foundry.documents.modifyBatch(operations);
}


