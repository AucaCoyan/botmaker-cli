import { join } from "node:path";
import { exists } from "node:fs";

async function getWorkspacePath(pwd: string) {
	console.log("getting workspace path..");
	if (exists(join(pwd, ".bmc"))) {
		return pwd;
	}
	if (await exists(join(pwd, "..", ".bmc"))) {
		return join(pwd, "..");
	}
	throw new Error(
		"'.bmc' file not found. Make sure you are in a botmaker workspace",
	);
}

export default getWorkspacePath;
