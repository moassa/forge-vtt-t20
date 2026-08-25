import * as abstract from "../abstract/_module.mjs";

const { DocumentSheet } = foundry.applications.api;
const { renderTemplate } = foundry.applications.handlebars;
const { Tormenta20ApplicationMixin, SheetActionEditImage } = abstract;

const DURATION_UNITS = CONST.ACTIVE_EFFECT_DURATION_UNITS;
const TIME_DURATION_UNITS = CONST.ACTIVE_EFFECT_TIME_DURATION_UNITS;

/**
 * @import ActiveEffect from "@client/documents/active-effect.mjs"
 */

/**
 * Extends base DocumentSheet implementing handlebars and commom actions;
 * @extends {ApplicationT20, DocumentSheet}
 */
export default class CharacterSheet extends Tormenta20ApplicationMixin({
	Base: DocumentSheet,
	mixins: [SheetActionEditImage]
}) {


}