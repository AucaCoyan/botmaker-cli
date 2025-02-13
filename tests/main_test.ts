import { assertEquals } from "@std/assert";
import { importWorkspace } from "../src/import_cmd.ts";
import { CWD } from "../src/path_helpers.ts";
import { existsSync } from "@std/fs/exists";
import { join } from "jsr:@std/path@^1.0.8/join";
import { emptyDirSync } from "@std/fs";

Deno.test(function help() {
    assertEquals(true, true);
});

Deno.test(async function test_importWorkspace() {
    // Part 1: Setup
    const bot_name = "melihistorialdemensajes";

    // check if the folder exists
    const workspacePath = join(CWD, bot_name);
    if (existsSync(workspacePath)) {
        console.warn("Test Folder found. Deleting...");
        // delete if so
        emptyDirSync(workspacePath);
        Deno.removeSync(workspacePath);
    }

    // make sure the env var is found
    const apiToken = Deno.env.get("BM_access_token");
    if (apiToken === undefined) {
        throw Error(
            "BM_access_token env var not found. Please setup a token to test this.",
        );
    }

    // import the workspace with Deno bmc
    await importWorkspace(CWD, ["bmc", apiToken]);
    // import the workspace with Javascript bmc
    const bmc_js_cmd = new Deno.Command(
        "C:/Users/AucaMaillo/.bun/bin/bmc.exe",
        {
            // args: ["--help"],
            args: ["import", apiToken],
        },
    );
    const process = bmc_js_cmd.spawn();

    // manually stop process "yes" will never end on its own
    setTimeout(() => {
        process.kill();
    }, 100);

    // Part 2: Test

    // Part 3: Teardown
});
