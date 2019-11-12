import * as got from "got";
import { cacheString, sleep, getDom } from "../util";
import { Item } from "./types";
import * as domUtils from "domutils";
import { writeFileSync } from "fs";

export async function main(items: Item[]) {
	for (let i = 0; i < items.length; i++) {
		let item = items[i];

		let html = await cacheString(`lodestone-item-${item.lodestoneId}.html`, async () => {
			let res = await got(`https://eu.finalfantasyxiv.com/lodestone/playguide/db/item/${item.lodestoneId}/`);
			return res.body;
		});

		let dom = await getDom(html);
		let icons = domUtils.findAll((e) => {
			let className = domUtils.getAttributeValue(e, "class") || "";
			return className.includes("db-view__item__icon__item_image");
		}, dom);

		for (let icon of icons) {
			let className = domUtils.getAttributeValue(icon, "class") || "";
			if (className.includes("sys_nq_element")) {
				item.nq = domUtils.getAttributeValue(icon, "src");
			} else if (className.includes("sys_hq_element")) {
				item.hq = domUtils.getAttributeValue(icon, "src");
			}
		}

		console.log(`${i + 1}/${items.length} ${item.nq ? "NQ" : "  "} ${item.hq ? "HQ" : "  "} - ${item.name}`)

		writeFileSync("items.json", JSON.stringify(items, null, 2));
	}

	return items;
}
