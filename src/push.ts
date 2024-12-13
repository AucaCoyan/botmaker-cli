import {
    ChangeType,
    getSingleStatusChanges,
    getStatusChanges,
} from "./getStatus.js";

import { getBmc, saveBmc } from "./bmcConfig.js";
import getWorkspacePath from "./getWorkspacePath.js";
import { updateCas } from "./bmService.js";
import chalk from "chalk";

const green = chalk.green;
const red = chalk.red;
const yellow = chalk.yellow;
const italic = chalk.italic;
const grey = chalk.gray;

import publish from "./publish.ts";

const maxLength = 100000;

function checkClientActionLength(text: string, caName) {
    if (text.length > maxLength) {
        console.log(
            red(
                `The code action ${caName} is too big. The maximum size is 100000 characters.`,
            ),
        );
        throw new Error(`Error trying to push changes in ${caName}`);
    }
}

function getPushChanges(status, changes) {
    const hasLocalChanges = changes.includes(ChangeType.LOCAL_CHANGES);
    if (!hasLocalChanges) {
        return;
    }

    return {
        id: status.id,
        unPublishedCode: status.f,
    };
}

async function applyPush(token: string, changes) {
    await updateCas(token, changes);
}

function hasIncomingChanges(changes) {
    return changes.some(
        (c) =>
            c === ChangeType.INCOMING_CHANGES ||
            c === ChangeType.REMOVE_REMOTE ||
            c === ChangeType.NEW_CA ||
            c === ChangeType.RENAMED ||
            c === ChangeType.TYPE_CHANGED,
    );
}

async function singlePush(pwd: string, caName: string) {
    const wpPath = await getWorkspacePath(pwd);
    const { changes, status } = await getSingleStatusChanges(pwd, caName);
    if (hasIncomingChanges(changes)) {
        throw new Error(
            "There is incoming changes. You must make a pull first.",
        );
    }
    const pushChanges = getPushChanges(status, changes);
    if (!pushChanges) {
        console.log(green("Nothing to push!. No local changes found."));
        return;
    }
    checkClientActionLength(pushChanges.unPublishedCode, caName);
    const { token, cas } = await getBmc(wpPath);
    await applyPush(token, [pushChanges]);
    const newCas = cas.map((ca) =>
        pushChanges.id === ca.id
            ? { ...ca, unPublishedCode: pushChanges.unPublishedCode }
            : ca,
    );
    await saveBmc(wpPath, token, newCas);
}

async function completePush(pwd) {
    const wpPath = await getWorkspacePath(pwd);
    const { token, cas } = await getBmc(wpPath);
    const changesGenerator = getStatusChanges(pwd);
    const toPush = [];
    for await (const statucChanges of changesGenerator) {
        const { status, changes } = statucChanges;
        if (hasIncomingChanges(changes)) {
            throw new Error(
                "There is incoming changes you must make an pull first.",
            );
        }
        const pushChanges = getPushChanges(status, changes);
        if (pushChanges) {
            checkClientActionLength(pushChanges.unPublishedCode, status.n);
            toPush.push(pushChanges);
        }
    }
    if (toPush.length === 0) {
        console.log(green("Nothing to push!. No local changes found."));
        return;
    }
    console.log(yellow("Uploading changes for:"));
    toPush.forEach((update) => {
        const ca = cas.find((c) => c.id === update.id);
        console.log(yellow(` * ${italic(ca.filename)} `) + grey(ca.name));
    });
    await applyPush(token, toPush);
    const newCas = cas.map((ca) => {
        const updated = toPush.find((cap) => cap.id === ca.id);
        return updated
            ? { ...ca, unPublishedCode: updated.unPublishedCode }
            : ca;
    });
    await saveBmc(wpPath, token, newCas);
}

type BoolAsString = "TRUE" | "FALSE";

async function push(pwd: string, caName: string, forPublish: BoolAsString) {
    if (caName) {
        await singlePush(pwd, caName);
    } else {
        await completePush(pwd);
    }
    if (forPublish === "TRUE") {
        await publish(pwd, caName);
    }
}

export default push;
