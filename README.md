# pixi-examples

Repository for the pixi.js v3 examples, available online [here](ghio).

## Running

You can view the examples online [here][ghio]. If you want to run it locally you can clone the repository
or download the zip file. Then just run a server pointing to the root of this repo.

For example using the node [http-server][httpserver] module:

```js
git clone git@github.com:pixijs/examples.git
cd examples/

npm i && npm start
```

## Contributing

Ideally you will need to have [node][node] setup on your machine.

Then you can add a new example, modify the section's `_details.json`, and rebuild the manifest file:

```js
node generateManifest.js
```
Your local copy of the website should then be updated automatically.

[node]: http://nodejs.org/
[ghio]: http://pixijs.github.io/examples
[httpserver]: https://www.npmjs.com/package/http-server
