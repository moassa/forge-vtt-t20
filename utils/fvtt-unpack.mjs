import { extractPack } from "@foundryvtt/foundryvtt-cli";
import { promises as fs } from "fs";
import path from "path";

const SYSTEM_ID = process.cwd();
const yaml = false;
const expandAdventures = false;
const folders = true;

const packs = await fs.readdir("./dist/packs");
for (const pack of packs) {
  if (pack.startsWith(".")) continue;
  if (pack == "poderes-distincao") continue;

  console.log("Unpacking " + pack);
  await extractPack(
    `${SYSTEM_ID}/dist/packs/${pack}`,
    `${SYSTEM_ID}/src/packs/${pack}`,
    {
      yaml,
      transformName,
      transformEntry,
      expandAdventures,
      folders,
      clean: true,
      omitVolatile: true,
    },
  );
}

/**
 * @typedef TransformerContext
 * @property {object} [adventure]       Data on an adventure if document is stored within an adventure.
 * @property {object} [adventure.doc]   The entire adventure document.
 * @property {string} [adventure.path]  The path where the adventure will be extracted.
 * @property {string} [folder]          Folder path if this entry is in a folder and the folders option is enabled.
 * @property {string} [documentType]    The type of the Document being extracted.
 */

/**
 * Prefaces the document with its type.
 * @param {object} doc                  The document data.
 * @param {TransformerContext} context  Optional context information for the document being transformed.
 */
function transformName(doc, context) {
  const safeFileName = doc.name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s/g, "_");
  const prefix = ["Actor", "Item", "ActiveEffect"].includes(context.documentType)
    ? doc.type
    : context.documentType;

  let name = doc.name
    ? `${prefix}_${safeFileName}_${doc._id}.${yaml ? "yml" : "json"}`
    : `${doc._id}.${yaml ? "yml" : "json"}`;
  if (context.folder) name = path.join(context.folder, name);
  return name;
}

/**
 * Remove text content from wiki journal.
 * @param {object} entry The entry data.
 * @returns {Promise<false|void>}  Return boolean false to indicate that this entry should be discarded.
 */
async function transformEntry(entry) {
  for (const key of Object.keys(entry.flags)) {
    if (!["core", "tormenta20"].includes(key)) delete entry.flags[key];
  }

  transformId(entry);

}

