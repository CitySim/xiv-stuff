import * as got from "got";
import { JSDOM } from "jsdom";
import { cacheString, sleep } from "../util";
import { Item } from "./types";

export async function main(items: Item[]) {
	for (let i = 0; i < items.length; i++) {
		let item = items[i];
		console.log(`${i}/${items.length} ${item.name}...`)

		let html = await cacheString(`lodestone-item-${item.lodestoneId}.html`, async () => {
			let res = await got(`https://eu.finalfantasyxiv.com/lodestone/playguide/db/item/${item.lodestoneId}/`);
			return res.body;
		});

		let dom = new JSDOM(html, { runScripts: "outside-only" });
		let nqImg = dom.window.document.querySelector(".db-view__item__icon__item_image.sys_nq_element");
		let hqImg = dom.window.document.querySelector(".db-view__item__icon__item_image.sys_hq_element");

		if (nqImg) item.nq = nqImg.getAttribute("src");
		if (hqImg) item.hq = hqImg.getAttribute("src");
		console.log("nq", item.nq)
		console.log("hq", item.hq)
	}

	return items;
}
