import { promisify } from "util";
import { rename as _rename } from "fs";
import { join } from "path";
import chalk from "chalk";
import getStatus, { getSingleStatusChanges } from "./getStatus.js";
const { ChangeType } = getStatus;
import { getBmc, saveBmc } from "./bmcConfig.js";
import getWorkspacePath from "./getWorkspacePath.js";
import { updateCas } from "./bmService.js";
import { getCaByNameOrPath } from "./getStatus.js";
import { formatName, getName } from "./importWorkspace.js";

const green = chalk.green;
const renameFile = promisify(_rename);

function hasIncomingChanges(changes) {
	return changes.some(
		(c) => c === ChangeType.INCOMING_CHANGES ||
			c === ChangeType.REMOVE_REMOTE ||
			c === ChangeType.NEW_CA ||
			c === ChangeType.RENAMED ||
			c === ChangeType.TYPE_CHANGED
	);
}

async function rename(pwd, caName, newName) {
	const wpPath = await getWorkspacePath(pwd);
	const { changes, status } = await getSingleStatusChanges(pwd, caName);
	if (hasIncomingChanges(changes)) {
		throw new Error("There is incoming changes. You must make a pull first.");
	}
	if (!newName || caName == newName) {
		console.log(green("You need to provide a new name por the client action."));
		return;
	}
	const { token, cas } = await getBmc(wpPath);
	const codeAction = await getCaByNameOrPath(wpPath, cas, caName);
	if (!codeAction || !codeAction.id) {
		throw new Error("The client action was not uploaded.");
	}
	const toUpdate = [{ id: codeAction.id, name: newName }];
	await updateCas(token, toUpdate);
	const baseName = formatName(newName);
	const newFileName = await getName(join(wpPath, "src"), baseName, "js");
	await renameFile(
		join(wpPath, "src", codeAction.filename),
		join(wpPath, "src", newFileName),
	);
	console.log(green(`Changed ${caName} name to ${newName}.`));
	const newCas = cas.map((ca) =>
		codeAction.id === ca.id
			? { ...ca, name: newName, filename: newFileName }
			: ca,
	);
	await saveBmc(wpPath, token, newCas);
}

export default rename;