function transformId(entry) {
  const itemWithsDuplicatedId = {
    "BhpzjqRfeArgcTqO": {
      "effect": "pgiOeYq86CAfHGz2",
      "_id": "qezv9ohX5TTIm6X9"
    },
    "Fm42qXLskwRTg4sK": {
      "effect": "9BWBCqRZgO7RdAKJ",
      "_id": "ZYbgPzEh8zIet07Q"
    },
    "GrfGrpdLGyqAjQrf": {
      "effect": "pgiOeYq86CAfHGz2",
      "_id": "v0VEq6EWqdlHCGpC"
    },
    "cGc0tE4nCPNyJ1bj": {
      "effect": "pgiOeYq86CAfHGz2",
      "_id": "dXvRdLCnQsVWL8PZ"
    },
    "j4pu8gttduL150Pp": {
      "effect": "pgiOeYq86CAfHGz2",
      "_id": "Lt3FHErZbxlYhNQF"
    },
    "m6zYuRBPDXvCFDOK": {
      "effect": "zB6gchRQbFfRVZXC",
      "_id": "fuDyCOGcNBN0i4Hy"
    },
    "mekjIF9AY4N966pb": {
      "effect": "DZPQb8VEdXKiZiVn",
      "_id": "yGNmF2U8zVesUEfN"
    },
    "oH8uAkEkQ0kANKCn": {
      "effect": "CV3W6cQggXRWk9Nd",
      "_id": "JlUU6CNGKvrjQSC7"
    },
    "wy59756oAHeyE3hu": {
      "effect": "pgiOeYq86CAfHGz2",
      "_id": "DKvKXGGiCtMMBzPp"
    },
    "I0xIilNtrZfINE8A": {
      "effect": "mhMNYFNWFT6UyhFS",
      "_id": "0WjqroZ6OpheXbTw"
    },
    "I572hTLEprNdCPab": {
      "effect": "mhMNYFNWFT6UyhFS",
      "_id": "n5Xf5Ju64oAkj3V5"
    },
    "JcJuBJzPEoVuboMp": {
      "effect": "H6DQFuSF71NcRSIr",
      "_id": "5E3mLKyTVEsPbV2v"
    },
    "JgHtHH40AcZqCRg1": {
      "effect": "mhMNYFNWFT6UyhFS",
      "_id": "mWb7H5bKnA1x8PgV"
    },
    "MT4QgnaAwWgr4pet": {
      "effect": "mhMNYFNWFT6UyhFS",
      "_id": "DbA4MssXPSgV7cEr"
    },
    "Ye9upc42yVz6pHwH": {
      "effect": "eHWCJclZDfxaVxFQ",
      "_id": "aFzt3ITmnjtrL3Uv"
    },
    "ZTL25EsE31e1WcTG": {
      "effect": "mhMNYFNWFT6UyhFS",
      "_id": "sHgWrgVjCnIPZofI"
    },
    "h01YOTRjSBEUROhl": {
      "effect": "mhMNYFNWFT6UyhFS",
      "_id": "UF33WSQzCwhqiTg3"
    },
    "hJSIRtVZKM0fmDb5": {
      "effect": "H6DQFuSF71NcRSIr",
      "_id": "Y0ErGUWIQw1Y4o2p"
    },
    "izefGkhnkOKfJSaW": {
      "effect": "mhMNYFNWFT6UyhFS",
      "_id": "NBhfiHO7VLOqq8TQ"
    },
    "j250fWNvySzrUnsg": {
      "effect": "mhMNYFNWFT6UyhFS",
      "_id": "poxMqFmVIsbMt9SQ"
    },
    "kVham9N70h6WyqW4": {
      "effect": "MiyRanpGzHyIHOLO",
      "_id": "Er4swc7O3jyrCFss"
    },
    "kc5hodyP1AIeDJnv": {
      "effect": "H6DQFuSF71NcRSIr",
      "_id": "2gxWGPO8JQcdFNF1"
    },
    "kmbfQJLBekZl3cNM": {
      "effect": "sO7OOuysiopAeD8d",
      "_id": "LWO3NIgvglSQnx4Y"
    },
    "ucdl25Utxqgj0F7y": {
      "effect": "mhMNYFNWFT6UyhFS",
      "_id": "RUYsZDpUIfz8lX9S"
    },
    "wPChv8ymcWkPofWu": {
      "effect": "H6DQFuSF71NcRSIr",
      "_id": "wVkiB8rJ4693G11A"
    },
    "y9YQu2wxYDpMEDtU": {
      "effect": "mhMNYFNWFT6UyhFS",
      "_id": "GG7omD87AZj9nFRP"
    },
    "u3H3ie8CbzrmlBM9": {
      "effect": "fwMTgwpZsj9p70EF",
      "_id": "LK7HkAuongxQDnyX"
    },
    "QuRZaECq8M4mIA8g": {
      "effect": "Q9Nx00b81V4boOgR",
      "_id": "JAokmnG2T1ogSFbH"
    },
    "ULey4aDXMLnkrrrN": {
      "effect": "Q9Nx00b81V4boOgR",
      "_id": "Sc3YE2z4tUsw9sMI"
    },
    "bhkJXAarWpRCeJaI": {
      "effect": "TnXSqqNFVOJ9W9KA",
      "_id": "CzxnBwdZKt9ugW73"
    },
    "f0LosNC45Jb0g0H7": {
      "effect": "Nzx93ileTOT6jhFR",
      "_id": "MjcGQxQNTzd5zzi3"
    },
    "k4su7l41r5TED3f8": {
      "effect": "21qX4wyfrA31uMBT",
      "_id": "M8wm8WR8aa9PSOjQ"
    },
    "sE935B47ySWD4Lus": {
      "effect": "UcIlQrTeNdGpbtXO",
      "_id": "BUv7qFyYyozWCVbH"
    },
    "uNwAhgYfnGrlr705": {
      "effect": "rZ4AsGAxKpSs9lPO",
      "_id": "Rpwem5XqfGsDGqDi"
    },
    "zNIAmGsgvH4xj6H7": {
      "effect": "CRX7wBp8q9Zkv9z2",
      "_id": "jkMo8Pe9SYGpqSbo"
    },
    "hjvqA8b5pxriWBRh": {
      "effect": "F0zVn89RuO4sSv6u",
      "_id": "VJNNJ0zETIdm7TwS"
    },
    "lUvXanXBUKxGOd2M": {
      "effect": "OagxBZ7Y1s9Q87Na",
      "_id": "eWiLbzbonYnvI1eV"
    },
    "YAcnW6C7ok7xjdg6": {
      "effect": "vYKggB1hxhT4LRZv",
      "_id": "qpSVzJ9Ciw0hDGiW"
    },
    "rntcrujiIc63hKOp": {
      "effect": "vYKggB1hxhT4LRZv",
      "_id": "kPfjycPCqxtkDP7h"
    }
  }
  const update = itemWithsDuplicatedId[entry._id];
  if (!update) return;

  for (const effect of entry.effects) {
    if (effect._id == update.effect) {
      effect._id = update._id;
      effect._key = effect._key.replace(update.effect, update._id);
    }
  }
}