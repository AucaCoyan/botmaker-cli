import { decode } from "@zaubrik/djwt";
import type { ClientAction, Context, JWTBotmaker } from "./types.ts";
import { join } from "jsr:@std/path@^1.0.8/join";
import { existsSync } from "@std/fs/exists";
import { getAllCas, getCustomerContext } from "./bm_http_client.ts";
import { ensureDirSync } from "@std/fs/ensure-dir";

export async function importWorkspace(pwd: string, args: string[]) {
    if (args.length < 2) {
        console.error('Please submmit a token to import a workspace')
        Deno.exit(1)
    }
    const apiToken = args[1]

    console.log(pwd)
    let jwt_token: JWTBotmaker
    try {
        jwt_token = decode(apiToken)[1]
        console.log(`token: ${JSON.stringify(jwt_token)}`)
    } catch (_error) {
        console.error("bmc: Invalid jwt token. Please generate a api token from https://go.botmaker.com/#/platforms in 'Botmaker API - Credenciales'");
        Deno.exit(1)
    }
    const { businessId } = jwt_token;
    const workpath = join(pwd, businessId)
    if (existsSync(workpath)) {
        console.error(`cannot create directory '${join(pwd, businessId)}': File exists`);
        Deno.exit(1)
    }

    console.log("looking for context...");
    const contextReq = await (async () => {
        try {
            return await getCustomerContext(apiToken);
        } catch (_e) {
            console.error(
                `Cound not found a context. Please check if exist some chat for the business ${businessId}`,
            );
            Deno.exit(1)
        }
    })();
    const context: Context = await contextReq.json()

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
    ensureDirSync(workpath);







}
