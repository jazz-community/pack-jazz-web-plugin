# Package Jazz Web Plugins

Use this script to package JavaScript web plugins for extending the IBM Jazz Platform.

## Install

```
npm install @jazz-community-org/pack-jazz-web-plugin --save-dev
```

## Configure

The script will take the following from the `package.json` in the root of your plugin:

```json
{
  "name": "your-plugin-name",
  "version": "your-plugin-version",
  "description": "your-plugin-description",
  "author": "your-plugin-author",
  "license": "your-plugin-license",
  "packJazzWebPlugin": {
    "pluginId": "your-plugin-id (the same as in your plugin.xml)",
    "pluginFiles": ["..."]
  }
}
```

The `"pluginFiles"` list is used to specify all the files and directories that should be included in the plugin package. Directories are specified by adding a trailing slash `/`. It can be left out and will default to `["META-INF/", "resources/", "plugin.xml"]`.

Additionally, the environment variable `BUILD_TIMESTAMP` can be used to set a custom timestamp in the created zip file name. Without this, a timestamp will be created from the current time.

If running in a GitHub workflow, the zip file name will be stored in `${{ steps.STEP_ID.outputs.output_file }}` and can be used to reference the file in a following step.

## Run

Make sure that your current working directory is the root of your web plugin.

### Option 1

Add the script to your `package.json`:

```json
"scripts": {
  "pack": "pack-jazz-web-plugin"
}
```

Then run the command:

```
npm run pack
```

### Option 2

Alternatively, you can run the package directly using npx:

```
npx pack-jazz-web-plugin
```

Executing the package using npx has the advantage that the console output will only contain the created zip file name. This can be used to locate the file in the next step of your CI process.

## Output

A zip file is created with the settings and plugin files configured in the `package.json`. If the script is successful, the name of the zip file will be outputted to the console.

This is the structure of the output file:

```
id_version_date-time.zip
├─ id_updatesite
│  ├─ features
│  │  ├─ id.feature_version_date-time.jar
│  │  │  ├─ feature.xml
│  ├─ plugins
│  │  ├─ id_version_date-time.jar
│  │  │  ├─ **/* (all plugin files)
│  ├─ site.xml
└─ id_updatesite.ini
```
