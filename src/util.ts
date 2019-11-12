import * as fs from "fs";
import * as path from "path";
import { promisify } from "util";

const stat = promisify(fs.stat);
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

export async function cacheString(key: string, work: () => Promise<string>): Promise<string> {
	let cachePath = path.resolve(__dirname, "../cache", key);
	return new Promise(async(resolve, reject) => {
		try {
			await stat(cachePath);

			let content = await readFile(cachePath);
			resolve(content.toString("utf-8"));
		} catch (e) {
			let value = await work();
			await writeFile(cachePath, value);
			resolve(value);
		}
	});
}

export function sleep(time: number): Promise<void> {
	return new Promise((resolve) => {
		setTimeout(() => resolve(), time);
	});
}
