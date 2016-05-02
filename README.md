# amxmodx-plugins

> Build amxmodx plugins efficiently

## Requirements

1. Windows
2. [NodeJS](https://nodejs.org/en/download) > v6.0.0

## Usage

### `npm run lint`

Ensure the build process is not broken

### `npm run build`

Compile plugin source located in the `src` directory and copy the resulting binaries to the `dist` directory (optionally a local game path as well, specified in `package.json` under `amxmodx.path`)
