import { applyChatCardDamage, applyChatManaSpend } from "../chat.mjs";

export default class ChatLogTormenta20 extends foundry.applications.sidebar.tabs.ChatLog {
	_getEntryContextOptions() {
		const context = super._getEntryContextOptions();
		const canApply = (li) => {
			const message = game.messages.get(li.dataset.messageId);
			return (
				(li.querySelector(".roll--dano") || message?.isRoll)
				&& message.rolls.some(
					(r) =>
						r.total
						&& r.options?.type !== "attack"
						&& r.terms.some((t) => !["curapv", "curatpv", "curapm", "curatpm"].includes(t.options?.flavor))
				)
				&& message?.isContentVisible
				&& canvas.tokens?.controlled.length
			);
		};
		const canApplyHeal = (li) => {
			const message = game.messages.get(li.dataset.messageId);
			return (
				(li.querySelector(".roll--dano") || message?.isRoll)
				&& message.rolls.some((r) => r.total)
				&& message?.isContentVisible
				&& canvas.tokens?.controlled.length
			);
		};
		const canApplyMana = (li) => {
			const message = game.messages.get(li.dataset.messageId);
			return (
				(li.querySelector(".mana-cost, .chat-spend-mana")
					|| (message?.isRoll
						&& message.rolls.some(
							(r) => r.total && r.options?.type !== "attack" && r.terms.every((t) => !t.options?.flavor)
						)))
				&& message.rolls.some((r) => r.total)
				&& message?.isContentVisible
				&& canvas.tokens?.controlled.length
			);
		};
		return [
			...context,
			{
				label: "Aplicar Dano",
				icon: '<i class="fas fa-user-minus" style="color: #CC0000;"></i>',
				value: 1,
				visible: canApply,
				onClick: (li) => applyChatCardDamage(li, 1)
			},
			{
				label: "Aplicar Dano em Dobro",
				icon: '<i style="color: #CC0000;">2x </i>',
				visible: canApply,
				onClick: (li) => applyChatCardDamage(li, 2)
			},
			{
				label: "Aplicar Dano pela Metade",
				icon: '<i style="color: #CC0000;">½ </i>',
				visible: canApply,
				onClick: (li) => applyChatCardDamage(li, 0.5)
			},
			{
				label: "Aplicar Cura",
				icon: '<i class="fas fa-user-plus" style="color: #00AA00;"></i>',
				visible: canApplyHeal,
				onClick: (li) => applyChatCardDamage(li, -1, "curapv")
			},
			{
				label: "Gastar Mana",
				icon: '<i class="fas fa-star" style="color: #33A0FF;"></i>',
				visible: canApplyMana,
				onClick: (li) => applyChatManaSpend(li, 0)
			}, {
				label: "Log to Console",
				icon: "fa-solid fa-code",
				visible: (li) => true,
				onClick: (event, li) => {
					const message = game.messages.get(li.dataset.messageId);
					console.log(message);
				}
			}
		];
	}
}
