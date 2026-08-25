import DragAndDropMixin from "./dragndrop-mixin.mjs";

const { HandlebarsApplicationMixin } = foundry.applications.api;
/**
 * Extends Base Application implementing common sheet interations;
 */
export default function Tormenta20ApplicationMixin({ Base, dragndrop = false, mixins = [] }) {
	// Extend the base class to avoid muatiting it
	const BaseClass = class extends Base {
		static DEFAULT_OPTIONS = {}
	};
	const hasHAM = Base.hasOwnProperty("PARTS");

	const mixedClass = hasHAM
		? dragndrop
			? class extends DragAndDropMixin(BaseClass) { }
			: BaseClass
		: dragndrop
			? class extends DragAndDropMixin(HandlebarsApplicationMixin(BaseClass)) { }
			: class extends HandlebarsApplicationMixin(BaseClass) { };



	// Then mix with any other template
	for (const mixin of mixins) {
		const staticProperties = Object.getOwnPropertyDescriptors(mixin);
		const instanceProperties = Object.getOwnPropertyDescriptors(mixin.prototype);
		for (const [key, descriptor] of Object.entries(staticProperties)) {
			// skip not registered
			if (!mixin.allowed.includes(key)) continue;
			if (key == "DEFAULT_OPTIONS") {
				foundry.utils.mergeObject(mixedClass.DEFAULT_OPTIONS, descriptor.value);
			} else Object.defineProperty(mixedClass, key, descriptor);
		}

		for (const [key, descriptor] of Object.entries(instanceProperties)) {
			// skip constructor
			if (["constructor"].includes(key)) continue;
			// skip not registered
			if (!mixin.allowed.includes(key)) continue;
			Object.defineProperty(mixedClass.prototype, key, descriptor);
		}
	}

	// return class ApplicationT20 extends HandlebarsApplicationMixin(mixedClass) { }
	return class ApplicationT20 extends mixedClass {

		static DEFAULT_OPTIONS = {
			classes: ["tormenta20-v2"],
			actions: {
				logToConsole: { handler: this.logToConsole, buttons: [0] },
			}
		}

		/* -------------------------------------------- */
		/* Getters                                      */
		/* -------------------------------------------- */

		/* -------------------------------------------- */
		/* Rendering                                    */
		/* -------------------------------------------- */

		/** @inheritdoc (@see foundry.applications.api.application )*/
		async _onFirstRender(context, options) {
			await super._onFirstRender(context, options);
			this._createContextMenus();
		}

		/* -------------------------------------------- */

		/**
		 * Register context menu entries and fire hooks.
		 * @protected
		 */
		_createContextMenus() { }

		/* -------------------------------------------- */

		/** @inheritDoc */
		async _onRender(context, options) {
			await super._onRender(context, options);
			// Disable effect overriden inputs
			// This can move to ActorBase | ItemBase
			if (this.document.overrides) {
				const overrides = foundry.utils.flattenObject(this.document.overrides);
				for (const fieldPath of Object.keys(overrides)) {
					const input = this.element.querySelector(`[name="${fieldPath}"]`);
					if (input) input.disabled = true;
				}
			}
		}

		/* -------------------------------------------- */

		/** @inheritDoc */
		async _renderFrame(options) {
			const frame = await super._renderFrame(options);

			// Add console.log button
			const logLabel = game.i18n.localize("CONSOLE.LOG");
			const logBtn = `<button type="button" class="header-control fa-solid fa-terminal icon" data-action="logToConsole" data-tooltip="${logLabel}" aria-label="${logLabel}"></button>`;
			this.window.close.insertAdjacentHTML("beforebegin", logBtn);

			return frame;
		}

		/* -------------------------------------------- */

		/** @inheritDoc */
		async _prepareContext(options) {
			const context = await super._prepareContext(options);
			context.TORMENTA20 = T20;
			context.selectOptions = {};
			if (this.document) {
				context.system = this.document.system;
				context.schema = this.document.system.schema;
			}
			return context;
		}

		/* -------------------------------------------- */
		/* Actions Handlers                             */
		/* -------------------------------------------- */

		static async logToConsole(event, target) {
			console.group("LOG DOCUMENT AND SHEET");
			console.log(this.document);
			console.log(this);
			console.groupEnd();
		}

		/* -------------------------------------------- */
		/* Methods                                      */
		/* -------------------------------------------- */
	}
}