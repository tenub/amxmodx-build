'use strict';

const fs = require('fs');
const exec = require('child_process').execFile;
const pkg = require('./package.json');
const copy = require('recursive-copy');
const glob = require('glob');
const rmrf = require('rimraf');


module.exports = () => {
	if (pkg.amxmodx && pkg.amxmodx.path) {
		fs.access(pkg.amxmodx.path, fs.W_OK, err => {
			if (err) throw err;
		});

		var amxxPath = pkg.amxmodx.path;
	}

	rmrf('{build,dist}', err => {
		if (err) throw err;

		copy('src/tools', 'build', err => {
			if (err) throw err;

			copy('src', 'build', { dot: 'true', filter: '{include/**,*.sma}' }, err => {
				if (err) throw err;

				copy('src', 'dist/addons/amxmodx', { filter: 'modules/**' }, err => { if (err) throw err; });

				if (amxxPath) {
					copy('src', amxxPath, { filter: 'modules/**' });
				}

				glob('*.sma', { cwd: 'src' }, (err, files) => {
					if (err) throw err;

					files.forEach(filename => {
						exec('amxxpc.exe', [filename], { cwd: 'build' }, (err, stdout) => {
							if (err) throw err;

							console.log(stdout);

							copy('build', 'dist/addons/amxmodx/plugins', { filter: renameFileExt(filename, 'amxx'), overwrite: true }, err => { if (err) throw err; });

							if (amxxPath) {
								copy('build', `${amxxPath}/plugins`, { filter: renameFileExt(filename, 'amxx'), overwrite: true }, err => { if (err) throw err; });
							}
						});
					});
				});
			});
		});
	});
};

function removeFileExt(filename) {
	return filename.replace(/\.[^/.]+$/, '');
}

function renameFileExt(filename, ext) {
	if (ext.charAt(0) == '.') ext = ext.slice(1);

	return removeFileExt(filename) + '.' + ext;
}
