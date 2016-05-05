'use strict';

const fs = require('graceful-fs');
const path = require('path');
const Promise = require('bluebird');
const execAsync = Promise.promisify(require('child_process').execFile);
const rcopyAsync = Promise.promisify(require('recursive-copy'));
const copyAsync = Promise.promisify(require('copy'));
const copyEachAsync = Promise.promisify(require('copy').each);
const readAsync = Promise.promisify(require('recursive-readdir'));
const rmrfAsync = Promise.promisify(require('rimraf'));
const globAsync = Promise.promisify(require('glob'));

const __amxxdir__ = 'addons/amxmodx';
const compilerFile = { darwin: 'amxxpc', linux: 'amxxpc', win32: 'amxxpc.exe' };

module.exports = (options) => {
	options = Object.assign({}, options);

	if (options.gamepath) {
		fs.access(options.gamepath, fs.W_OK, err => {
			if (err) throw err;
		});
	}

	rmrfAsync('{build,dist}')
		.then(() => {
			return readAsync('src');
		})
		.then((files) => {
			if (!files.length) {
				throw new Error('No source to compile.');
			}

			return globAsync('!(scripting)/**/*', { cwd: 'src' })
				.then(files => {
					return copyEachAsync(files, `../dist/${__amxxdir__}`, { cwd: 'src' });
				});
		})
		.then(() => {
			return Promise.all([
				rcopyAsync(`${__dirname}/scripting`, 'build'),
				rcopyAsync(`${__dirname}/compiler/${process.platform}`, 'build'),
				rcopyAsync('src/scripting', 'build', { dot: true })
			]);
		})
		.then(() => {
			return globAsync('*.sma', { cwd: 'build' });
		})
		.then(files => {
			return Promise.map(files, file => {
				return execAsync(`./${compilerFile[process.platform]}`, [file], { cwd: 'build' })
					.then(stdout => {
						console.log(stdout);

						return copyAsync(`${path.parse(file).name}.amxx`, `../dist/${__amxxdir__}/plugins`, { cwd: 'build' });
					});
			});
		})
		.catch(err => {
			throw err;
		});
};
