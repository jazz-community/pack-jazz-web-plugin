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

const updatesiteTemplate = fs.readFileSync(path.resolve(__dirname, "./templates/updatesite.ini"), "utf8");
const updatesiteOutput = updatesiteTemplate.replaceAll("$pluginId$", pluginId);
const updatesiteFolder = pluginId + "_updatesite/";

outputArchive.append(updatesiteOutput, {
  name: pluginId + "_updatesite.ini",
});
outputArchive.append(null, { name: updatesiteFolder });

const siteXmlTemplate = fs.readFileSync(path.resolve(__dirname, "./templates/site.xml"), "utf8");
const siteXmlOutput = siteXmlTemplate.replaceAll("$pluginId$", pluginId).replaceAll("$pluginVersion$", pluginVersion);

outputArchive.append(siteXmlOutput, { name: updatesiteFolder + "site.xml" });

const featuresFolder = updatesiteFolder + "features/";
const pluginsFolder = updatesiteFolder + "plugins/";

outputArchive.append(null, { name: featuresFolder });
outputArchive.append(null, { name: pluginsFolder });

const featureJarArchive = archiver("zip");

featureJarArchive.finalize();

outputArchive.append(featureJarArchive, { name: featuresFolder + pluginId + ".feature_" + pluginVersion + ".jar" });

outputArchive.finalize();

process.stdout.write(zipFileName);

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
