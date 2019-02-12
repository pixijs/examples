# Pixi examples guidelines: #

This is the new repository for the pixi examples.
In the previous one, each example was a JavaScript file, we moved away from this and it is now an HTML file that can be opened on its own.

The iframe that displays the examples is **800 * 600**, consequently please avoid creating a renderer that is larger than these dimensions.


## How to run the project ##

This micro-site is built using HTML and jQuery and can be run on your local server without additional requirements.

## Project structure ##

All the examples are stored in the ``` examples/js ``` folder and loaded via the ``` examples/manifest.json ``` file.

All the assets are stored in ``` examples/assets ```.

Every sub-folder in the examples folder corresponds to a sub-menu in the website's sidebar.

## How to create an example ##

You can use the basic example as a template, it is located in [```examples/js/basics/basic.js```](examples/js/basics/basic.js).
All you need to do is copy and paste this file to where you think your example belongs within the examples/js folder structure, and change the contents to make a new example. You will then also need to update the examples/manifest.json to allow the menu to point to your new example.
