#!/usr/bin/env node

var fs = require('fs'),
    path = require('path'),
    manifest = {};

// read each example dir
var folders = fs.readdirSync('./examples');

for (var i = 0; i < folders.length; ++i) {
    manifest[folders[i]] = JSON.parse(
        fs.readFileSync(
            path.join('examples', folders[i], 'details.json'),
            'utf8'
        )
    );
}

fs.writeFileSync('./_site/manifest.json', JSON.stringify(manifest, null, 4));
