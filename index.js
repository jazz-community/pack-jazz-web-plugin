#!/usr/bin/env node

"use strict";

const path = require("path");
const fs = require("fs");
const archiver = require("archiver");
const packageJson = require(path.resolve("./package.json"));

const placeholders = {
  pluginId: packageJson.zipJazzWebPlugin.pluginId,
  pluginName: packageJson.name,
  pluginVersion: `${packageJson.version}_${getFormattedDate(new Date())}`,
  pluginDescription: packageJson.description,
  pluginAuthor: packageJson.author,
  pluginLicense: packageJson.license,
};

const pluginFiles = packageJson.zipJazzWebPlugin.pluginFiles;
const zipFileName = `${placeholders.pluginId}_${placeholders.pluginVersion}`;
const updatesiteFolder = `${placeholders.pluginId}_updatesite/`;

const outputArchive = archiver("zip");
outputArchive.pipe(fs.createWriteStream(path.resolve(`./${zipFileName}.zip`)));
appendTemplateToArchive(outputArchive, "updatesite.ini", placeholders.pluginId + "_");
appendTemplateToArchive(outputArchive, "site.xml", updatesiteFolder);

const featureJarArchive = archiver("zip");
appendTemplateToArchive(featureJarArchive, "feature.xml");
featureJarArchive.finalize();

const pluginJarArchive = archiver("zip");
pluginFiles.forEach(function (fileOrDirectory) {
  if (fileOrDirectory.slice(-1) === "/") {
    pluginJarArchive.directory(fileOrDirectory);
  } else {
    pluginJarArchive.file(fileOrDirectory);
  }
});
pluginJarArchive.finalize();

outputArchive.append(featureJarArchive, {
  name: `${updatesiteFolder}features/${placeholders.pluginId}.feature_${placeholders.pluginVersion}.jar`,
});
outputArchive.append(pluginJarArchive, { name: `${updatesiteFolder}plugins/${zipFileName}.jar` });
outputArchive.finalize();

process.stdout.write(zipFileName);

function appendTemplateToArchive(archive, templateName, outputPrefix = "") {
  archive.append(replacePlaceholders(getTemplate(templateName)), { name: outputPrefix + templateName });
}

function getTemplate(templateName) {
  return fs.readFileSync(path.resolve(__dirname, `./templates/${templateName}`), "utf8");
}

function replacePlaceholders(inputString) {
  const keys = Object.keys(placeholders)
    .map(function (key) {
      return "\\$" + key + "\\$";
    })
    .join("|");

  return inputString.replace(new RegExp(keys, "g"), function (matched) {
    return placeholders[matched.substring(1, matched.length - 1)];
  });
}

function getFormattedDate(date) {
  return (
    date.getFullYear() +
    zeroFill(date.getMonth() + 1) +
    zeroFill(date.getDate()) +
    "-" +
    zeroFill(date.getHours()) +
    zeroFill(date.getMinutes())
  );
}

function zeroFill(i) {
  return (i < 10 ? "0" : "") + i;
}
