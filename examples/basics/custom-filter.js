var renderer = PIXI.autoDetectRenderer(800, 600);
document.body.appendChild(renderer.view);

// create the root of the scene graph
var stage = new PIXI.Container();


function CustomFilter(fragmentSource)
{

    PIXI.AbstractFilter.call(this,
        // vertex shader
        null,
        // fragment shader
        fragmentSource,
        // set the uniforms
        {
            customUniform : {type : '1f', value : 0}
        }
    );
}

CustomFilter.prototype = Object.create(PIXI.AbstractFilter.prototype);
CustomFilter.prototype.constructor = CustomFilter;


var bg = PIXI.Sprite.fromImage("_assets/bkg-grass.jpg");
bg.scale.set(1.3,1);
stage.addChild(bg);

PIXI.loader.add('shader','_assets/basics/shader.frag');

PIXI.loader.once('complete',onLoaded);

PIXI.loader.load();

var filter;

function onLoaded (loader,res) {

    var fragmentSrc = res.shader.data;

    filter = new CustomFilter(fragmentSrc);

    bg.filters = [filter];

    animate();
}

function animate() {

    filter.uniforms.customUniform.value += 0.04;

    renderer.render(stage);
    requestAnimationFrame( animate );
}
