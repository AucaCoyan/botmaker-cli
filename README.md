## How to install botmaker-cli

- Run `npm i -g @botmaker.org/botmaker-cli`

#### Problems on windows?

- Failed `node-gyp` rebuild and/or `python 2.7` issue
  - Try running `npm install --global windows-build-tools` on Windows Powershell
    as Administrator
  - Create `PYTHON` environment variable and set
    `C:\Users\YOUR_USER\.windows-build-tools\python27\python.exe` directory
  - Run `bmc` on bash command-line

## TODO list

- cuando haces bmc import no te lee la carpeta workplaceTemplate.
- simil git
  - hacer git init cuando termina de crear un repo
  - no te deberia dejar hacer bmc pull si tenes un repo de git con unstaged changes

