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

const bgRed = chalk.bgRed;
const red = chalk.red;
const yellow = chalk.yellow;
const green = chalk.green;

const writeFile = promisify(_writeFile);
const rm = promisify(unlink);

async function makeChanges(wpPath, cas, status, changes) {
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
				`WARNING: ${status.name} has incoming changes but was deleted locally`
			)
		);
		return cas;
	}
	if (hasLocalChanges && removeRemote) {
		console.log(
			bgRed(
				`WARNING: ${join(wpPath, "src", status.fn)} has local changes but was deleted remotly.`
			)
		);
		return cas;
	}

	if (removeRemote) {
		console.log(red(`${join(wpPath, "src", status.fn)} was deleted`));
		await rm(join(wpPath, "src", status.fn));
		return cas.filter((ca) => ca.id !== status.id);
	}
	if (hasLocalChanges && hasIncomingChanges) {
		const remote = status.U || status.P;
		const original = status.u || status.p;
		const local = status.f;
		const { conflict, result } = getMerge(local, original, remote);
		if (conflict) {
			console.log(
				bgRed(`WARNING: ${join(wpPath, "src", status.fn)} has merge conflicts`)
			);
		} else {
			console.log(
				yellow(
					`WARNING: ${join(wpPath, "src", status.fn)} was merged automatically`
				)
			);
		}
		await writeFile(join(wpPath, "src", status.fn), result, "UTF-8");
	} else if (hasIncomingChanges) {
		const newVersion = status.U || status.P;

		if (status.fn) {
			console.log(green(`${join(wpPath, "src", status.fn)} has changes`));
			await writeFile(join(wpPath, "src", status.fn), newVersion, "UTF-8");
		} else {
			// new File
			const baseName = formatName(status.N);
			const newFileName = await getName(join(wpPath, "src"), baseName, "js");

			await writeFile(join(wpPath, "src", newFileName), newVersion, "UTF-8");
			status.fn = newFileName;
			console.log(green(`${join(wpPath, "src", status.fn)} was added`));
		}
	} else if (wasAdded) {
		const newVersion = status.U || status.P;
		// new File
		const baseName = formatName(status.N);
		const newFileName = await getName(join(wpPath, "src"), baseName, "js");

		await writeFile(join(wpPath, "src", newFileName), newVersion, "UTF-8");
		console.log(green(`${join(wpPath, "src", newFileName)} was added`));
		return cas.concat({
			publishedCode: status.P,
			unPublishedCode: status.U,
			name: status.N,
			type: status.T,
			id: status.id,
			filename: newFileName,
		});
	}

	return cas.map((ca) => ca.id !== status.id
		? ca
		: {
			publishedCode: status.P,
			unPublishedCode: status.U,
			name: status.N,
			type: status.T,
			id: status.id,
			filename: status.fn,
		}
	);
}

function hasMerge(changes) {
	const hasLocalChanges = changes.includes(ChangeType.LOCAL_CHANGES);
	const hasIncomingChanges = changes.includes(ChangeType.INCOMING_CHANGES);
	return hasLocalChanges && hasIncomingChanges;
}

async function singlePull(pwd, caName) {
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
		"UTF-8"
	);
	return hasMerge(changes);
}

async function completePull(pwd) {
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
		"UTF-8"
	);
	return withMerges;
}

async function pull(pwd, caName) {
	if (caName) {
		return await singlePull(pwd, caName);
	}
	return await completePull(pwd);
}

export default pull;
