

/**
 * A custom combat tracker that supports Draw Steel's initiative system.
 */


/**
 * An extension of the base CombatTracker class to provide some Tormenta20-specific functionality.
 * @extends {CombatTracker}
 */
export default class CombatTrackerT20 extends foundry.applications.sidebar.tabs.CombatTracker {

	/** @inheritdoc */
	static DEFAULT_OPTIONS = {
		actions: {
			endScene: CombatTrackerT20.#endScene,
		},
	};

	/* -------------------------------------------- */
	/*  Rendering                                   */
	/* -------------------------------------------- */

	/** @inheritDoc */
	async _onRender(context, options) {
		await super._onRender(context, options);

		if (game.user.isGM) {
			const button = document.createElement("button");
			button.type = "button";
			button.dataset.action = "endScene";
			button.innerHTML = `<i class="fa-solid fa-clapperboard"></i> ${_loc("T20.endScene")}`;
			button.classList.add("end-scene");
			this.element.querySelector(".combat-controls").classList.add("flexrow");
			this.element.querySelector(".combat-controls").append(button);
		}
	}

	/* -------------------------------------------- */
	/*  Event Listeners & Handlers                  */
	/* -------------------------------------------- */

	static async #endScene(event, target) {
		if (!game.user.isGM) return;
		await tormenta20.utils.endScene();
	}
}
