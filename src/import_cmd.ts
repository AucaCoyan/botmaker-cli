import { decode } from "@zaubrik/djwt";
import type { BMCFile, ClientAction, Context, JWTBotmaker } from "./types.ts";
import { join } from "jsr:@std/path@^1.0.8/join";
import { exists, existsSync } from "@std/fs/exists";
import { getAllCas, getCustomerContext } from "./bm_http_client.ts";
import { ensureDir, ensureDirSync } from "@std/fs/ensure-dir";
import { copy } from "@std/fs/copy";

export async function importWorkspace(pwd: string, args: string[]) {
    if (args.length < 2) {
        console.error("Please submmit a token to import a workspace");
        Deno.exit(1);
    }
    const apiToken = args[1];

    console.log(pwd);
    let jwt_token: JWTBotmaker;
    try {
        jwt_token = decode(apiToken)[1] as JWTBotmaker;
        console.log(`token: ${JSON.stringify(jwt_token)}`);
    } catch (_error) {
        console.error(
            "bmc: Invalid jwt token. Please generate a api token from https://go.botmaker.com/#/platforms in 'Botmaker API - Credenciales'",
        );
        Deno.exit(1);
    }
    const { businessId } = jwt_token;
    const workspacePath = join(pwd, businessId);
    if (existsSync(workspacePath)) {
        console.error(
            `cannot create directory '${join(pwd, businessId)}': File exists`,
        );
        Deno.exit(1);
    }

    console.log("looking for context...");
    const contextReq = await (async () => {
        try {
            return await getCustomerContext(apiToken);
        } catch (_e) {
            console.error(
                `Cound not found a context. Please check if exist some chat for the business ${businessId}`,
            );
            Deno.exit(1);
        }
    })();
    const context: Context = await contextReq.json();
    console.log(typeof context);

    console.log("looking for client actions...");
    const casReq = await (async () => {
        try {
            return await getAllCas(apiToken);
        } catch (e) {
            console.error("Cound obtain the client actions.");
            throw e;
        }
    })();

    const cas: ClientAction[] = await casReq.json();

    console.log("creating workspace...");
    ensureDirSync(workspacePath);

    const bmc_binary_path = join(".");
    const template_folder_path = join(bmc_binary_path, "workspaceTemplate");
    await copy(template_folder_path, workspacePath, { overwrite: true });
    await Deno.writeTextFile(
        join(workspacePath, "context.json"),
        JSON.stringify(context, null, 4),
    );

    await ensureDir(join(workspacePath, "src"));

    const srcFolder = join(workspacePath, "src");

    for (const ca of cas) {
        const baseName = formatName(ca.name);
        ca.filename = await getName(srcFolder, baseName, "js");
        await Deno.writeTextFile(
            join(srcFolder, ca.filename),
            ca.unPublishedCode || ca.publishedCode,
        );
    }
    const bmc: BMCFile = {
        cas,
        token: apiToken,
    };
    await Deno.writeTextFile(join(workspacePath, ".bmc"), JSON.stringify(bmc));
}

function formatName(name: string): string {
    return (
        name
            .normalize("NFD")
            // biome-ignore lint/suspicious/noMisleadingCharacterClass: saco todos los code points aunque no haya
            .replace(/[\u0300-\u036f]/g, "") // remove acents
            .replace(/\W+/g, "_") // remplace spaces with underscore
            .replace(/[\u{0080}-\u{FFFF}]/gu, "") // remove all non ascii chars
            .toLowerCase()
    );
}

async function getName(
    folder: string,
    basename: string,
    extension: string,
    num = 1,
): Promise<string> {
    const counterPart = num !== undefined ? `_${num}` : "";
    const finalName = `${basename}${counterPart}.${extension}`;
    const finalPath = join(folder, finalName);
    const isTaken = await exists(finalPath);
    if (isTaken && num > 100) {
        throw new Error(`could not found a space for '${basename}'`);
    }
    if (isTaken) {
        const nextNum = num !== undefined ? num + 1 : 0;
        return getName(folder, basename, extension, nextNum);
    }
    return finalName;
}
