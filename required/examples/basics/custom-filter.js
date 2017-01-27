var app = new PIXI.Application();
document.body.appendChild(app.view);

// Create background image
var background = PIXI.Sprite.fromImage("required/assets/bkg-grass.jpg");
background.width = app.renderer.width;
background.height = app.renderer.height;
app.stage.addChild(background);

// Stop application wait for load to finish
app.stop();

PIXI.loader.add('shader', 'required/assets/basics/shader.frag')
    .load(onLoaded);

var filter;

// Handle the load completed
function onLoaded (loader,res) {
    
    // Create the new filter, arguments: (vertexShader, framentSource)
    filter = new PIXI.Filter(null, res.shader.data);

    // Add the filter
    background.filters = [filter];

    // Resume application update
    app.start();
}

// Animate the filter
app.ticker.add(function(delta) {
    filter.uniforms.customUniform += 0.04 / delta;
});
