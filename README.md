# cachebust

Straight forward asset fingerprinting "cachebuster" for production applications.

Requires **Node 8.5.0** or higher.

## Using cachebust

Installing

`npm install @sparkbox/cachebust`

The recommended way to use `cachebust` is to either add your
input data in `package.json` or in a `.cachebust.config` file [(see config)](#config).


## Running

`cachebust`: will create your fingerprinted assests & update fingerprinted "source file" names inside the
target "template file(s)" as specified in the package.json file or the .cachebust.config file.

If you need to restore your template files, you can run: `cachebust --restore`

## Config

### Package.json

Create a key in your `package.json` file at the root level, with source/target keys.

For example:

    {
      ...
      "cachebust": {
          "source": [
              "path/to/source/css/style.css",
              "path/to/source/js/script.js"
          ],
          "target": [
              "path/to/target/template.html"
          ]
      }
      ...
    }

### Config File

Also you may create a config file in the root of the project directory called `.cachebust.config`

This will be a JSON object like the following:

    {
    "cachebust": {
        "source": [
            "path/to/source/css/style.css",
            "path/to/source/js/script.js"
        ],
        "target": [
            "path/to/target/template.html"
        ]
      }
    }

### Direct Input

cachebust allows you to directly specify the **source** and the **target**
you'll need to pass in a comma seperated list for example:

`cachebust -s path/to/source/css/style.css,path/to/source/js/script.js -t path/to/target/template.html`

**Note** Direct input will override the config and package json cacehebust paramaters.

This will fingerprint the following files:

    - path/to/source/css/style.css
    - path/to/source/js/script.js

This will then update your template "target" file with the updated filenames:

    - path/to/target/template.html

To restore these you'll have to again pass the target and source files:

`cachebust -r -s path/to/source/css/style.css,path/to/source/js/script.js -t path/to/target/template.html`

### CLI Options

You can run `cachebust --help` for more options.

    -V, --version         output the version number
    -s, --source [files]  source file(s) to be fingerprinted; comma seperated file list
    -t, --target [files]  target file(s), template files that need the fingerprinted asset file names; comma seperated file list
    -r, --restore         copies the backup file(s) back to the original; backup file(s) are removed.
    -h, --help            output usage information

Ensure that the file lists for `-s` or `--source` and `-t` and `--target` are comma seperated.

`-s dir/path/file.ext,dir/otherpath/otherfile.ext` etc.

You can pass in one file (no comma, or mutliple files for **both** source and target).

You may also specify a single file, without a comma.

## License

The MIT License (MIT)
