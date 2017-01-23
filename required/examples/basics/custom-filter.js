var app = new PIXI.Application();
document.body.appendChild(app.view);

function CustomFilter(fragmentSource) {

    PIXI.Filter.call(this,
        // vertex shader
        null,
        // fragment shader
        fragmentSource
    );
}

CustomFilter.prototype = Object.create(PIXI.Filter.prototype);
CustomFilter.prototype.constructor = CustomFilter;

// Stop the renderer until finished loading
app.stop();

var bg = PIXI.Sprite.fromImage("required/assets/bkg-grass.jpg");
bg.scale.set(1.3,1);
app.stage.addChild(bg);

PIXI.loader.add('shader', 'required/assets/basics/shader.frag');

PIXI.loader.once('complete', onLoaded);

PIXI.loader.load();

var filter;

function onLoaded (loader,res) {

    var fragmentSrc = res.shader.data;

    filter = new CustomFilter(fragmentSrc);

    bg.filters = [filter];

    app.start();
}

app.ticker.add(function() {
    filter.uniforms.customUniform += 0.04;
});
