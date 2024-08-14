# How to install botmaker-cli

- Run `npm i -g @botmaker.org/botmaker-cli`

## Problems on windows?  
- Failed `node-gyp` rebuild and/or `python 2.7` issue  
    - Try running `npm install --global windows-build-tools` on Windows Powershell as Administrator  
    - Create `PYTHON` environment variable and set `C:\Users\YOUR_USER\.windows-build-tools\python27\python.exe` directory  
    - Run `bmc` on bash command-line
    
## Development

Install the dependencies:

```bash
pnpm install
```

### Get Started

Start the dev server:

```bash
pnpm dev
```

Build the app for production:

```bash
pnpm build
```

Preview the production build locally:

```bash
pnpm preview
```
