import { Command } from "@cliffy/command";

export const run_cmd = new Command()
    .command("run", "Run a Botmaker Client Action Script")
    .arguments("<source:file>")
    .option("v", "<varName> <varValue> Set a context variable");
