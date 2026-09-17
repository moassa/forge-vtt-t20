import "./less/tormenta20.less";
// Import Config
import { T20 } from "./module/config/T20.js";
globalThis.T20 = T20;

// Import Modules
import { _getInitiativeFormula } from "./module/combat.mjs";
import { registerHandlebarsHelpers } from "./module/handlebars.mjs";
import { SystemSettings } from "./module/settings.mjs";
import { preloadHandlebarsTemplates } from "./module/templates.mjs";

// Import Documents
import RollT20 from "./module/dice/roll.mjs";
import ActiveEffectT20 from "./module/documents/active-effects.mjs";
import ActorT20 from "./module/documents/actor.mjs";
import ChatMessageT20 from "./module/documents/chat-message.mjs";
import ItemT20 from "./module/documents/item.mjs";
import TokenDocumentT20 from "./module/documents/token.mjs";
globalThis.Roll = RollT20;

// Import canvas data
import TokenRulerT20 from "./module/canvas/token-ruler.mjs";
import TokenT20 from "./module/canvas/token.mjs";

import ActorSheetT20Bases from "./module/sheets/actor-bases.mjs";
import ActorSheetT20Character from "./module/sheets/actor-character.mjs";
import HazardSheetT20 from "./module/sheets/actor-hazard.mjs";
import ActorSheetT20NPC from "./module/sheets/actor-npc.mjs";
import ActorSheetT20Simple from "./module/sheets/actor-simple.mjs";
import ActorSheetT20CharacterTabbed from "./module/sheets/actor-tabbed.mjs";
import RaceSheetT20 from "./module/sheets/item-race-sheet.mjs";
import ItemSheetT20 from "./module/sheets/item-sheet.mjs";

import AbilityUseDialog from "./module/apps/ability-use-dialog.mjs";
import ActorSettings from "./module/apps/actor-settings.mjs";
import CharacterProgression from "./module/apps/character-progression.mjs";
import CompendiumT20 from "./module/apps/compendium.mjs";
import ResourceConfig from "./module/apps/resource-config.mjs";
import RestConfigDialog from "./module/apps/rest-config.mjs";
import StatblockParser from "./module/apps/statblock-parser.mjs";
import TokenHUDT20 from "./module/apps/token-hud.mjs";
import TraitSelector from "./module/apps/trait-selector.mjs";
// import CombatTrackerT20 from "./module/apps/combat.mjs";

// UPDATED
import * as applications from "./module/applications/_module.mjs";
import * as canvas from "./module/canvas/_module.mjs";
import * as models from "./module/data/_module.mjs";
import * as documents from "./module/documents/_module.mjs";

// NOT UPDATED
import * as dataModels from "./module/dataModel/_module.mjs";
import * as fields from "./module/dataModel/fields/_module.mjs";
import * as dice from "./module/dice/dice.mjs";
import * as hooks from "./module/hooks.mjs";
import * as macros from "./module/macros.mjs";
import "./module/modules.mjs";
import * as utils from "./module/utils.mjs";

// import {getSystemActorData,  getSystemItemData} from "./dataModel/data.mjs";
import RegionLayerT20 from "./module/canvas/region-layer.mjs";

/* -------------------------------------------- */
/*  Foundry VTT Initialization                  */
/* -------------------------------------------- */
globalThis.tormenta20 = {
	canvas,
	documents,
	models,
	applications: {
		...applications,
		AbilityUseDialog,
		ActorSheetT20Character,
		ActorSheetT20CharacterTabbed,
		ActorSheetT20NPC,
		ItemSheetT20,
		TraitSelector,
		ActorSettings,
		StatblockParser,
		RestConfigDialog,
		ResourceConfig,
		CompendiumT20,
		CharacterProgression
	},
	data: {
		fields,
		models: dataModels
	},
	config: T20,
	dice: dice,
	conditions: T20.conditions,
	entities: {
		ActorT20,
		ItemT20,
		ActiveEffectT20,
		ChatMessageT20,
		TokenDocumentT20
	},
	macros: macros,
	utils,
	rollItemMacro: macros.rollItemMacro,
	rollSkillMacro: macros.rollSkillMacro
};

