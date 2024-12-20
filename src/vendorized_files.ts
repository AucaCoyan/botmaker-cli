export const dot_vscode_launch_json = {
    version: "0.2.0",
    configurations: [
        {
            type: "node",
            request: "launch",
            name: "Debug",
            cwd: "${workspaceFolder}",
            runtimeExecutable: "bmc",
            skipFiles: ["<node_internals>/**"],
            runtimeArgs: ["run", "${file}"],
            console: "integratedTerminal",
        },
    ],
};
export const dot_vscode_settings_json = {
    "editor.tabSize": 4,
    "javascript.suggest.autoImports": false,
};
