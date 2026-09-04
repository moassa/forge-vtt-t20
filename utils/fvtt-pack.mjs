import { compilePack } from "@foundryvtt/foundryvtt-cli";
import { promises as fs } from "fs";
import Showdown from "showdown";

const SYSTEM_ID = process.cwd();
const yaml = false;
const folders = true;

// Options copied from foundry's constants.mjs
const converter = new Showdown.Converter({
	disableForced4SpacesIndentedSublists: true,
	noHeaderId: true,
	parseImgDimensions: true,
	strikethrough: true,
	tables: true,
	tablesHeaderId: true,
});

const packs = await fs.readdir("./src/packs");
for (const pack of packs) {
	if (pack.startsWith(".")) continue;
	console.log("Packing " + pack);
	await compilePack(
		`${SYSTEM_ID}/src/packs/${pack}`,
		`${SYSTEM_ID}/dist/packs/${pack}`,
		{ yaml, recursive: folders, transformEntry },
	);
}

/**
 * 
 * @param {object} entry The entry data.
 * @returns {Promise<false|void>}  Return boolean false to indicate that this entry should be discarded.
 */
async function transformEntry(entry) {

}
