const app = new PIXI.Application({ antialias: true });
document.body.appendChild(app.view);

app.stop();

const scale = 0.3;
var target = new PIXI.Point();
var armatureDisplay;

const animationNames = [
    "PARAM_ANGLE_X",
    "PARAM_ANGLE_Y",
    "PARAM_ANGLE_Z",
    "PARAM_EYE_BALL_X",
    "PARAM_EYE_BALL_Y",
    "PARAM_BODY_X",
    "PARAM_BODY_Y",
    "PARAM_BODY_Z",
    "PARAM_BODY_ANGLE_X",
    "PARAM_BODY_ANGLE_Y",
    "PARAM_BODY_ANGLE_Z",
    "PARAM_BREATH",
];

// load spine data
PIXI.Loader.shared
    .add('skeleton', 'examples/assets/pixi-dragonbones/eyetracking/shizuku_ske.json')
    .add('texture_png_0', 'examples/assets/pixi-dragonbones/eyetracking/texture_00.png')
    .add('texture_png_1', 'examples/assets/pixi-dragonbones/eyetracking/texture_01.png')
    .add('texture_png_2', 'examples/assets/pixi-dragonbones/eyetracking/texture_02.png')
    .add('texture_png_3', 'examples/assets/pixi-dragonbones/eyetracking/texture_03.png')
    .load(onAssetsLoaded);

function onAssetsLoaded(loader, res) {
    const factory = dragonBones.PixiFactory.factory;

    factory.parseDragonBonesData(res.skeleton.data, 'shizuku');
    factory.updateTextureAtlases([res.texture_png_0.texture,
                                             res.texture_png_1.texture,
                                             res.texture_png_2.texture,
                                             res.texture_png_3.texture], 'shizuku');

    armatureDisplay = factory.buildArmatureDisplay('shizuku', 'shizuku');
    armatureDisplay.animation.play('idle_00');
    armatureDisplay.x = 400.0;
    armatureDisplay.y = 500.0;
    armatureDisplay.scale.set(scale, scale);
    app.stage.addChild(armatureDisplay);

    app.stage.interactive = true;
    app.stage.on('touchmove', touchHandler);
    app.stage.on('mousemove', touchHandler);

    PIXI.Ticker.shared.add( enterFrameHandler );

    app.start();
}

function touchHandler(event)
{
    let x = event.data.global.x;
    let y = event.data.global.y;

    target.x += ((x - app.stage.x - armatureDisplay.x) / 0.4 - target.x) * 0.3;
    target.y += ((y - app.stage.y - armatureDisplay.y) / scale - target.y) * 0.3;
}

function enterFrameHandler( deltaTime )
{
    const armature = armatureDisplay.armature;
    const animation = armatureDisplay.animation;
    const canvas = armature.armatureData.canvas;

    let p = 0.0;
    const pX = Math.max(Math.min((target.x - canvas.x) / (canvas.width * 0.5), 1.0), -1.0);
    const pY = -Math.max(Math.min((target.y - canvas.y) / (canvas.height * 0.5), 1.0), -1.0);
    for (const animationName of animationNames) {
        if (!animation.hasAnimation(animationName)) {
            continue;
        }

        let animationState = animation.getState(animationName, 1);
        if (!animationState) {
            animationState = animation.fadeIn(animationName, 0.1, 1, 1, animationName);
            if (animationState) {
                animationState.resetToPose = false;
                animationState.stop();
            }
        }

        if (!animationState) {
            continue;
        }

        switch (animationName) {
            case "PARAM_ANGLE_X":
            case "PARAM_EYE_BALL_X":
                p = (pX + 1.0) * 0.5;
                break;

            case "PARAM_ANGLE_Y":
            case "PARAM_EYE_BALL_Y":
                p = (pY + 1.0) * 0.5;
                break;

            case "PARAM_ANGLE_Z":
                p = (-pX * pY + 1.0) * 0.5;
                break;

            case "PARAM_BODY_X":
            case "PARAM_BODY_ANGLE_X":
                p = (pX + 1.0) * 0.5;
                break;

            case "PARAM_BODY_Y":
            case "PARAM_BODY_ANGLE_Y":
                p = (-pX * pY + 1.0) * 0.5;
                break;

            case "PARAM_BODY_Z":
            case "PARAM_BODY_ANGLE_Z":
                p = (-pX * pY + 1.0) * 0.5;
                break;

            case "PARAM_BREATH":
                p = (Math.sin(armature.clock.time) + 1.0) * 0.5;
                break;
        }

        animationState.currentTime = p * animationState.totalTime;
    }
}
