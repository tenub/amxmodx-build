'use strict';

const exec = require('child_process').execFile;
const path = require('path');
const fs = require('graceful-fs');
const copy = require('recursive-copy');
const read = require('recursive-readdir');
const rmrf = require('rimraf');

module.exports = (amxxpath) => {
  if (amxxpath) {
    fs.access(amxxpath, fs.W_OK, err => {
      if (err) throw err;
    });
  }

  rmrf('{build,dist}', err => {
    if (err) throw err;

    read('src', (err, files) => {
      if (err) throw err;
      if (!files) return;

      copy(`${__dirname}/tools`, 'build', err => {
        if (err) throw err;

        files.map(file => {
          let fileInfo = path.parse(file);

          switch (fileInfo.ext) {
            case '.dll':
              fileInfo.dest = 'modules';
              fileInfo.dist = true;
              break;
            case '.inc':
              fileInfo.dest = 'scripting/include';
              break;
            case '.ini':
            case '.cfg':
              fileInfo.dest = 'configs';
              fileInfo.dist = true;
              break;
            case '.log': fileInfo.dest = 'logs';
              break;
            case '.sma': fileInfo.dest = 'scripting';
              break;
            case '.txt':
              fileInfo.dest = 'data/lang';
              fileInfo.dist = true;
              break;
            default    : fileInfo.dest = '';
          }

          if (fileInfo.dist) {
            copy(file, `dist/addons/amxmodx/${fileInfo.dest}`, err => {
              if (err) throw err;
            });
          }

          //copy('src', 'build');
        });
      });
    });
  });

  /*rmrf('{build,dist}', err => {
    if (err) throw err;

    copy(`${__dirname}/tools`, 'build', err => {
      if (err) throw err;

      copy('src', 'build', { dot: 'true', filter: '{include/**,*.sma}' }, err => {
        if (err) throw err;

        copy('src', 'dist/addons/amxmodx', { filter: 'modules/**' }, err => { if (err) throw err; });

        if (amxxpath) {
          copy('src', amxxpath, { filter: 'modules/**' });
        }

        glob('*.sma', { cwd: 'src' }, (err, files) => {
          if (err) throw err;

          files.forEach(filename => {
            exec('amxxpc.exe', [filename], { cwd: 'build' }, (err, stdout) => {
              if (err) throw err;

              console.log(stdout);

              copy('build', 'dist/addons/amxmodx/plugins', { filter: renameFileExt(filename, 'amxx'), overwrite: true }, err => { if (err) throw err; });

              if (amxxpath) {
                copy('build', `${amxxpath}/plugins`, { filter: renameFileExt(filename, 'amxx'), overwrite: true }, err => { if (err) throw err; });
              }
            });
          });
        });
      });
    });
  });*/
};

function removeFileExt(filename) {
  return filename.replace(/\.[^/.]+$/, '');
}

function renameFileExt(filename, ext) {
  if (ext.charAt(0) == '.') ext = ext.slice(1);

  return removeFileExt(filename) + '.' + ext;
}
