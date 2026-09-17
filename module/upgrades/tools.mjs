export const T20ToolsUpgrades = {};

T20ToolsUpgrades.status = {
	enhanced: "DONE"
};

T20ToolsUpgrades.enhanced = {
	name: "T20.ToolUpgradesEnhanced",
	description: "T20.ToolUpgradesTooltipEnhanced",
	tint: "#00FF00",
	changes: [
		{
			key: "system.modificadores.pericias.geral",
			value: "1",
			type: "add",
			priority: 0
		}
	],
	flags: {
		tormenta20: {
			onuse: false,
			durationScene: false,
			upgrade: "enhanced",
			self: false,
			skill: true
		}
	},
	disabled: false,
	isSuppressed: true,
	transfer: true
};
