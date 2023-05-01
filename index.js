#!/usr/bin/env node

"use strict";

const path = require("path");
const fs = require("fs");
const archiver = require("archiver");
const packageJson = require(path.resolve("./package.json"));

const pluginId = packageJson.zipJazzWebPlugin.pluginId;
const pluginName = packageJson.name;
const pluginVersion = packageJson.version + "_" + getFormattedDate(new Date());
const pluginDescription = packageJson.description;
const pluginAuthor = packageJson.author;
const pluginLicense = packageJson.license;
const pluginFiles = packageJson.zipJazzWebPlugin.pluginFiles;
const zipFileName = pluginId + "_" + pluginVersion;
const updatesiteFolder = pluginId + "_updatesite/";

const outputArchive = archiver("zip");
outputArchive.pipe(fs.createWriteStream(path.resolve("./" + zipFileName + ".zip")));
outputArchive.append(replacePlaceholders(getTemplate("updatesite.ini")), { name: pluginId + "_updatesite.ini" });
outputArchive.append(replacePlaceholders(getTemplate("site.xml")), { name: updatesiteFolder + "site.xml" });

const featureJarArchive = archiver("zip");
featureJarArchive.append(replacePlaceholders(getTemplate("feature.xml")), { name: "feature.xml" });
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
  name: updatesiteFolder + "features/" + pluginId + ".feature_" + pluginVersion + ".jar",
});
outputArchive.append(pluginJarArchive, { name: updatesiteFolder + "plugins/" + zipFileName + ".jar" });
outputArchive.finalize();

process.stdout.write(zipFileName);

function getTemplate(templateName) {
  return fs.readFileSync(path.resolve(__dirname, "./templates/" + templateName), "utf8");
}

function replacePlaceholders(inputString) {
  const placeholders = new Map([
    ["$pluginId$", pluginId],
    ["$pluginName$", pluginName],
    ["$pluginVersion$", pluginVersion],
    ["$pluginDescription$", pluginDescription],
    ["$pluginAuthor$", pluginAuthor],
    ["$pluginLicense$", pluginLicense],
  ]);
  const keys = Array.from(placeholders.keys())
    .map(function (key) {
      return key.replace(/\$/g, "\\$");
    })
    .join("|");

  return inputString.replace(new RegExp(keys, "g"), function (matched) {
    return placeholders.get(matched);
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
