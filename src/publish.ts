import getStatus, { getSingleStatusChanges } from "./getStatus.js";

import { getBmc, saveBmc } from "./bmcConfig.js";
import getWorkspacePath from "./getWorkspacePath.js";
import { publishCa } from "./bmService.js";
import chalk from "chalk";
import type { ClientAction } from "./types.js";

const green = chalk.green;

const { ChangeType } = getStatus;

const hasIncomingChanges = (changes) => {
	return changes.some(
		(c) =>
			c === ChangeType.INCOMING_CHANGES ||
			c === ChangeType.REMOVE_REMOTE ||
			c === ChangeType.NEW_CA ||
			c === ChangeType.RENAMED ||
			c === ChangeType.TYPE_CHANGED,
	);
};

function hasLocalChanges(changes) {
	return changes.some((c) => c === ChangeType.LOCAL_CHANGES);
}

function isUnpublish(changes) {
	return changes.some((c) => c === ChangeType.UNPUBLISHED);
}

async function publish(pwd: string, caName) {
	const wpPath = await getWorkspacePath(pwd);
	const { changes, status } = await getSingleStatusChanges(pwd, caName);

	if (hasIncomingChanges(changes)) {
		throw new Error("There is incoming changes. You must make a pull first.");
	}
	if (hasLocalChanges(changes)) {
		throw new Error("There is local changes. You must make a push first.");
	}
	if (!isUnpublish(changes)) {
		console.log(green("Nothing to publish!"));
		return;
	}

	const { token, cas } = await getBmc(wpPath);
	await publishCa(token, status.id);
	const newCas: ClientAction[] = cas.map((ca) =>
		status.id === ca.id
			? { ...ca, publishedCode: ca.unPublishedCode, unPublishedCode: null }
			: ca,
	);
	await saveBmc(wpPath, token, newCas);
}

export default publish;
