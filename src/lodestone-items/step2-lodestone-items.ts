import * as got from "got";
import { cacheString, getDom } from "../util";
import { Item } from "./types";
import * as domUtils from "domutils";

export async function main(xivApiItems: Item[]) {
	let mapped: Item[] = [];
	let page = 1;
	while (true) {
		let html = await cacheString(`lodestone-page-${page}.html`, async () => {
			let res = await got(`https://eu.finalfantasyxiv.com/lodestone/playguide/db/item/?page=${page}`);
			return res.body;
		});

		let dom = await getDom(html);
		let links = domUtils.findAll((e) => {
			let className = domUtils.getAttributeValue(e, "class") || "";
			return className.includes("db-table__txt--detail_link");
		}, dom);

		links.forEach(link => {
			// grab the name and id
			let lodestoneName = domUtils.getText(link)
				.replace(/\u00A0/g, " ")
				.replace(/&nbsp;/g, " ")
				.replace(/&amp;/g, "&");
			let lodestoneId = domUtils.getAttributeValue(link, "href").split("/")[5];
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
				console.log(`not found: ${lodestoneId} - >${lodestoneName}<`)
			}
		})

		console.log(`lodestone page ${page} - mapped ${mapped.length}`)
		if (links.length === 0) break;
		page++;
		//await sleep(0); // this helps with OOM errors
	}

	return mapped;
}
