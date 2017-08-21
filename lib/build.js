const fs = require('fs-promise');
const copy = require('recursive-copy');
const { execFile } = require('child-process-promise');
const glob = require('glob-promise');
const chalk = require('chalk');

const __compiler = {
	darwin: 'amxxpc',
	linux: 'amxxpc',
	win32: 'amxxpc.exe'
};

module.exports = async (options = {}) => {
	let { gamepath } = options;

	try {
		await fs.access(gamepath, fs.W_OK);
	} catch (err) {
		if (err instanceof TypeError ||
			(err.code && (
				err.code === 'EACCES' ||
				err.code === 'ENOENT' ||
				err.code === 'EPERM'
			))
		) {
			gamepath = null;
			console.warn(chalk.bold.yellow('Invalid gamepath specified. Skipping file copy to this directory.\r\n'));
		}
	}

	try {
		const srcFiles = await glob('**/*', {
			cwd: 'src',
			nodir: true
		});

		if (!srcFiles.length) {
			return console.warn(chalk.bold.yellow('No files found in src directory.'));
		}

		const scriptFiles = await glob('*.sma', {
			cwd: 'src/addons/amxmodx/scripting'
		});

		if (!scriptFiles.length) {
			console.info(chalk.bold.inverse('No source to compile.'));
		}

		await Promise.all([
			fs.emptyDir('build'),
			fs.emptyDir('dist')
		]);

		await Promise.all([
			copy(`${__dirname}/scripting`, 'build'),
			copy(`${__dirname}/compiler/${process.platform}`, 'build')
		]);

		await copy('src/addons/amxmodx/scripting', 'build', {
			overwrite: true
		});

		const plist = await Promise.all(scriptFiles.map((file) => (
			execFile(`./${__compiler[process.platform]}`, [file], {
				cwd: 'build'
			})
		)));

		plist.forEach(({ stdout }) => {
			console.info(stdout);
		});

		const plugins = await glob('*.amxx', {
			cwd: 'build'
		});

		if (!plugins.length) {
			throw new Error('Compilation failure.');
		}

		await Promise.all(plugins.map((plugin) => (
			copy(`build/${plugin}`, `dist/addons/amxmodx/plugins/${plugin}`, {
				overwrite: true
			})
		)));

		const files = await glob('**/*', {
			cwd: 'src',
			nodir: true,
			ignore: '**/scripting/**'
		});

		await Promise.all(files.map((file) => (
			copy(`src/${file}`, `dist/${file}`, {
				overwrite: true
			})
		)));

		if (gamepath) {
			await copy('dist', gamepath, {
				overwrite: true
			});
		}

		return process.exit(0);
	} catch (err) {
		console.error(chalk.bold.red(err));

		return process.exit(1);
	}
};
