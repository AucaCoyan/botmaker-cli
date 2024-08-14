#!/usr/bin/env node

import main from "../src/index.ts";
// Delete the 0 and 1 argument (node and script.js)
const args = process.argv.splice(process.execArgv.length + 2);

main(args);
