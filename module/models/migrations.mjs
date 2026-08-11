import * as m_v13 from "./migrations/v13.mjs";
// import * as m_v14 from "./migrations/v14.mjs";

export async function migrateWorld() {
	if (!game.user.isActiveGM) {
		console.debug("Not the active GM");
		return;
	}

	const systemMigrationVersion = game.settings.get("tormenta20", "systemMigrationVersion");

	if (foundry.utils.isNewerVersion("1.4.100", systemMigrationVersion)) {
		await m_v13.migration_1_4_100();
	}

	// Define o padrão dos token de PJ
	if (foundry.utils.isNewerVersion("1.5.000", systemMigrationVersion)) {
		await m_v13.migration_1_5_0();
	}
	if (foundry.utils.isNewerVersion("1.5.006", systemMigrationVersion)) {
		await m_v13.migration_1_5_006();
	}
	if (foundry.utils.isNewerVersion("1.5.007", systemMigrationVersion)) {
		await m_v13.migration_1_5_007();
	}
	if (foundry.utils.isNewerVersion("1.5.010", systemMigrationVersion)) {
		await m_v13.migration_1_5_010();
	}
	if (foundry.utils.isNewerVersion("1.5.012", systemMigrationVersion)) {
		await m_v13.migration_1_5_012();
	}
	if (foundry.utils.isNewerVersion("1.5.013", systemMigrationVersion)) {
		await m_v13.migration_1_5_013();
	}

	if (foundry.utils.isNewerVersion("1.6.001", systemMigrationVersion)) {
		await migration_1_6_0();
	}

	return game.settings.set("tormenta20", "systemMigrationVersion", game.system.version);

}



async function migration_1_6_0(params) {
	// Update Active Effect
	// - Update item effects with changes from the transfered copy
	// - Remove effects transfered to actors;
	for (const actor of game.actors) {
		for (const effect of actor.effects) {
			// 
		}
	}
}


async function migration_1_6_2(params) {

}
