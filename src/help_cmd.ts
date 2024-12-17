import type { subcommands_names } from "./types.ts";

type help_cmds = "top" | subcommands_names;

export function print_help(cmd_help: help_cmds = "top") {
    console.log(`Usage: bmc <command> [options]

    Commands:
        bmc run < source >                  Run a Botmaker Client Action Script[aliases: r]
        bmc import < apiToken >             Import a new bussiness from a token[aliases: i]
        bmc set - customer < customerId >   Load context for a customer[aliases: c]
        bmc status[caName]                  Show change status[aliases: s]
        bmc diff < caName > <code>          Diff client actions states[aliases: d]
        bmc pull[caName]                    Pull incoming changes
        bmc new < caName >                  Create a new client action[aliases: n]
        bmc push[caName]                    Push changes in client action
        bmc publish < caName >              Publish changes in client action
        bmc rename < caName > <newName>     Renames the given client action

    Options:
        -h, --help                          Show help[boolean]
        --version                           Show version number[boolean]
`);
    if (cmd_help !== "top") {
        console.log(`cmd help was passed! ${cmd_help}`);
    }
}
