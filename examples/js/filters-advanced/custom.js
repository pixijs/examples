const app = new PIXI.Application();
document.body.appendChild(app.view);

// Create background image
const background = PIXI.Sprite.from('examples/assets/bg_grass.jpg');
background.width = app.screen.width;
background.height = app.screen.height;
app.stage.addChild(background);

// Stop application wait for load to finish
app.stop();

fetch('examples/assets/pixi-filters/shader.frag')
    .then((res) => res.text())
    .then(onLoaded);

let filter;

// Handle the load completed
function onLoaded(data) {
    // Create the new filter, arguments: (vertexShader, framentSource)
    filter = new PIXI.Filter(null, data, {
        customUniform: 0.0,
    });

    // === WARNING ===
    // specify uniforms in filter constructor
    // or set them BEFORE first use
    // filter.uniforms.customUniform = 0.0

    // Add the filter
    background.filters = [filter];

    // Resume application update
    app.start();
}

// Animate the filter
app.ticker.add((delta) => {
    filter.uniforms.customUniform += 0.04 * delta;
});
