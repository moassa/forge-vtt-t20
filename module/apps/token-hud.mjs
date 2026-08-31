export default class TokenHUDT20 extends foundry.applications.hud.TokenHUD {
	#STATUS_TEMPLATE = "systems/tormenta20/templates/apps/hud/effects-palette.hbs";

	/** @inheritdoc */
	async _onRender(context, options) {
		await super._onRender(context, options);

		const effectPalette = this.element.querySelector('div[data-palette="effects"]');
		const paletteContents = await foundry.applications.handlebars.renderTemplate(this.#STATUS_TEMPLATE, context);
		effectPalette.classList.add("flexrow");
		effectPalette.innerHTML = paletteContents;
	}
}
