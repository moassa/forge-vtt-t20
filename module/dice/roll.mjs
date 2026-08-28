// import { T20 } from "../config.mjs";

import { simplifyRollFormula } from "./dice.mjs";

const { DiceTerm, Die, OperatorTerm, NumericTerm } = foundry.dice.terms;

export default class RollT20 extends foundry.dice.Roll {
	get formulaSimplified() {
		return simplifyRollFormula(this.formula);
	}

	/**
	 * Prepare context data used to render the CHAT_TEMPLATE for this roll.
	 * @param {object} options
	 * @param {string} [options.flavor]
	 * @param {boolean} [options.isPrivate=false]
	 * @returns {Promise<{object}>}
	 * @protected
	 */
	async _prepareChatRenderContext({ flavor, isPrivate = false, ...options } = {}) {
		return {
			formula: isPrivate ? "???" : this.formulaSimplified,
			_formula: isPrivate ? "???" : this.formula,
			flavor: isPrivate ? null : this.options.title,
			user: game.user.id,
			tooltip: isPrivate ? "" : await this.getTooltip(),
			total: isPrivate ? "?" : Math.round(this.total * 100) / 100
		};
	}
}
