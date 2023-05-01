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

const templatesFolder = path.resolve(__dirname, "./templates/");
const updatesiteTemplate = fs.readFileSync(path.resolve(templatesFolder, "./updatesite.ini"), "utf8");
const siteXmlTemplate = fs.readFileSync(path.resolve(templatesFolder, "./site.xml"), "utf8");
const featureXmlTemplate = fs.readFileSync(path.resolve(templatesFolder, "./feature.xml"), "utf8");
const updatesiteFolder = pluginId + "_updatesite/";

const outputArchive = archiver("zip");
outputArchive.pipe(fs.createWriteStream(path.resolve("./" + zipFileName + ".zip")));
outputArchive.append(replaceTemplatePlaceholders(updatesiteTemplate), { name: pluginId + "_updatesite.ini" });
outputArchive.append(replaceTemplatePlaceholders(siteXmlTemplate), { name: updatesiteFolder + "site.xml" });

const featureJarArchive = archiver("zip");
featureJarArchive.append(replaceTemplatePlaceholders(featureXmlTemplate), { name: "feature.xml" });
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

function replaceTemplatePlaceholders(templateString) {
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

  return templateString.replace(new RegExp(keys, "g"), function (matched) {
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
