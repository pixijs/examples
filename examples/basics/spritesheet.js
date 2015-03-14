var renderer = PIXI.autoDetectRenderer(800, 600);
document.getElementById('example').appendChild(renderer.view);

// create the root of the scene graph
var stage = new PIXI.Container();

PIXI.loader
    .add('_assets/basics/fighter.json')
    .load(onAssetsLoaded);

var movie;

function onAssetsLoaded()
{
    // create a texture from an image path
    // add a bunch of aliens
    var frames = [];

    for (var i = 0; i < 30; i++) {
        var val = i < 10 ? '0' + i : i;

        // magically works since the spritesheet was loaded with the pixi loader
        frames.push(PIXI.Texture.fromFrame('rollSequence00' + val + '.png'));
    }

    movie = new PIXI.MovieClip(frames);

    movie.position.x = 300;
    movie.position.y = 300;

    movie.anchor.x = 0.5;
    movie.anchor.y = 0.5;
    movie.animationSpeed = 0.5;

    movie.play();

    stage.addChild(movie);

    animate();
}

function animate() {
    movie.rotation += 0.01;

    // render the stage container
    renderer.render(stage);

    requestAnimationFrame(animate);
}
