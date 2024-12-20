import { existsSync } from "@std/fs/exists";

export function getWorkspacePath(dir: string) {
    if (existsSync(`${dir}/.bmc`)) {
        return dir;
    }
    if (existsSync(`${dir}/../.bmc`)) {
        return `${dir}/../.bmc`;
    }
    console.error(
        "'.bmc' file not found. Make sure you are in a botmaker workspace",
    );
    Deno.exit(1);
}
