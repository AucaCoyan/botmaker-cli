export function add(a: number, b: number): number {
    return a + b;
}

import { parseArgs } from "@std/cli/parse-args";
import { runEndpointCa } from "./run_cmd.ts";
import { print_help } from "./help_cmd.ts";
import { subcommand_list, type subcommands_names } from "./types.ts";

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
console.log(`you passed ${JSON.stringify(args)}`);

const args_array = args._.map((e) => e.toString())
const user_submitted: subcommands_names = args_array[0].toString();

if (!subcommand_list.includes(user_submitted)) {
    console.error(`${user_submitted} is not a command`);
    print_help();
    Deno.exit(1);
}

if (args.help === true) {
    print_help(user_submitted);
}


const CWD = Deno.cwd();

switch (user_submitted) {
    case "run":
        console.log("running run...");
        runEndpointCa(CWD, args_array);
        break;
    case "import":
        console.log("running import...");
        break;
    case "set-customer":
        console.log("running set-customer...");
        break;
    case "status":
        console.log("running status...");
        break;
    case "diff":
        console.log("running diff...");
        break;
    case "pull":
        console.log("running pull...");
        break;
    case "new":
        console.log("running new...");
        break;
    case "push":
        console.log("running push...");
        break;
    case "publish":
        console.log("running publish...");
        break;
    case "rename":
        console.log("running rename...");
        break;
    case "help":
        print_help();
        break;
    default:
        assertCannotReach(user_submitted);
        break;
}

function assertCannotReach(_x: never) {
    throw new Error("cannot reach this place in the code");
}
