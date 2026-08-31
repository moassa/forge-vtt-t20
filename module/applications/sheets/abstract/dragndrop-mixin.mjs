const { DragDrop, TextEditor } = foundry.applications.ux;

/**
 * Extends base DocumentSheet while implementing basic Drag And Drop;
 * @extends {DocumentSheet}
 */
export default function DragAndDropMixin(Base) {
	return class DragAndDropSheetV2 extends Base {
		/** @inheritDoc */
		async _onRender(context, options) {
			await super._onRender(context, options);
			new DragDrop.implementation({
				dragSelector: ".draggable",
				permissions: {
					dragstart: this._canDragStart.bind(this),
					drop: this._canDragDrop.bind(this)
				},
				callbacks: {
					dragstart: this._onDragStart.bind(this),
					dragover: this._onDragOver.bind(this),
					drop: this._onDrop.bind(this)
				}
			}).bind(this.element);
		}

		/* -------------------------------------------- */
		/*  Drag and Drop                               */
		/* -------------------------------------------- */

		/**
		 * Define whether a user is able to begin a dragstart workflow for a given drag selector.
		 * @param {string} selector       The candidate HTML selector for dragging
		 * @returns {boolean}             Can the current user drag this selector?
		 * @protected
		 */
		_canDragStart(selector) {
			return this.isEditable;
		}

		/* -------------------------------------------- */

		/**
		 * Define whether a user is able to conclude a drag-and-drop workflow for a given drop selector.
		 * @param {string} selector       The candidate HTML selector for the drop target
		 * @returns {boolean}             Can the current user drop on this selector?
		 * @protected
		 */
		_canDragDrop(selector) {
			return this.isEditable;
		}

		/* -------------------------------------------- */

		/**
		 * An event that occurs when a drag workflow begins for a draggable Item or ActiveEffect on the sheet.
		 * @param {DragEvent} event       The initiating drag start event
		 * @returns {Promise<void>}
		 * @protected
		 */
		async _onDragStart(event) {
			const target = event.currentTarget;
			if ("link" in event.target.dataset) return;

			// If a Document reference is being dragged, assume it is either an Item or ActiveEffect
			const item = this.document;
			const { effectId, itemId } = target.dataset;
			const document = item.effects?.get(effectId);

			// Set data transfer
			const dragData = document?.toDragData();
			if (dragData) event.dataTransfer.setData("text/plain", JSON.stringify(dragData));
		}

		/* -------------------------------------------- */

		/**
		 * An event that occurs when a drag workflow moves over a drop target.
		 * @param {DragEvent} event
		 * @protected
		 */
		_onDragOver(event) {}

		/* -------------------------------------------- */

		/**
		 * An event that occurs when data is dropped into a drop target.
		 * @param {DragEvent} event
		 * @returns {Promise<void>}
		 * @protected
		 */
		async _onDrop(event) {
			const data = TextEditor.implementation.getDragEventData(event);
			const item = this.item;
			const allowed = Hooks.call("dropItemSheetData", item, this, data);
			if (allowed === false) return;

			// Dropped Documents
			const documentClass = foundry.utils.getDocumentClass(data.type);
			if (documentClass) {
				const document = await documentClass.fromDropData(data);
				await this._onDropDocument(event, document);
			}
		}

		/* -------------------------------------------- */

		/**
		 * Handle a dropped document on the Item Sheet
		 * @template {Document} TDocument
		 * @param {DragEvent} event         The initiating drop event
		 * @param {TDocument} document       The resolved Document class
		 * @returns {Promise<TDocument|null>} A Document of the same type as the dropped one in case of a successful result,
		 *                                    or null in case of failure or no action being taken
		 * @protected
		 */
		async _onDropDocument(event, document) {
			switch (document.documentName) {
				case "ActiveEffect":
					return (await this._onDropActiveEffect(event, document)) ?? null;
				case "Actor":
					return (await this._onDropActor(event, document)) ?? null;
				case "Item":
					return (await this._onDropItem(event, document)) ?? null;
				case "Folder":
					return (await this._onDropFolder(event, document)) ?? null;
				default:
					return null;
			}
		}

		/* -------------------------------------------- */

		/**
		 * Handle a dropped Active Effect on the Item Sheet.
		 * The default implementation creates an Active Effect embedded document on the Item.
		 * @param {DragEvent} event       The initiating drop event
		 * @param {ActiveEffect} effect   The dropped ActiveEffect document
		 * @returns {Promise<ActiveEffect|null|undefined>} A Promise resolving to a newly created ActiveEffect, if one was
		 *                                                 created, or otherwise a nullish value
		 * @protected
		 */
		async _onDropActiveEffect(event, effect) {
			const item = this.document;
			if (!item.isOwner) return null;
			if ([effect.parent, effect.parent?.parent].includes(item)) return null;
			const keepId = !item.effects.has(effect.id);
			const result = await ActiveEffect.implementation.create(effect.toObject(), { parent: item, keepId });
			return result ?? null;
		}

		/* -------------------------------------------- */

		/**
		 * Handle a dropped Actor on the Item Sheet.
		 * @param {DragEvent} event     The initiating drop event
		 * @param {Actor} actor         The dropped Actor document
		 * @returns {Promise<Actor|null|undefined>} A Promise resolving to an Actor identical or related to the dropped Actor
		 *                                          to indicate success, or a nullish value to indicate failure or no action
		 *                                          being taken
		 * @protected
		 */
		async _onDropActor(event, actor) {
			return null;
		}

		/* -------------------------------------------- */

		/**
		 * Handle a dropped Item on the Item Sheet.
		 * @param {DragEvent} event     The initiating drop event
		 * @param {Item} item           The dropped Item document
		 * @returns {Promise<Item|null|undefined>} A Promise resolving to the dropped Item (if sorting), a newly created Item,
		 *                                         or a nullish value in case of failure or no action being taken
		 * @protected
		 */
		async _onDropItem(event, item) {
			return null;
		}

		/* -------------------------------------------- */

		/**
		 * Handle a dropped Folder on the Item Sheet.
		 * @param {DragEvent} event     The initiating drop event
		 * @param {Folder} folder       The dropped Folder document
		 * @returns {Promise<Folder|null|undefined>} A Promise resolving to the dropped Folder indicate success, or a nullish
		 *                                           value to indicate failure or no action being taken
		 * @protected
		 */
		async _onDropFolder(event, folder) {
			return null;
		}
	};
}
