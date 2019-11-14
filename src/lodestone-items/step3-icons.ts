import * as got from "got";
import { cacheString, sleep, getDom } from "../util";
import { Item } from "./types";
import * as domUtils from "domutils";
import { writeFileSync } from "fs";
import { Aigle } from "aigle";

export async function main(items: Item[]) {
	let done = 0;
	await Aigle.eachLimit(items, 5, async(item) => {
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
				item.nq = unrefString(domUtils.getAttributeValue(icon, "src"));
			} else if (className.includes("sys_hq_element")) {
				item.hq = unrefString(domUtils.getAttributeValue(icon, "src"));
			}
		}

		console.log(`${++done}/${items.length} ${item.nq ? "NQ" : "  "} ${item.hq ? "HQ" : "  "} - ${item.name}`)

		// writeFileSync("items.json", JSON.stringify(items, null, 2));
	});

	return items;
}

// this is due a fancy v8 does
// https://bugs.chromium.org/p/v8/issues/detail?id=2869
function unrefString(input: string): string {
	return (" " + input).substr(1);
}
