import { assertCannotReach } from "./errors.ts";
import type { subcommands_names } from "./types.ts";

type help_cmds = "root" | subcommands_names;

export function print_help(cmd_help: help_cmds = "root") {
    switch (cmd_help) {
        case "root":
            console.log(`Usage: bmc <command> [options]

    Commands:
        bmc run < source >                  Run a Botmaker Client Action Script[aliases: r]
        bmc import < apiToken >             Import a new bussiness from a token[aliases: i]
        bmc set-customer < customerId >   Load context for a customer[aliases: c]
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
            break;
        case "run":
            console.log(`bmc run <source>

Run a Botmaker Client Action Script

Options:
  -h, --help               Show help                                   [boolean]
      --version            Show version number                         [boolean]
  -v, --var                <varName> <varValue> Set a context variable
  -p, --param              <paramName> <paramValue> Set a param
      --volatile           Will not presist the state
      --endpoint           Force to run as endpoint
      --port <portNumber>  Change endpoint port number`);
            break;
        case "import":
            break;
        case "set-customer":
            break;
        case "status":
            break;
        case "diff":
            break;
        case "pull":
            break;
        case "new":
            break;
        case "push":
            break;
        case "publish":
            break;
        case "rename":
            break;
        case "help":
            print_help("root");
            break;
        default:
            assertCannotReach(cmd_help);
            break;
    }
}
