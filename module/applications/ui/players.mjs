/**
 * An extension of the core Players display that adds controls for scene end and exploration.
 */
export default class PlayersT20 extends foundry.applications.ui.Players {
	static DEFAULT_OPTIONS = {
		actions: {
			sceneEnd: { handler: PlayersT20.onSceneEnd, buttons: [0] },
			sceneSegment: { handler: PlayersT20.onSceneSegment, buttons: [0, 2] }
		}
	};

	/** @inheritdoc */
	async _onRender(context, options) {
		await super._onRender(context, options);
		this.#createSceneControls();
	}

	#createSceneControls() {
		const sceneControls = document.createElement("diav");
		sceneControls.classList.add("flexrow");

		if (game.user.isActiveGM) {
			const button = document.createElement("button");
			button.type = "button";
			button.classList.add("inline-control", "icon", "fa-solid", "fa-clapperboard");
			button.dataset.action = "sceneEnd";
			button.dataset.tooltipText = _loc("T20.endScene");
			sceneControls.append(button);
		}
		const segmentedScene = game.settings.get("tormenta20", "segmentedScene");
		if (segmentedScene.max) {
			const segments = document.createElement("a");
			segments.dataset.tooltipText = _loc("T20.sceneSegments", segmentedScene);
			if (game.user.isActiveGM) {
				segments.dataset.action = "sceneSegment";
			}
			for (let index = 1; index <= segmentedScene.max; index++) {
				const icon = document.createElement("i");
				if (index > segmentedScene.value) {
					icon.classList.add("fa-regular", "fa-circle");
				} else icon.classList.add("fa-regular", "fa-circle-dot");
				segments.append(icon);
			}
			sceneControls.append(segments);
		}

		this.element.querySelector("#players-active").prepend(sceneControls);
	}

	static async onSceneEnd(event, target) {
		if (!game.user.isActiveGM) return;
		await tormenta20.utils.endScene();
	}

	static async onSceneSegment(event, target) {
		if (!game.user.isActiveGM) return;
		const segment = game.settings.get("tormenta20", "segmentedScene");
		const vary = event.type == "click" ? 1 : -1;
		segment.value = Math.clamp(0, segment.value + vary, segment.max);
		game.settings.set("tormenta20", "segmentedScene", segment);
	}
}