Hooks.once("init", async function () {
	console.log("T20 | Initializing the Tormenta20 Game System");
	game.tormenta20 = tormenta20;
	// Record Cnfiguration Values
	CONFIG.T20 = T20;
	CONFIG.Actor.documentClass = documents.ActorT20;
	CONFIG.Item.documentClass = documents.ItemT20;
	CONFIG.ActiveEffect.documentClass = documents.ActiveEffectT20;
	CONFIG.Token.documentClass = documents.TokenDocumentT20;

	CONFIG.Token.objectClass = TokenT20;
	CONFIG.Token.rulerClass = TokenRulerT20;
	CONFIG.Token.hudClass = TokenHUDT20;
	TokenRulerT20.applyMovementConfig();
	CONFIG.time.roundTime = 6;

	/* DOCUMENT: Region */
	CONFIG.Canvas.layers.regions.layerClass = RegionLayerT20;

	// Register T20 stuff
	// CONFIG.statusEffects = T20.statusEffectIcons;
	CONFIG.conditions = T20.conditions;

	// Register System Settings
	SystemSettings();

	// Core Apps
	CONFIG.ui.players = applications.ui.PlayersT20;
	// Sidebars
	CONFIG.ui.actors = applications.sidebar.ActorDirectoryT20;
	CONFIG.ui.chat = applications.sidebar.ChatLogT20;
	CONFIG.ui.combat = applications.sidebar.CombatTrackerT20;

	CONFIG.ChatMessage.documentClass = documents.ChatMessageT20;
	CONFIG.Combat.documentClass = documents.CombatT20;
	CONFIG.Region.documentClass = documents.RegionT20;

	CONFIG.Combat.initiative = {
		formula: "1d20 + @pericias.inic.value",
		decimals: 2
	};
	Combat.prototype._getInitiativeFormula = _getInitiativeFormula;

	// Register Roll Extensions
	Roll.CHAT_TEMPLATE = "systems/tormenta20/templates/chat/roll.hbs";
	Roll.TOOLTIP_TEMPLATE = "systems/tormenta20/templates/chat/roll-breakdown.hbs";

	CONFIG.Dice.rolls.push(RollT20);
	CONFIG.Dice.rolls.RollT20 = RollT20;
	CONFIG.Dice.rolls.D20Roll = dice.d20Roll;
	CONFIG.Dice.rolls.DamageRoll = dice.damageRoll;

	// DATA MODEL
	CONFIG.Actor.dataModels = {
		bases: tormenta20.data.models.BasesData,
		character: tormenta20.data.models.CharacterData,
		npc: tormenta20.data.models.MenaceData,
		simple: tormenta20.data.models.SimpleData,
		hazard: tormenta20.data.models.HazardData
	};

	CONFIG.Item.dataModels = {
		arma: tormenta20.data.models.WeaponData,
		classe: tormenta20.data.models.ClassData,
		comodo: tormenta20.data.models.RoomData,
		consumivel: tormenta20.data.models.ConsumableData,
		equipamento: tormenta20.data.models.EquipmentData,
		magia: tormenta20.data.models.SpellData,
		mobilia: tormenta20.data.models.FurnitureData,
		poder: tormenta20.data.models.PowerData,
		race: tormenta20.data.models.RaceData,
		tesouro: tormenta20.data.models.LootData
	};

	CONFIG.ActiveEffect.dataModels = {
		base: tormenta20.models.effect.BaseEffect
	};

	CONFIG.ActiveEffect.expiryAction = "delete";
	CONFIG.ActiveEffect.expiryEvents = {
		sceneEnd: "T20.TimeScene",
		sustainEnd: "T20.sustainEnd"
	};

	// Register sheet application classes
	const { DocumentSheetConfig } = foundry.applications.apps;

	DocumentSheetConfig.registerSheet(
		ActiveEffect,
		"tormenta20",
		tormenta20.applications.sheets.effect.ActiveEffectConfigT20,
		{ makeDefault: true, label: "T20.ActiveEffectSheet" }
	);

	/* Old */
	foundry.documents.collections.Actors.unregisterSheet("core", foundry.appv1.sheets.ActorSheet);
	foundry.documents.collections.Actors.registerSheet("tormenta20", ActorSheetT20Bases, {
		types: ["bases"],
		makeDefault: true,
		label: "T20.BasesSheet" // "Ficha de Bases"
	});
	foundry.documents.collections.Actors.registerSheet("tormenta20", ActorSheetT20Character, {
		types: ["character"],
		makeDefault: true,
		label: "T20.CharacterSheet" // "Ficha de Personagem"
	});
	foundry.documents.collections.Actors.registerSheet("tormenta20", ActorSheetT20CharacterTabbed, {
		types: ["character"],
		makeDefault: false,
		label: "T20.CharacterSheetTabbed" // "Ficha de Personagem - Abas"
	});
	foundry.documents.collections.Actors.registerSheet("tormenta20", ActorSheetT20NPC, {
		types: ["npc"],
		makeDefault: true,
		label: "T20.NPCSheet"
	});

	foundry.documents.collections.Actors.registerSheet("tormenta20", ActorSheetT20Simple, {
		types: ["simple"],
		makeDefault: true,
		label: "T20.SimpleActorSheet" // "Ficha de Simple"
	});

	foundry.documents.collections.Actors.registerSheet("tormenta20", HazardSheetT20, {
		types: ["hazard"],
		makeDefault: true,
		label: "T20.HazardSheet" // "Ficha de Perigos Complexos"
	});

	foundry.documents.collections.Items.unregisterSheet("core", foundry.appv1.sheets.ItemSheet);
	foundry.documents.collections.Items.registerSheet("tormenta20", ItemSheetT20, {
		makeDefault: true,
		label: "T20.ItemSheet"
	});
	foundry.documents.collections.Items.unregisterSheet("tormenta20", ItemSheetT20, { types: ["race"] });
	foundry.documents.collections.Items.registerSheet("tormenta20", RaceSheetT20, {
		makeDefault: true,
		types: ["race"],
		label: "T20.ItemSheet"
	});

	// Register enrichers
	CONFIG.TextEditor.enrichers = [applications.ux.enrichers.applyEffect];
	// Core Application Overrides
	// Preload Handlebars Templates
	preloadHandlebarsTemplates();
	registerHandlebarsHelpers();
});

/* -------------------------------------------- */
/*  Foundry VTT Setup                           */
/* -------------------------------------------- */

// localization && sort
Hooks.once("i18nInit", () => utils.performPreLocalization(CONFIG.T20));

/* -------------------------------------------- */

// Load hooks
hooks.default();
