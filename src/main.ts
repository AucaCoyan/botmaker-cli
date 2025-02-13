export function add(a: number, b: number): number {
    return a + b;
}

import { parseArgs } from "@std/cli/parse-args";
import { runClientAction } from "./run_cmd.ts";
import { print_help } from "./help_cmd.ts";
import { subcommand_list, type subcommands_names } from "./types.ts";
import { importWorkspace } from "./import_cmd.ts";
import { getDiff } from "./diff_cmd.ts";
import { assertCannotReach } from "./errors.ts";

/// parse the arguments given by the user
const args = parseArgs(Deno.args, {
    alias: {
        run: "r",
        import: "i",
        "set-customer": "c",
        status: "s",
        diff: "d",
        new: "n",
    },
    boolean: ["help"],
});

if (import.meta.main) {
    console.debug(`you passed ${JSON.stringify(args)}`);

    /// if no args, print the root help
    if (args._.length === 0) {
        console.debug("printing help");
        print_help("root");
    }

    /// only run if it's called this script as main. Not by importing this file
    /// https://stackoverflow.com/questions/61829941/proper-way-to-define-a-main-script-in-deno
    const args_array = args._.map((e) => e.toString());
    const user_submitted: subcommands_names =
        args_array[0].toString() as subcommands_names;

    /// check the command exists
    if (!subcommand_list.includes(user_submitted)) {
        console.error(`${user_submitted} is not a command`);
        print_help("root");
        Deno.exit(1);
    }

    /// print the help specified with `--help`
    if (args.help === true) {
        print_help(user_submitted);
    }

    /// get the current working directory
    const CWD = Deno.cwd();

    /// switch on every possible command. Throw if not found
    switch (user_submitted) {
        case "run":
            console.debug("running run...");
            runClientAction(CWD, args_array);
            break;
        case "import":
            console.debug("running import...");
            importWorkspace(CWD, args_array);
            break;
        case "set-customer":
            console.debug("running set-customer...");
            break;
        case "status":
            console.debug("running status...");
            break;
        case "diff":
            console.debug("running diff...");
            getDiff(CWD, "", "", false);
            break;
        case "pull":
            console.debug("running pull...");
            break;
        case "new":
            console.debug("running new...");
            break;
        case "push":
            console.debug("running push...");
            break;
        case "publish":
            console.debug("running publish...");
            break;
        case "rename":
            console.debug("running rename...");
            break;
        case "help":
            print_help("root");
            break;
        default:
            assertCannotReach(user_submitted);
            break;
    }
}
