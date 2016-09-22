const path = require('path');
const fs = require('fs-promise');
const copy = require('recursive-copy');
const execFile = require('child-process-promise').execFile;
const glob = require('glob-promise');
const chalk = require('chalk');

const compilerFile = { darwin: 'amxxpc', linux: 'amxxpc', win32: 'amxxpc.exe' };

module.exports = (options) => {
	const settings = Object.assign({}, options);

	return fs.access(settings.gamepath, fs.W_OK)
		.catch((err) => {
			if (err instanceof TypeError || (err.code && (err.code === 'EACCES' || err.code === 'ENOENT' || err.code === 'EPERM'))) {
				settings.gamepath = null;
				return console.warn(chalk.bold.yellow('Invalid gamepath specified. Skipping file copy to this directory.\r\n'));
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

			return glob('*.sma', { cwd: 'src/addons/amxmodx/scripting' });
		})
		.then((files) => {
			if (!files.length) {
				console.info(chalk.bold.inverse('No source to compile.'));
				return Promise.resolve();
			}

			return new Promise((resolve, reject) => Promise.all([
				copy(`${__dirname}/scripting`, 'build', { overwrite: true }),
				copy(`${__dirname}/compiler/${process.platform}`, 'build', { overwrite: true }),
				copy('src/addons/amxmodx/scripting', 'build', { overwrite: true })
			])
				.then(() => Promise.all(files.map((file) => execFile(`./${compilerFile[process.platform]}`, [file], { cwd: 'build' }))))
				.then((plist) => {
					plist.forEach(proc => console.info(proc.stdout));
					return glob('*.amxx', { cwd: 'build' });
				})
				.then(plugins => (plugins.length ? Promise.all(plugins.map(plugin => copy(`build/${plugin}`, `dist/addons/amxmodx/plugins/${plugin}`, { overwrite: true }))) : reject(new Error('Compilation failure.'))))
				.then(() => resolve(true))
				.catch(err => reject(err)));
		})
		.then(() => glob('**/*', { cwd: 'src', nodir: true, ignore: '**/scripting/**' }))
		.then(files => Promise.all(files.map(file => copy(`src/${file}`, `dist/${file}`, { overwrite: true }))))
		.then(() => (settings.gamepath ? copy('dist', settings.gamepath, { overwrite: true }) : Promise.resolve()))
		.catch((err) => {
			console.error(chalk.bold.red(err));
			process.exit(1);
		});
};
