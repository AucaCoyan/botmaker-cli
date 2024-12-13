import chalk from "chalk";
import { getBmc } from "./bmcConfig.js";
import getWorkspacePath from "./getWorkspacePath.js";
import type { ClientAction } from "./types.js";

const magenta = chalk.magenta;
const cyan = chalk.cyan;
const green = chalk.green;
const gray = chalk.gray;
const italic = chalk.italic;

const ENDPOINT_TAG = `${magenta("En")}:`;
const USER_TAG = `${cyan("Us")}:`;

function getCodeActionTypeTag(ca: ClientAction): string {
    if (ca.type === "ENDPOINT") {
        return ENDPOINT_TAG;
    }
    return USER_TAG;
}

export default async function listCas(pwd: string) {
    const wpPath = await getWorkspacePath(pwd);
    const { cas } = await getBmc(wpPath);
    cas.forEach((ca) => {
        console.log(
            `${getCodeActionTypeTag(ca)} ${green(ca.name)} ${gray(italic(ca.filename))}`,
        );
    });
    console.log(`
Description: 
* ${USER_TAG} User type code action
* ${ENDPOINT_TAG} Endpoint type code action`);
    // console.table(cas.reduce((acc, ca) => ({...acc, [ca.name]:{file: ca.filename, type: ca.type}}), {}));
}
