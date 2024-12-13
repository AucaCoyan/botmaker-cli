import path from "node:path";
import { promisify } from "node:util";
import fs from "node:fs";
import { getCustomerContext } from "./bmService";
import { getBmc } from "./bmcConfig.js";
import getWorkspacePath from "./getWorkspacePath.js";
import type { Context } from "./types.js";

const writeFile = promisify(fs.writeFile);

export async function setCustomer(pwd: string, customerId: string) {
    const wpPath = await getWorkspacePath(pwd);
    const { token } = await getBmc(wpPath);
    console.log("loading context...");
    const contextReq = await (async () => {
        try {
            return await getCustomerContext(token, customerId);
        } catch (e) {
            console.error(
                `Cound not found a context for cutomer id = ${customerId}`,
            );
            throw e;
        }
    })();
    const context: Context = JSON.parse(contextReq.body);
    await writeFile(
        path.join(wpPath, "context.json"),
        JSON.stringify(context, null, 4),
        "UTF-8",
    );
    const name =
        `${context.userData.FIRST_NAME || ""} ${context.userData.LAST_NAME || ""}`.trim();
    console.log(`now you are: ${name || customerId}`);
}
