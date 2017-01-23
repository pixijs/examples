var app = new PIXI.Application();
document.body.appendChild(app.view);

app.stop();

PIXI.loader
    .add('spritesheet', 'required/assets/mc.json')
    .load(onAssetsLoaded);

function onAssetsLoaded()
{
    // create an array to store the textures
    var explosionTextures = [],
        i;

    for (i = 0; i < 26; i++)
    {
         var texture = PIXI.Texture.fromFrame('Explosion_Sequence_A ' + (i+1) + '.png');
         explosionTextures.push(texture);
    }

    for (i = 0; i < 50; i++)
    {
        // create an explosion MovieClip
        var explosion = new PIXI.extras.AnimatedSprite(explosionTextures);

        explosion.position.x = Math.random() * 800;
        explosion.position.y = Math.random() * 600;
        explosion.anchor.x = 0.5;
        explosion.anchor.y = 0.5;

        explosion.rotation = Math.random() * Math.PI;

        explosion.scale.set(0.75 + Math.random() * 0.5);

        explosion.gotoAndPlay(Math.random() * 27);

        app.stage.addChild(explosion);
    }

    // start animating
    app.start();
}
