import { join } from "node:path";
import { promisify } from "node:util";
import {
	readFile as _readFile,
	readdir as _readdir,
	writeFile as _writeFile,
	exists as _exists,
	mkdir as _mkdir,
} from "node:fs";
import { decode as _decode } from "jsonwebtoken";
import { getAllCas, getCustomerContext } from "./bmService.js";
import { copy } from "fs-extra";

const writeFile = promisify(_writeFile);
const exists = promisify(_exists);
const mkdir = promisify(_mkdir);
const copyAll = promisify(copy);

const formatName = (name) =>
	name
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "") // remove acents
		.replace(/\W+/g, "_") // remplace spaces with underscore
		.replace(/[\u{0080}-\u{FFFF}]/gu, "") // remove all non ascii chars
		.toLowerCase();

const getName = async (folder, basename, extension, num) => {
	const counterPart = num !== undefined ? `_${num}` : "";
	const finalName = `${basename}${counterPart}.${extension}`;
	const finalPath = join(folder, finalName);
	const isTaken = await exists(finalPath);
	if (isTaken && num > 100) {
		throw new Error(`could not found a space for '${basename}'`);
	} if (isTaken) {
		const nextNum = num !== undefined ? num + 1 : 0;
		return getName(folder, basename, extension, nextNum);
	}
	return finalName;
};

async function importWorkspace(pwd, apiToken) {
	const decode = _decode(apiToken);
	if (!decode) {
		console.error(
			"bmc: Invalid jwt token. Please generate a api token from https://go.botmaker.com/#/platforms in 'Botmaker API - Credenciales'"
		);
		throw new Error("Invalid jwt token");
	}
	const { businessId } = decode;
	const workspacePath = join(pwd, businessId);
	if (await exists(workspacePath)) {
		throw new Error(
			`cannot create directory ‘${join(pwd, businessId)}’: File exists`
		);
	}

	console.log("looking for context...");
	const contextReq = await (async () => {
		try {
			return await getCustomerContext(apiToken);
		} catch (e) {
			console.error(
				`Cound not found a context. Please check if exist some chat for the business ${businessId}`
			);
			throw e;
		}
	})();
	const context = JSON.parse(contextReq.body);

	console.log("looking for client actions...");
	const casReq = await (async () => {
		try {
			return await getAllCas(apiToken);
		} catch (e) {
			console.error("Cound obtain the client actions.");
			throw e;
		}
	})();
	const cas = JSON.parse(casReq.body);
	console.log("creating workspace...");

	await mkdir(workspacePath);
	const bmcPath = join(__dirname, "..");
	const baseTemplate = join(bmcPath, "workspaceTemplate");
	await copyAll(baseTemplate, workspacePath);
	await writeFile(
		join(workspacePath, "context.json"),
		JSON.stringify(context, null, 4),
		"UTF-8"
	);
	await mkdir(join(workspacePath, "src"));
	const srcFolder = join(workspacePath, "src");
	for (const ca of cas) {
		const baseName = formatName(ca.name);
		ca.filename = await getName(srcFolder, baseName, "js");
		await writeFile(
			join(srcFolder, ca.filename),
			ca.unPublishedCode || ca.publishedCode,
			"UTF-8"
		);
	}
	const bmc = {
		cas,
		token: apiToken,
	};
	await writeFile(join(workspacePath, ".bmc"), JSON.stringify(bmc), "UTF-8");
}

export { getName, formatName, importWorkspace };
