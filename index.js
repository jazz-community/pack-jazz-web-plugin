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
outputArchive.finalize();

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

process.stdout.write(zipFileName);
