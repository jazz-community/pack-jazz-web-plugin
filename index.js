#!/usr/bin/env node

'use strict';

const path = require('path');
const fs = require('fs');
const archiver = require('archiver');
const core = require('@actions/core');
const packageJson = require(path.resolve('./package.json'));

const placeholders = {
  pluginId: packageJson.packJazzWebPlugin.pluginId,
  pluginName: packageJson.name,
  pluginVersion: `${packageJson.version}_${process.env.BUILD_TIMESTAMP || getFormattedDate(new Date())}`,
  pluginDescription: packageJson.description,
  pluginAuthor: packageJson.author,
  pluginLicense: packageJson.license,
};
const pluginFiles = packageJson.packJazzWebPlugin.pluginFiles || ['META-INF/', 'resources/', 'plugin.xml'];
const zipFileName = `${placeholders.pluginId}_${placeholders.pluginVersion}.zip`;
const updatesiteFolder = `${placeholders.pluginId}_updatesite/`;

const outputArchive = archiver('zip');
outputArchive.pipe(fs.createWriteStream(path.resolve(`./${zipFileName}`)));
appendTemplateToArchive(outputArchive, 'updatesite.ini', placeholders.pluginId + '_');
appendTemplateToArchive(outputArchive, 'site.xml', updatesiteFolder);

const featureJarArchive = archiver('zip');
appendTemplateToArchive(featureJarArchive, 'feature.xml');
featureJarArchive.finalize();

const pluginJarArchive = archiver('zip');
pluginFiles.forEach((fileOrDirectory) =>
  fileOrDirectory.slice(-1) === '/'
    ? pluginJarArchive.directory(fileOrDirectory)
    : pluginJarArchive.file(fileOrDirectory)
);
pluginJarArchive.finalize();

outputArchive.append(featureJarArchive, {
  name: `${updatesiteFolder}features/${placeholders.pluginId}.feature_${placeholders.pluginVersion}.jar`,
});
outputArchive.append(pluginJarArchive, {
  name: `${updatesiteFolder}plugins/${placeholders.pluginId}_${placeholders.pluginVersion}.jar`,
});
outputArchive.finalize();

if (process.env['GITHUB_ACTIONS']) {
  // Set the output file name for use in GitHub Actions
  core.setOutput('output_file', zipFileName);
}

process.stdout.write(zipFileName);

function appendTemplateToArchive(archive, templateName, outputPrefix = '') {
  const template = fs.readFileSync(path.resolve(__dirname, `./templates/${templateName}`), 'utf8');
  const keys = Object.keys(placeholders)
    .map((key) => '\\$' + key + '\\$')
    .join('|');
  const templateOutput = template.replace(
    new RegExp(keys, 'g'),
    (match) => placeholders[match.substring(1, match.length - 1)]
  );

  archive.append(templateOutput, { name: outputPrefix + templateName });
}

function getFormattedDate(date) {
  const padZero = (i) => (i < 10 ? '0' : '') + i;

  return (
    date.getFullYear() +
    padZero(date.getMonth() + 1) +
    padZero(date.getDate()) +
    '-' +
    padZero(date.getHours()) +
    padZero(date.getMinutes())
  );
}
