var app = new PIXI.Application();
document.body.appendChild(app.view);

// Create background image
var background = PIXI.Sprite.fromImage("required/assets/bkg-grass.jpg");
background.width = app.renderer.width;
background.height = app.renderer.height;
app.stage.addChild(background);

PIXI.loader.add('shader', 'required/assets/basics/shader.frag')
    .load(onLoaded);

var filter;

// Handle the load completed
function onLoaded (loader,res) {
    
    // Create the new filter, arguments: (vertexShader, framentSource)
    filter = new PIXI.Filter(null, res.shader.data);

    // Add the filter
    background.filters = [filter];
}

// Animate the filter
app.ticker.add(function() {
    filter.uniforms.customUniform += 0.04;
});
