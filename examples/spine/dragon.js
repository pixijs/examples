var renderer = PIXI.autoDetectRenderer(800, 600);
document.body.appendChild(renderer.view);

// create the root of the scene graph
var stage = new PIXI.Container();

// load spine data
PIXI.loader
    .add('dragon', '_assets/spine/dragon.json')
    .load(onAssetsLoaded);

var dragon = null;

function onAssetsLoaded(loader,res)
{
    // instantiate the spine animation
    dragon = new PIXI.spine.Spine(res.dragon.spineData);
    dragon.skeleton.setToSetupPose();
    dragon.update(0);
    dragon.autoUpdate = false;

    // create a container for the spine animation and add the animation to it
    var dragonCage = new PIXI.Container();
    dragonCage.addChild(dragon);

    // measure the spine animation and position it inside its container to align it to the origin
    var localRect = dragon.getLocalBounds();
    dragon.position.set(-localRect.x, -localRect.y);

    // now we can scale, position and rotate the container as any other display object
    var scale = Math.min((renderer.width * 0.7) / dragonCage.width, (renderer.height * 0.7) / dragonCage.height);
    dragonCage.scale.set(scale, scale);
    dragonCage.position.set((renderer.width - dragonCage.width) * 0.5, (renderer.height - dragonCage.height) * 0.5);

    // add the container to the stage
    stage.addChild(dragonCage);

    // once position and scaled, set the animation to play
    dragon.state.setAnimationByName(0, 'flying', true);

    animate();
}

function animate() {
    requestAnimationFrame(animate);

    // update the spine animation, only needed if dragon.autoupdate is set to false
    dragon.update(0.01666666666667); // HARDCODED FRAMERATE!
    renderer.render(stage);
}
