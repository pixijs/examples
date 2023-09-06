> **Warning**
> This repository is no longer maintained. Examples have been moved into the [main website's repository](https://github.com/pixijs/pixijs.com/tree/main/src/data/examples) and is deployed to [pixijs.com/examples](https://pixijs.com/examples).

# PixiJS Examples Guidelines

This is the repository for examples using latest version of PixiJS.

The `iframe` that displays the examples is **800 * 600**, consequently please avoid creating a renderer that is larger than these dimensions.

## Running

This micro-site is built using HTML and jQuery and can be run on your local server without additional requirements.

If you change the site code within `src/main.js` or any styling within `src/main.less` you will need to rebuild the project.
After installing dependencies via `npm i`, you can perform a one off projection build via `npm run watch`, or you can start a watch process for development via `npm run watch`.

## Project Structure

All the examples are stored in the `public/examples/js` folder and loaded via the `public/examples/manifest.json` file.

All the assets are stored in `public/examples/assets`.

Every sub-folder in the examples folder corresponds to a sub-menu in the website's sidebar.

## Creating an Example

You can use the basic example as a template, it is located in [`public/examples/js/demos-basic/container.js`](public/examples/js/demos-basic/container.js).
All you need to do is copy and paste this file to where you think your example belongs within the `examples/js` folder structure, and change the contents to make a new example. You will then also need to update the `public/examples/manifest.json` to allow the menu to point to your new example.
