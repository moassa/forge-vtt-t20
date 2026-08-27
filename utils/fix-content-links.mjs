// import { promises as fs } from "fs";
import fs from "fs";
import * as yaml from "js-yaml";
// import yaml from "js-yaml";
// import { readFile, writeFile } from "node:fs/promises";

import path from "path";

fs;
yaml;
path;


// readFile
// writeFile

const packs = await fs.promises.readdir("./src/packs");


for (const pack of packs) {
	if (pack === ".gitattributes") continue;
	console.log("Fixig " + pack);
	const directory = `./src/packs/${pack}`;

	for (const file of await fs.promises.readdir(directory)) {
		const filePath = path.join(directory, file);
		if (!filePath.endsWith(".yml")) continue;
		console.log("File " + filePath);
		console.log("READING FILE");
		const source = await fs.promises.readFile(filePath, { encoding: 'utf8' });
		const doc = yaml.load(source, { filename: file });
		console.log("DOC._id: " + doc._id);
		if (doc.system?.description?.value) {
			const content = document.createElement("div");
			content.innerHTML = doc.system?.description?.value;

			content.querySelectorAll("a.content-link").forEach(link => {
				const uuid = link.dataset.uuid;
				if (uuid) link.replaceWith(`@UUID[${uuid}]`);
			})
		}

		// const doc = yaml.safeLoad(fs.readFileSync(filePath, "utf8"));
		// system.description.value
		break;
	}
}




// for (const file of await fs.readdir(directory)) {
// 	const filePath = path.join(directory, file);
// 	if (file.endsWith(yaml ? ".yml" : ".json")) await fs.unlink(filePath);
// 	else fs.rm(filePath, { recursive: true });
// }