import { main as step1 } from "./lodestone-items/step1-xiv-api-items";
import { main as step2 } from "./lodestone-items/step2-lodestone-items";
import { main as step3 } from "./lodestone-items/step3-icons";
import { writeFileSync } from "fs";

(async function() {
	console.log("step 1")
	let items = await step1();
	console.log("step 2")
	items = await step2(items);
	console.log("step 3")
	items = await step3(items);

	writeFileSync("item.json", items);
	console.log("done")
})();
