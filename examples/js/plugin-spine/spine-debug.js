const app = new PIXI.Application();
document.body.appendChild(app.view);

// load spine data
app.loader
    .add('spineboypro', 'examples/assets/pixi-spine/spineboy-pro.json')
    .add('vinepro', 'examples/assets/pixi-spine/vine-pro.json')
    .load(onAssetsLoaded);

app.stage.interactive = true;

function onAssetsLoaded(loader, res) {
    const spineBoyPro = new PIXI.spine.Spine(res.spineboypro.spineData);
    spineBoyPro.x = app.screen.width * 0.4;
    spineBoyPro.y = app.screen.height * 0.9;
    spineBoyPro.scale.set(0.5);
    spineBoyPro.state.setAnimation(0, 'portal', true);

    // Turn on debug
    spineBoyPro.drawDebug = true;

    // All draw debug flags are on by default. This is only for example purposes.
    spineBoyPro.drawMeshHull = true;
    spineBoyPro.drawMeshTriangles = true;
    spineBoyPro.drawBones = true;
    spineBoyPro.drawPaths = true;
    spineBoyPro.drawBoundingBoxes = true;
    spineBoyPro.drawClipping = true;
    spineBoyPro.drawRegionAttachments = true;

    app.stage.addChild(spineBoyPro);


    const vinePro = new PIXI.spine.Spine(res.vinepro.spineData);
    vinePro.x = app.screen.width * 0.75;
    vinePro.y = app.screen.height * 0.9;
    vinePro.scale.set(0.5);
    vinePro.state.setAnimation(0, 'grow', true);

    // Turn on debug
    vinePro.drawDebug = true;

    // All draw debug flags are on by default. This is only for example purposes.
    vinePro.drawMeshHull = true;
    vinePro.drawMeshTriangles = true;
    vinePro.drawBones = true;
    vinePro.drawPaths = true;
    vinePro.drawBoundingBoxes = true;
    vinePro.drawClipping = true;
    vinePro.drawRegionAttachments = true;

    app.stage.addChild(vinePro);


    // Click to toggle debug
    app.stage.on('pointerdown', () => {
        spineBoyPro.drawDebug = !spineBoyPro.drawDebug;
        vinePro.drawDebug = !vinePro.drawDebug;
    });
}
