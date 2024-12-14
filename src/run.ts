import { createInterface } from "node:readline";
import {
    readFile as _readFile,
    writeFile as _writeFile,
    exists as _exists,
} from "node:fs";
import rp from "request-promise";
import { promisify } from "node:util";
import { caRunner } from "./caRunner.js";
import { join } from "node:path";
import resolveRenderer from "./resultRenderer.js";
import chalk from "chalk";
import getWorkspacePath from "./getWorkspacePath.js";
import { getBmc } from "./bmcConfig.js";
import express, { urlencoded, json } from "express";
import { getCaByNameOrPath } from "./getStatus.js";
import caEndpointRunner from "./caEndpointRunner.js";
import type { ClientAction, CodeAnHelpers, Context } from "./types.js";

const yellow = chalk.yellow;
const green = chalk.green;
const red = chalk.red;

const readFile = promisify(_readFile);
const writeFile = promisify(_writeFile);
const exists = promisify(_exists);

function doubleArrayToObject(array) {
    const obj = {};
    for (let index = 0; index < array.length / 2; index++) {
        obj[array[index]] = array[index + 1];
    }
    return obj;
}

const require_core_action_pattern =
    /require\((?:(?:'([a-zA-Z0-9_-]*))'|(?:"([a-zA-Z0-9_-]*)"))\)/g;

async function getCodeAnHelpers(wpPath: string, cas: ClientAction[], ca: ClientAction): Promise<CodeAnHelpers> {
    const filePath = join(wpPath, "src", ca.filename);
    const helpers = {};

    const code = await readFile(filePath, "utf8");
    const match = require_core_action_pattern.exec(code);

    while (match != null) {
        const req = match[1] || match[2];
        if (!req) continue;
        const posibleReqFile =
            cas.find((c) => c.name === req)?.filename || `${req}.js`;
        const posibleUtils = join(wpPath, "src", posibleReqFile);
        if (await exists(posibleUtils)) {
            const helper = await readFile(posibleUtils, "utf8");
            const parsedHelper = `({${helper.replace(/function /, "").replace(/function /g, ",")}})\n//# sourceURL=${posibleUtils}`;
            helpers[req] = { code: parsedHelper, source: posibleUtils };
        }
    }
    return { code, helpers, filePath };
}

async function runEndpointCa(wpPath, token, cas: ClientAction[], ca: ClientAction, port) {
    const app = express();
    app.use(urlencoded({ extended: true }));
    app.use(json());
    // app.use(express.raw());
    // app.use(express.text());
    const rl = createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    app.use((req, res, next) => {
        const start = new Date().getTime();
        console.log(yellow(` Req [${req.method}] ${req.path}`));
        res.on("finish", () => {
            const end = new Date().getTime();
            if (res.statusCode >= 200 && res.statusCode < 300) {
                console.log(
                    green(` Res [${res.statusCode}] on ${end - start}ms`),
                );
            } else {
                console.log(
                    red(` Res [${res.statusCode}] on ${end - start}ms`),
                );
            }
        });
        next();
    });

    function runTest() {
        return new Promise((r) => rl.question("Press ENTER to run test", r)).then(
            async () => {
                console.log("Calling service...");
                try {
                    const ret = await rp({ uri: `http://localhost:${port}` });
                    console.log(green(ret));
                } catch (err) {
                    console.error(red(err.message));
                }
                return runTest();
            }
        );
    }

    app.use(async (req, res) => {
        const { code, helpers, filePath } = await getCodeAnHelpers(
            wpPath,
            cas,
            ca,
        );
        caEndpointRunner(req, res, token, code, helpers, filePath);
    });

    app.listen(port, () => {
        console.log(green(`Listening in http://localhost:${port}`));
        console.log("Press Ctrl + C to stop the server.");
        runTest();
    });

    rl.on("close", () => {
        console.log("\nBYE BYE !!!");
        process.exit(0);
    });
}

async function runUserCa(wpPath: string, token, cas: ClientAction[], ca: ClientAction, vars, params, volatile) {
    const { code, helpers, filePath } = await getCodeAnHelpers(wpPath, cas, ca);
    const contextJson = await readFile(join(wpPath, "context.json"), "utf8");
    const context: Context = JSON.parse(contextJson);
    const commandVars = doubleArrayToObject(vars);
    const commandParameters = doubleArrayToObject(params);
    context.userData.variables = {
        ...context.userData.variables,
        ...commandVars,
    };
    context.params = { ...context.params, ...commandParameters };
    const startTime = new Date().getTime();
    const result = await new Promise((fulfill, reject) => {
        try {
            caRunner(code, context, helpers, fulfill, token, filePath);
        } catch (err) {
            reject(err);
        }
    });
    const endTime = new Date().getTime() - startTime;

    if (result) {
        if (result.error && result.stack) {
            const line = result.stack.split("\n")[1] || "";
            const found = line.matchAll(/\<anonymous\>(:\d+:\d+)/g).next();
            console.error(red(` ❌ Fail in ${endTime}ms`));
            if (found.value) {
                console.error(
                    red(
                        `${result.stack.split("\n")[0]} at ${file}${found.value[1]}`,
                    ),
                );
            } else {
                console.error(red(result.stack));
            }
        } else if (result.error) {
            console.error(red(` ❌ Fail in ${endTime}ms`));
            console.error(red(result.error));
        } else {
            const resultRendered = resolveRenderer(result.resultState, context);
            console.log(resultRendered);
            console.log(green(` ✓ Success in ${endTime}ms`));
            if (!volatile) {
                const newContext = {
                    ...context,
                    userData: {
                        ...context.userData,
                        variables: {
                            ...context.userData.variables,
                            ...result.resultState.user,
                        },
                    },
                };
                await writeFile(
                    join(wpPath, "context.json"),
                    JSON.stringify(newContext, null, 4),
                    "utf-8",
                );
            }
            //console.log(JSON.stringify(result));
        }
    }
    process.exit(0);
}

async function run(
    pwd: string,
    file,
    { vars, params, volatile, endpoint, port = 7070 },
) {
    console.log("running!");
    // console.log(file);
    const wpPath = await getWorkspacePath(pwd);
    const { token, cas } = await getBmc(wpPath);
    const ca = await getCaByNameOrPath(wpPath, cas, file);
    const type = endpoint ? "ENDPOINT" : ca.type || "USER";
    if (type === "USER") {
        await runUserCa(wpPath, token, cas, ca, vars, params, volatile);
    } else if (type === "ENDPOINT" || type === "SCHEDULE") {
        await runEndpointCa(wpPath, token, cas, ca, port);
    } else {
        throw new Error(`'${type}' invalid client action type.`);
    }
}

export default run;
