import { getBmc } from "./bmcConfig.js";
import getStatus from "./getStatus.js";
import getWorkspacePath from "./getWorkspacePath.js";
import { diffLines } from "diff";
import chalk from "chalk";

const green = chalk.green;
const red = chalk.red;

import { join } from "node:path";
import { promisify } from "node:util";
import {
    mkdtemp as _mkdtemp,
    writeFile as _writeFile,
    chmod as _chmod,
} from "node:fs";
import { tmpdir } from "node:os";
import utils from "./utils.js";
import { exec } from "node:child_process";
import { diff3Merge } from "node-diff3";
import { EOL } from "node:os";

const mkdtemp = promisify(_mkdtemp);
const writeFile = promisify(_writeFile);
const chmod = promisify(_chmod);

function lineCounter(text) {
    let count = 1;
    let pos = 0;
    while (true) {
        pos = text.indexOf("\n", pos);
        if (pos >= 0) {
            ++count;
            pos += 1;
        } else return count;
    }
}

const openChanges = async (compare, state, caName) => {
    if (!compare) {
        console.log("No changes");
        return;
    }
    const tmpFileId1 = utils.makeid(5);
    const tmpFileId2 = utils.makeid(5);
    const tmpFileName = state.N || state.n || caName || "unknow";
    const tmpFolderPath = await mkdtemp(join(tmpdir(), "bm-cli"));
    const tmpFilePaht1 = join(tmpFolderPath, `${tmpFileName}_${tmpFileId1}.js`);
    const tmpFilePaht2 = join(tmpFolderPath, `${tmpFileName}_${tmpFileId2}.js`);

    await writeFile(tmpFilePaht1, compare[0] || "", "UTF-8");
    await writeFile(tmpFilePaht2, compare[1] || "", "UTF-8");
    await chmod(tmpFilePaht1, 0o444); // Read only
    await chmod(tmpFilePaht2, 0o444); // Read only
    exec(`code -d "${tmpFilePaht1}" "${tmpFilePaht2}"`);
};

function getMerge(local: string, original: string, remote: string) {
    const merger = diff3Merge(
        local.split(/\r?\n/),
        original.split(/\r?\n/),
        remote.split(/\r?\n/),
        {
            excludeFalseConflicts: false,
        },
    );
    let conflict = false;
    let lines = [];
    for (let i = 0; i < merger.length; i++) {
        const item = merger[i];
        if (item.ok) {
            lines = lines.concat(item.ok);
        } else {
            conflict = true;
            lines = lines.concat(
                ["<<<<<<<"],
                item.conflict.a,
                ["======="],
                item.conflict.b,
                [">>>>>>>"],
            );
        }
    }
    return {
        conflict: conflict,
        result: lines.join(EOL),
    };
}

const showChanges = (compare) => {
    if (!compare) {
        return;
    }
    const f1 = compare[0] || "";
    const f2 = compare[1] || "";
    if (f1 === f2) {
        console.log(green("They are equals."));
        return;
    }
    const maxLines = Math.max(lineCounter(f1), lineCounter(f2));
    const pad = maxLines.toString().length;
    const withPad = (text) => text.toString().padStart(pad);
    const diferences = diffLines(f1, f2);
    let aLineCount = 1;
    let bLineCount = 1;
    diferences.forEach((p, pi) => {
        const lines = p.value.split(/\r?\n/);
        const firstPart = pi === 0;
        const lastPart = pi === diferences.length - 1;
        if (!lastPart && lines[lines.length - 1] === "") {
            lines.pop();
        }
        if (p.added) {
            lines.forEach((l, i) =>
                console.log(
                    green(` ${withPad(aLineCount + i)} ${withPad("+")} | ${l}`),
                ),
            );
            aLineCount += lines.length;
        } else if (p.removed) {
            lines.forEach((l, i) =>
                console.log(
                    red(` ${withPad("-")} ${withPad(bLineCount + i)} | ${l}`),
                ),
            );
            bLineCount += lines.length;
        } else {
            if (lines.length > 4) {
                if (!firstPart) {
                    lines
                        .slice(0, 2)
                        .forEach((l, i) =>
                            console.log(
                                grey(
                                    ` ${withPad(aLineCount + i)} ${withPad(bLineCount + i)} | ${l}`,
                                ),
                            ),
                        );
                }
                console.log(grey("..."));
                if (!lastPart) {
                    const from = lines.length - 2;
                    lines
                        .slice(from, from + 2)
                        .forEach((l, i) =>
                            console.log(
                                grey(
                                    ` ${withPad(aLineCount + from + i)} ${withPad(bLineCount + from + i)} | ${l}`,
                                ),
                            ),
                        );
                }
            } else {
                lines.forEach((l, i) =>
                    console.log(
                        grey(
                            ` ${withPad(aLineCount + i)} ${withPad(bLineCount + i)} | ${l}`,
                        ),
                    ),
                );
            }
            aLineCount += lines.length;
            bLineCount += lines.length;
        }
    });
};

async function getDiff(pwd: string, caName, code, vsCode = false) {
    const wpPath = await getWorkspacePath(pwd);
    const { token, cas } = await getBmc(wpPath);
    const ca = await getStatus.getCaByNameOrPath(wpPath, cas, caName);
    const status = await getStatus.getSigleStatus(wpPath, ca, token);
    const changes = getStatus.getChangeByCode(code, status);
    if (!vsCode) {
        showChanges(changes);
    } else {
        openChanges(changes, status, caName);
    }
}
getDiff.getMerge = getMerge;

export { getMerge, getDiff };
