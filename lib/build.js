'use strict';

const exec = require('child_process').execFile;
const path = require('path');
const fs = require('graceful-fs');
const rcopy = require('recursive-copy');
const copy = require('copy');
const read = require('recursive-readdir');
const rmrf = require('rimraf');
const glob = require('glob');

const __amxxdir__ = 'addons/amxmodx';
const compilerFile = { darwin: 'amxxpc', linux: 'amxxpc', win32: 'amxxpc.exe' };

module.exports = (options) => {
	if (options.gamepath) {
		fs.access(options.gamepath, fs.W_OK, err => {
			if (err) throw err;
		});
	}

	rmrf('{build,dist}', err => {
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
								exec(compilerFile[process.platform], [file], { cwd: 'build' }, (err, stdout) => {
									if (err) throw err;

									copy(`${path.parse(file).name}.amxx`, `../dist/${__amxxdir__}/plugins`, { cwd: 'build' }, err => {
										if (err) throw err;
									});
								});
							});
						});
					});
				});
			});

			// dist
			glob('!(scripting)/**/*', { cwd: 'src' }, (err, files) => {
				if (err) throw err;

				copy.each(files, `../dist/${__amxxdir__}`, { cwd: 'src' }, err => {
					if (err) throw err;
				});
			});
		});
	});
};
