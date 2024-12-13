import { promisify } from "node:util";
import { writeFile as _writeFile } from "node:fs";
import { join } from "node:path";
import chalk from "chalk";
import { exec } from "node:child_process";

import { getBmc, saveBmc } from "./bmcConfig.ts";
import getWorkspacePath from "./getWorkspacePath.ts";
import { getName, formatName } from "./importWorkspace.ts";
import { createCa } from "./bmService.ts";
import type { ClientAction } from "./types.ts";

const green = chalk.green;
const writeFile = promisify(_writeFile);

const baseEndPointCa = `const redis = req.connectRedis();

const main = async () => {
  // TODO my code here
  // const myVal = await redis.getAsync('myKey');
  // return { id : myVal };
};

main()
  .then((body) => {
    res.status(200);
    if(body != null){
      if(typeof body === 'object'){
        res.json(body);
      } else if(typeof body === 'string'){
        res.write(body);
      }
    }
  }).catch((err) => {
    res.status(500);
    res.write(\`<p style="color: red">ERROR!!!<br>\${err.message}</p>\`);
  }).finally(() => {
    res.end();
    redis.quit();
  });
`;

const baseCa = `const IS_TEST = user.get('botmakerEnvironment') === 'DEVELOPMENT';

const main = async () => {
  // TODO your code here
};

main()
  .catch(err => {
    // Code on error
    if (IS_TEST) {
      result.text(\`[ERROR] : \${err.message}\`);
    }
    bmconsole.error(\`[ERROR]: \${err.message}\`);
  })
  .finally( () => {
    // Code on finish
    result.done();
  });
`;

async function createFileAndStatus(
    wpPath,
    ca: ClientAction,
    openVsCode: boolean,
) {
    const baseName = formatName(ca.name);
    const newFileName = await getName(join(wpPath, "src"), baseName, "js");

    const filePath = join(wpPath, "src", newFileName);
    if (ca.publishedCode !== undefined) {
        await writeFile(filePath, ca.publishedCode, "UTF-8");
    } else {
        console.error("PublishedCode property is undefined!");
    }
    console.log(green(`${filePath} was added`));

    if (openVsCode) {
        exec(`code "${filePath}"`);
    }
    return {
        ...ca,
        filename: newFileName,
    };
}

type TypeOfClientAction = "ENDPOINT" | "USER";
async function newCa(
    pwd: string,
    caName: string,
    type: TypeOfClientAction,
    openVsCode = false,
) {
    const newCa: ClientAction = {
        publishedCode: type === "USER" ? baseCa : baseEndPointCa,
        name: caName,
        type: type,
    };
    const wpPath = await getWorkspacePath(pwd);
    const { token, cas } = await getBmc(wpPath);
    const resp = await createCa(token, newCa);
    const ca = JSON.parse(resp.body);
    const status = await createFileAndStatus(wpPath, ca, openVsCode);
    const newCas = cas.concat(status);
    await saveBmc(wpPath, token, newCas);
}

export default newCa;
