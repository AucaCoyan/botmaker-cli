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
  - no te deberia dejar hacer bmc pull si tenes un repo de git con unstaged
    changes
- quiero que sea compliant con el bmc... pero no reproducir bugs es dificil el
  balance, supongo que tendre que separar la API en compliant y non compliant. O
  sino hacer nuevos comandos (o flags)

# `Combo`: botmaker-cli Drop in replacement

Para que sea un drop in replacement, puedo

- usar git submodules para llamar al commit de botmaker que necesito
- correr todos los tests con versiones actualizadas del codigo
- reinterpretar las nuevas versiones para que sirva.
- usar mi combo.lock
