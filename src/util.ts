import * as fs from "fs";
import * as path from "path";
import { promisify } from "util";
import { Parser } from "htmlparser2";
import { DomHandler, Node } from "domhandler";

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

export async function getDom(html: string): Promise<Node[]> {
	return new Promise((resolve, reject) => {
		let handler = new DomHandler((error, dom) => {
			if (error) {
				reject(error);
			} else {
				resolve(dom);
			}
		});
		let parser = new Parser(handler);
		parser.write(html);
		parser.end();
	});
}

export function sleep(time: number): Promise<void> {
	return new Promise((resolve) => {
		setTimeout(() => resolve(), time);
	});
}
