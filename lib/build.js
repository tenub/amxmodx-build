const path = require('path');
const fs = require('fs-promise');
const execFile = require('child-process-promise').execFile;
const glob = require('glob-promise');
const chalk = require('chalk');

const __amxxdir__ = 'addons/amxmodx';
const compilerFile = { darwin: 'amxxpc', linux: 'amxxpc', win32: 'amxxpc.exe' };

module.exports = (options) => {
	const settings = Object.assign({}, options);

	return fs.access(settings.gamepath, fs.W_OK)
		.catch((err) => {
			if (err instanceof TypeError || (err.code && (err.code === 'EACCES' || err.code === 'ENOENT' || err.code === 'EPERM'))) {
				settings.gamepath = null;
				return console.warn('%s Invalid or inaccessible gamepath specified.', chalk.bold.yellow('WARN'));
			}

			return Promise.reject(err);
		})
		.then(() => Promise.all([
			fs.emptyDir('build'),
			fs.emptyDir('dist')
		]))
		.then(() => glob('**/*', { cwd: 'src', nodir: true }))
		.then((files) => {
			if (!files.length) {
				return Promise.reject(new Error('No files found in src directory.'));
			}

			return glob('src/addons/amxmodx/scripting/*.sma');
		})
		.then((files) => {
			if (!files.length) {
				console.info('%s No source to compile. Check source directory structure if incorrect. Continuing with file copy.', chalk.bold.inverse('INFO'));
				return Promise.resolve();
			}

			// handle compile
			return new Promise((resolve, reject) => {
				/*return Promise.all([
					fs.copy(`${__dirname}/scripting`, 'build'),
					fs.copy(`${__dirname}/compiler/${process.platform}`, 'build'),
					fs.copy('src/addons/amxmodx/scripting', 'build', { dot: true })
				])
				.then(files => Promise.map(files, file => execAsync(`./${compilerFile[process.platform]}`, [file], { cwd: 'build' })
					.then(stdout => {
						console.log(stdout);

						return copyAsync(`${path.parse(file).name}.amxx`, `../dist/${__amxxdir__}/plugins`, { cwd: 'build' });
					})))*/
				return resolve();
			});
		})
		.then(() => glob('**/*', { cwd: 'src', nodir: true, ignore: '**/scripting/**' }))
		.then((files) => Promise.all(files.map(file => fs.copy(`src/${file}`, `dist/${file}`, { clobber: true }))))
		//.then(() => (settings.gamepath ? fs.copy('dist', settings.gamepath, { clobber: true }) : Promise.resolve()))
		.catch((err) => {
			console.error('%s %s', chalk.bold.red('ERR!'), err);
			process.exit(1);
		});
};
