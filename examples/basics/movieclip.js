
// create a new loader
var loader = new PIXI.Loader();

loader.add('spritesheet','_assets/mc.json');
// use callback
loader.once('complete',onAssetsLoaded);

//begin load
loader.load();

// holder to store the explosions
var explosions = [];

var count = 0;

// create an new instance of a pixi stage
var stage = new PIXI.Container();

// create a renderer instance.
renderer = PIXI.autoDetectRenderer(800, 600);

// add the renderer view element to the DOM
document.getElementById('example').appendChild(renderer.view);

    function onAssetsLoaded()
    {
        // create an array to store the textures
        var explosionTextures = [];

        for (var i=0; i < 26; i++)
        {
             var texture = PIXI.Texture.fromFrame("Explosion_Sequence_A " + (i+1) + ".png");
             explosionTextures.push(texture);
        };

        for (var i = 0; i < 50; i++)
        {
            // create an explosion MovieClip
            var explosion = new PIXI.MovieClip(explosionTextures);

            explosion.position.x = Math.random() * 800;
            explosion.position.y = Math.random() * 600;
            explosion.anchor.x = 0.5;
            explosion.anchor.y = 0.5;

            explosion.rotation = Math.random() * Math.PI;

            explosion.scale.set(0.75 + Math.random() * 0.5);

            explosion.gotoAndPlay(Math.random() * 27);

            stage.addChild(explosion);
        }

        // start animating
        requestAnimationFrame( animate );
    }

    function animate() {
        renderer.render(stage);

        requestAnimationFrame(animate);
    }
