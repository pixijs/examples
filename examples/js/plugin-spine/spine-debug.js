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
    app.stage.addChild(spineBoyPro);

    const vinePro = new PIXI.spine.Spine(res.vinepro.spineData);
    vinePro.x = app.screen.width * 0.75;
    vinePro.y = app.screen.height * 0.9;
    vinePro.scale.set(0.5);
    vinePro.state.setAnimation(0, 'grow', true);
    app.stage.addChild(vinePro);

    // Create the renderer
    const spineDebugRenderer = new PIXI.spine.SpineDebugRenderer();

    // Connect the renderer to your spine objects
    spineBoyPro.debug = spineDebugRenderer;
    vinePro.debug = spineDebugRenderer;

    // All draw debug flags are on by defult.
    // This is only for example purposes.
    spineDebugRenderer.drawDebug = true;
    spineDebugRenderer.drawMeshHull = true;
    spineDebugRenderer.drawMeshTriangles = true;
    spineDebugRenderer.drawBones = true;
    spineDebugRenderer.drawPaths = true;
    spineDebugRenderer.drawBoundingBoxes = true;
    spineDebugRenderer.drawClipping = true;
    spineDebugRenderer.drawRegionAttachments = true;


    // Click to toggle debug
    app.stage.on('pointerdown', () => {
        // Control all debug with a single object!
        spineDebugRenderer.drawDebug = !spineDebugRenderer.drawDebug;
    });
}
