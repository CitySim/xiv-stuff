import * as got from "got";
import { cacheString } from "../util";
import { Item } from "./types";

const batchSize = 3000;

export async function main() {
	let itemsJson = await cacheString("item.json", async() => {
		let xviApiItems: Item[] = [];
		let page = 1;
		while (true) {
			let result = await got(`https://xivapi.com/item?columns=ID,Name&limit=${batchSize}&page=${page}`, { json: true });
			xviApiItems = xviApiItems.concat(result.body.Results);

			console.log(`fetched page ${page}, items ${result.body.Results.length}`);
			if (result.body.Results.length < batchSize) break;
			page++;
		}

		return JSON.stringify(xviApiItems);
	});

	let items = (JSON.parse(itemsJson) as any[]).map<Item>(item => ({
		id: item.ID,
		name: item.Name.replace(/\u00A0/g, " "), // "NO-BREAK SPACE" thanks Craftsman's Singlet
	}));
	console.log(`xivApi items:          ${items.length}`)
	items = items.filter(item => item.name !== "")
	console.log(`xivApi non empty Name: ${items.length}`)

	return items;
}
