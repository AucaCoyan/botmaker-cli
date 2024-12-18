import { existsSync } from '@std/fs';


export function runEndpointCa(wpPath: string, args: string[]) {
  if (args.length < 2) {
    console.error('Please submmit which code action to run')
    Deno.exit(1)
  }

  const source = args[1]
  if (!existsSync(`${wpPath}/src/${source}`)) {
    console.error(`File /src/${source} doesn't exist!`)
    Deno.exit(1)
  }

  console.log(wpPath, args);
}
