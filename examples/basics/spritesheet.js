var loader = new PIXI.Loader();

loader.add('_assets/basics/fighter.json').load(onAssetsLoaded);

var aliens = [],
    count = 0;

// create an new instance of a pixi root
var root = new PIXI.Container(),
    // create a renderer instance.
    renderer = PIXI.autoDetectRenderer(800, 600);

// add the renderer view element to the DOM
document.getElementById('example').appendChild(renderer.view);

// create an empty container
var alienContainer = new PIXI.Container();

alienContainer.position.x = 400;
alienContainer.position.y = 300;

root.addChild(alienContainer);

function onAssetsLoaded(loader, res)
{
    // create a texture from an image path
    // add a bunch of aliens
    var frames = [];

    for (var i = 0; i < 30; i++) {
        var val = i < 10 ? '0' + i : i;

        // magically works since the spritesheet was loaded with the pixi loader
        frames.push(PIXI.Texture.fromFrame('rollSequence00' + val + '.png'));
    };

    movie = new PIXI.MovieClip(frames);

    movie.position.x = 300;
    movie.position.y = 300;

    movie.anchor.x = 0.5;
    movie.anchor.y = 0.5;
    movie.animationSpeed = 0.5;

    movie.play();

    root.addChild(movie);

    // start animating
    requestAnimationFrame(animate);
}

function animate() {
    movie.rotation += 0.01;

    // render the root container
    renderer.render(root);

    requestAnimationFrame(animate);
}
