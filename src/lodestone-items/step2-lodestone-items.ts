import * as got from "got";
import { JSDOM } from "jsdom";
import { cacheString, sleep } from "../util";
import { Item } from "./types";

export async function main(xivApiItems: Item[]) {
	let mapped: Item[] = [];
	let page = 1;
	while (true) {
		let html = await cacheString(`lodestone-page-${page}.html`, async () => {
			let res = await got(`https://eu.finalfantasyxiv.com/lodestone/playguide/db/item/?page=${page}`);
			return res.body;
		});

		let dom = new JSDOM(html, { runScripts: "outside-only" });
		let links = dom.window.document.querySelectorAll(".db-table__txt--detail_link");
		links.forEach(link => {
			// grab the name and id
			let lodestoneName = link.innerHTML
				.replace(/&nbsp;/g, " ")
				.replace(/&amp;/g, "&");
			let lodestoneId = link.getAttribute("href").split("/")[5];
			// look for a item
			let xivApiItem = xivApiItems.find(i => i.name === lodestoneName)
			if (xivApiItem) {
				if (xivApiItem.lodestoneId) {
					console.log(`multiple lodestoneIds! ${xivApiItem.id} - ${lodestoneName}`)
				}
				mapped.push({
					id: xivApiItem.id,
					name: xivApiItem.name,
					lodestoneId: lodestoneId,
				});
			} else {
				console.log(`not found: ${lodestoneId} - ${lodestoneName}`)
			}
		})

		console.log(`lodestone page ${page} - mapped ${mapped.length}`)
		if (links.length === 0) break;
		page++;
		//await sleep(0); // this helps with OOM errors
	}

	return mapped;
}
