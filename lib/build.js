const path = require('path');
const fs = require('fs-promise');
const execFile = require('child-process-promise').execFile;
const glob = require('glob-promise');
const chalk = require('chalk');

const __amxxdir__ = 'addons/amxmodx';
const compilerFile = { darwin: 'amxxpc', linux: 'amxxpc', win32: 'amxxpc.exe' };

module.exports = (options) => {
	const settings = Object.assign({}, options);

	return new Promise(resolve => (settings.gamepath ? resolve(fs.access(settings.gamepath, fs.W_OK)) : resolve()))
		.catch(() => {
			settings.invalidGamepath = true;
			return console.warn('%s Invalid or inaccessible directory specified.', chalk.bold.yellow('WARN'));
		})
		.then(() => Promise.all([
			fs.emptyDir('build'),
			fs.emptyDir('dist')
		]))
		.then(() => glob('src/**/*'))
		.then((files) => {
			/*if (!files.length) {
				console.warn('No source to compile.');
				process.exit(0);
			}*/

			console.log(files);

			//return globAsync('!(scripting)/**/*', { cwd: 'src' })
			//	.then(files => copyEachAsync(files, `../dist/${__amxxdir__}`, { cwd: 'src' }));
		})
		/*.then(() => Promise.all([
			rcopyAsync(`${__dirname}/scripting`, 'build'),
			rcopyAsync(`${__dirname}/compiler/${process.platform}`, 'build'),
			rcopyAsync('src/scripting', 'build', { dot: true })
		]))
		.then(() => globAsync('*.sma', { cwd: 'build' }))
		.then(files => Promise.map(files, file => execAsync(`./${compilerFile[process.platform]}`, [file], { cwd: 'build' })
			.then(stdout => {
				console.log(stdout);

				return copyAsync(`${path.parse(file).name}.amxx`, `../dist/${__amxxdir__}/plugins`, { cwd: 'build' });
			})))
		.then(() => {
			if (options.gamepath) {
				return rcopyAsync('dist', options.gamepath, { overwrite: true });
			}
		})*/
		.catch((err) => {
			console.error(err);
			process.exit(1);
		});
};
