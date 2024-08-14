import {
	ChangeType,
	getSingleStatusChanges,
	getStatusChanges,
} from "./getStatus.js";
import { join } from "node:path";
import { promisify } from "node:util";
import { writeFile as _writeFile, unlink } from "node:fs";
import chalk from "chalk";

import { getBmc } from "./bmcConfig.js";
import getWorkspacePath from "./getWorkspacePath.js";
import { getMerge } from "./getDiff.js";
import { formatName, getName } from "./importWorkspace.js";
import type { ClientAction } from "./types.js";

const bgRed = chalk.bgRed;
const red = chalk.red;
const yellow = chalk.yellow;
const green = chalk.green;

const writeFile = promisify(_writeFile);
const rm = promisify(unlink);

async function makeChanges(wpPath, cas: ClientAction[], status: ClientAction, changes): Promise<ClientAction[]> {
	const notAdded = changes.includes(ChangeType.NOT_ADDED);
	const hasLocalChanges = changes.includes(ChangeType.LOCAL_CHANGES);
	const hasIncomingChanges = changes.includes(ChangeType.INCOMING_CHANGES);
	const wasAdded = changes.includes(ChangeType.NEW_CA);
	const removeLocal = changes.includes(ChangeType.REMOVE_LOCAL);
	const removeRemote = changes.includes(ChangeType.REMOVE_REMOTE);

	if (notAdded) {
		return cas;
	}
	if (removeLocal && hasIncomingChanges) {
		console.log(
			bgRed(
				`WARNING: ${status.name} has incoming changes but was deleted locally`,
			),
		);
		return cas;
	}
	if (hasLocalChanges && removeRemote) {
		console.log(
			bgRed(
				`WARNING: ${join(wpPath, "src", status.filename)} has local changes but was deleted remotly.`,
			),
		);
		return cas;
	}

	if (removeRemote) {
		console.log(red(`${join(wpPath, "src", status.filename)} was deleted`));
		await rm(join(wpPath, "src", status.filename));
		return cas.filter((ca) => ca.id !== status.id);
	}
	if (hasLocalChanges && hasIncomingChanges) {
		const remote = status.unPublishedCode || status.publishedCode;
		const original = status.unPublishedCode || status.publishedCode;
		const local = status.filename;
		const { conflict, result } = getMerge(local, original, remote);
		if (conflict) {
			console.log(
				bgRed(`WARNING: ${join(wpPath, "src", status.filename)} has merge conflicts`),
			);
		} else {
			console.log(
				yellow(
					`WARNING: ${join(wpPath, "src", status.filename)} was merged automatically`,
				),
			);
		}
		await writeFile(join(wpPath, "src", status.filename), result, "UTF-8");
	} else if (hasIncomingChanges) {
		const newVersion: string = status.unPublishedCode || status.publishedCode;

		if (status.filename) {
			console.log(green(`${join(wpPath, "src", status.filename)} has changes`));
			await writeFile(join(wpPath, "src", status.name), newVersion, "UTF-8");
		} else {
			// new File
			const baseName = formatName(status.name);
			const newFileName = await getName(join(wpPath, "src"), baseName, "js");

			await writeFile(join(wpPath, "src", newFileName), newVersion, "UTF-8");
			status.filename = newFileName;
			console.log(green(`${join(wpPath, "src", status.filename)} was added`));
		}
	} else if (wasAdded) {
		const newVersion: string = status.unPublishedCode || status.publishedCode;
		// new File
		const baseName = formatName(status.name);
		const newFileName = await getName(join(wpPath, "src"), baseName, "js");

		await writeFile(join(wpPath, "src", newFileName), newVersion, "UTF-8");
		console.log(green(`${join(wpPath, "src", newFileName)} was added`));
		return cas.concat({
			publishedCode: status.publishedCode,
			unPublishedCode: status.unPublishedCode,
			name: status.name,
			type: status.type,
			id: status.id,
			filename: newFileName,
		});
	}

	return cas.map((ca) =>
		ca.id !== status.id
			? ca
			: {
				id: status.id,
				name: status.name,
				type: status.type,
				publishedCode: status.publishedCode,
				unPublishedCode: status.unPublishedCode,
				filename: status.filename,
			},
	);
}

function hasMerge(changes) {
	const hasLocalChanges = changes.includes(ChangeType.LOCAL_CHANGES);
	const hasIncomingChanges = changes.includes(ChangeType.INCOMING_CHANGES);
	return hasLocalChanges && hasIncomingChanges;
}

async function singlePull(pwd: string, caName: string) {
	const wpPath = await getWorkspacePath(pwd);
	const { token, cas } = await getBmc(wpPath);
	const { changes, status } = await getSingleStatusChanges(pwd, caName);
	const newCas = await makeChanges(wpPath, cas, status, changes);
	if (newCas === cas) {
		console.log(green("Already up to date. :)"));
		return false;
	}
	await writeFile(
		join(wpPath, ".bmc"),
		JSON.stringify({ token, cas: newCas }),
		"UTF-8",
	);
	return hasMerge(changes);
}

async function completePull(pwd: string) {
	const wpPath = await getWorkspacePath(pwd);
	const { token, cas } = await getBmc(wpPath);
	const changesGenerator = getStatusChanges(pwd);
	let newCas = cas;
	let withMerges = false;
	for await (const statucChanges of changesGenerator) {
		const { status, changes } = statucChanges;
		newCas = await makeChanges(wpPath, newCas, status, changes);
		withMerges = withMerges || hasMerge(changes);
	}
	if (newCas === cas) {
		console.log(green("Already up to date. :)"));
		return false;
	}
	await writeFile(
		join(wpPath, ".bmc"),
		JSON.stringify({ token, cas: newCas }),
		"UTF-8",
	);
	return withMerges;
}

async function pull(pwd: string, caName: string) {
	if (caName) {
		return await singlePull(pwd, caName);
	}
	return await completePull(pwd);
}

export default pull;
