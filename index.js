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

const outputFile = fs.createWriteStream(path.resolve("./" + zipFileName + ".zip"));
const outputArchive = archiver("zip");

outputArchive.pipe(outputFile);

const templatesFolder = path.resolve(__dirname, "./templates/");
const updatesiteTemplate = fs.readFileSync(path.resolve(templatesFolder, "./updatesite.ini"), "utf8");
const updatesiteFolder = pluginId + "_updatesite/";

outputArchive.append(replaceTemplatePlaceholders(updatesiteTemplate), {
  name: pluginId + "_updatesite.ini",
});
outputArchive.append(null, { name: updatesiteFolder });

const siteXmlTemplate = fs.readFileSync(path.resolve(templatesFolder, "./site.xml"), "utf8");

outputArchive.append(replaceTemplatePlaceholders(siteXmlTemplate), { name: updatesiteFolder + "site.xml" });

const featuresFolder = updatesiteFolder + "features/";
const pluginsFolder = updatesiteFolder + "plugins/";

outputArchive.append(null, { name: featuresFolder });
outputArchive.append(null, { name: pluginsFolder });

const featureJarArchive = archiver("zip");
const featureXmlTemplate = fs.readFileSync(path.resolve(templatesFolder, "./feature.xml"), "utf8");

featureJarArchive.append(replaceTemplatePlaceholders(featureXmlTemplate), { name: "feature.xml" });
featureJarArchive.finalize();

outputArchive.append(featureJarArchive, { name: featuresFolder + pluginId + ".feature_" + pluginVersion + ".jar" });
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
