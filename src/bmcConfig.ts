import { join } from "node:path";
import { promisify } from "node:util";
import { readFile as _readFile, writeFile as _writeFile } from "node:fs";

const readFile = promisify(_readFile);
const writeFile = promisify(_writeFile);

export async function getBmc(wpPath) {
	const bmc = await readFile(join(wpPath, ".bmc"), "UTF-8");
	return JSON.parse(bmc);
}

export async function saveBmc(wpPath, token, cas) {
	await writeFile(
		join(wpPath, ".bmc"),
		JSON.stringify({ token, cas }),
		"UTF-8",
	);
}
