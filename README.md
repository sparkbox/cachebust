# cachebust

Straight forward asset fingerprinting "cachebuster" for production applications.

## Using cachebust

Installing

`npm install cachebust`

Will create your fingerprinted assests & replace those names within the
target template files.

`cachebust`

If you need to restore your template files, you can run:

`cachebust restore`

### Direct input

cachebust allows you to directly specify the **source** and the **target**
you'll need to pass in a comma seperated list for example:

`cachebust source=path/to/source/css/style.css,path/to/source/js/script.js target=path/to/target/template.html`

This will fingerprint the following files:

    - path/to/source/css/style.css
    - path/to/source/js/script.js

This will then update your template "target" file with the updated filenames:

    - path/to/target/template.html

### package.json

You're also allowed to create a key in your `package.json` file, with source/target keys.

For example:

    "main": "index.js",
    "scripts": {
      "test": "echo \"Error: no test specified\" && exit 1"
    },
    "cachebust": {
        "target": [
            'path/to/source/css/style.css',
            'path/to/source/js/script.js',
        ],
        "source": [
            'path/to/target/template.html'
        ]
    }
    ...

### Config File

Also you may create a config file in the root of the project directory called `.cachebust.json`

This will be a JSON object like the following:

    {
      "cachebust": {
          "target": [
              'path/to/source/css/style.css',
              'path/to/source/js/script.js',
          ],
          "source": [
              'path/to/target/template.html'
          ]
      }
    }
