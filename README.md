# amxmodx-build

> Build amxmodx plugins efficiently

## Requirements

1. Windows
2. [NodeJS](https://nodejs.org/en/download) > v6.0.0

## Usage

Import the module in a project. Executing the resulting function will compile plugin source code located in the `src` directory and copy the resulting binaries to the `dist` directory and the `options.gamepath` directory, if specified.

### Example

```js
const build = require('amxmodx-build');

build({ gamepath: '/path/to/game' });
```
