var app = new PIXI.Application();
document.body.appendChild(app.view);

app.stop();

PIXI.loader
    .add('required/assets/basics/fighter.json')
    .load(onAssetsLoaded);

var movie;

function onAssetsLoaded()
{
    // create an array of textures from an image path
    var frames = [];

    for (var i = 0; i < 30; i++) {
        var val = i < 10 ? '0' + i : i;

        // magically works since the spritesheet was loaded with the pixi loader
        frames.push(PIXI.Texture.fromFrame('rollSequence00' + val + '.png'));
    }


    // create a MovieClip (brings back memories from the days of Flash, right ?)
    movie = new PIXI.extras.AnimatedSprite(frames);

    /*
     * A MovieClip inherits all the properties of a PIXI sprite
     * so you can change its position, its anchor, mask it, etc
     */
    movie.position.set(300);
    movie.anchor.set(0.5);
    movie.animationSpeed = 0.5;
    movie.play();

    app.stage.addChild(movie);

    app.start();
}

app.ticker.add(function() {
    movie.rotation += 0.01;
});
