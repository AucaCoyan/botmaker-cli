import { getWorkspacePath } from "./path_helpers.ts";

export function getDiff(
    pwd: string,
    _ClientAction: string,
    _code: string,
    _vsCode: false,
) {
    getWorkspacePath(pwd);
}
