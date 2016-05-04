'use strict';

const fs         = require('graceful-fs');
const path       = require('path');
const Promise    = require('bluebird');
const execAsync  = Promise.promisify(require('child_process').execFile);
const rcopyAsync = Promise.promisify(require('recursive-copy'));
const copyAsync  = Promise.promisify(require('copy'));
const readAsync  = Promise.promisify(require('recursive-readdir'));
const rmrfAsync  = Promise.promisify(require('rimraf'));
const globAsync  = Promise.promisify(require('glob'));

const __amxxdir__ = 'addons/amxmodx';
const compilerFile = { darwin: 'amxxpc', linux: 'amxxpc', win32: 'amxxpc.exe' };

module.exports = (options) => {
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
				return Promise.reject(new Error('No source to compile.'));
			}

			return Promise.resolve(true);
		})
		.all([
			rcopyAsync(`${__dirname}/scripting`, 'build'),
			rcopyAsync(`${__dirname}/compiler/${process.platform}`, 'build'),
			rcopyAsync('src/scripting', 'build')
		])
		.then(() => {
			return globAsync('*.sma', { cwd: 'build' });
		})
		.then((files) => {
			console.log(files);
		})
		.catch(err => {
			throw err;
		});

	/*rmrf('{build,dist}', err => {
		if (err) throw err;

		read('src', (err, files) => {
			if (err) throw err;
			if (!files.length) return;

			// build
			rcopy(`${__dirname}/scripting`, 'build', err => {
				if (err) throw err;

				rcopy(`${__dirname}/compiler/${process.platform}`, 'build', err => {
					if (err) throw err;

					rcopy('src/scripting', 'build', err => {
						if (err) throw err;

						glob('*.sma', { cwd: 'build' }, (err, files) => {
							if (err) throw err;

							files.forEach((file) => {
								exec(`./${compilerFile[process.platform]}`, [file], { cwd: 'build' }, (err, stdout) => {
									if (err) throw err;

									copy(`${path.parse(file).name}.amxx`, `../dist/${__amxxdir__}/plugins`, { cwd: 'build' }, err => {
										if (err) throw err;
									});
								});
							});
						});
					});
				});
			});*/

			// dist
			//glob('!(scripting)/**/*', { cwd: 'src' }, (err, files) => {
			//  if (err) throw err;

			//  copy.each(files, `../dist/${__amxxdir__}`, { cwd: 'src' }, err => {
			//      if (err) throw err;
			//  });
			//});
		//});
	//});
};
