const app = new PIXI.Application(800, 600, { backgroundColor: 0x1099bb });
document.body.appendChild(app.view);

const yellowStar = PIXI.Texture.from('examples/assets/yellowstar.png');

// Standard Sprite Button
const starButtonNoHitArea = new PIXI.Sprite(yellowStar);

starButtonNoHitArea.position.set(125, 200);

starButtonNoHitArea.buttonMode = true;
starButtonNoHitArea.interactive = true;

starButtonNoHitArea.on('pointerdown',
    (event) => {
        console.log('CLICK');
        starButtonNoHitArea.tint = 0x333333;
    });

starButtonNoHitArea.on('pointerover',
    (event) => {
        console.log('TINT');
        starButtonNoHitArea.tint = 0x666666;
    });

starButtonNoHitArea.on('pointerout',
    (event) => {
        starButtonNoHitArea.tint = 0xFFFFFF;
    });

// Custom Hitarea Button
const starButtonWithHitArea = new PIXI.Sprite(yellowStar);
starButtonWithHitArea.position.set(325, 200);

// Create a hitarea that matches the sprite, which will be used for point
// intersection
starButtonWithHitArea.hitArea = new PIXI.Polygon([
    404, 199,
    424, 249,
    484, 254,
    439, 294,
    454, 349,
    404, 319,
    354, 349,
    369, 294,
    324, 254,
    384, 249,
]);
starButtonWithHitArea.buttonMode = true;
starButtonWithHitArea.interactive = true;

// Hitareas ignore masks. You can still click on a button made in this way,
// even from areas covered by a mask
const starButtonWithMask = new PIXI.Sprite(yellowStar);
starButtonWithMask.position.set(525, 200);

const squareMask = new PIXI.Graphics()
    .beginFill(0xFFFFFF)
    .drawRect(starButtonWithMask.x, starButtonWithMask.y, 75, 200)
    .endFill();

starButtonWithMask.mask = squareMask;

// Again, hitarea for intersection checks
starButtonWithMask.hitArea = new PIXI.Polygon([
    604, 199,
    624, 249,
    684, 254,
    669, 294,
    654, 349,
    604, 319,
    554, 349,
    569, 294,
    524, 254,
    584, 249,
]);
starButtonWithMask.buttonMode = true;
starButtonWithMask.interactive = true;

// Add to stage
app.stage.addChild(starButtonWithHitArea, starButtonNoHitArea, starButtonWithMask, squareMask);

// Test For Hit
// Lets us check whether the mouse pointer intersects with the hitarea
function testForHit(button, event) {
    if (button === null || button.hitArea === null) {
        return false;
    }
    const mouseCoords = event.data.global;
    return button.hitArea.contains(mouseCoords.x, mouseCoords.y);
}

// Instead of using events from the sprite object, we register a function to
// happen on an event fired by the InteractionManager. In short, instead of
// looking to hook into the event of a displayObject being clicked, we instead
// check if clicks are happening at all, then check whether it hit our hitarea.
app.renderer.plugins.interaction.on('pointerdown',
    (event) => {
        console.log('CLICK');
        if (testForHit(starButtonWithHitArea, event)) {
            starButtonWithHitArea.tint = 0x333333;
        }
        if (testForHit(starButtonWithMask, event)) {
            starButtonWithMask.tint = 0x333333;
        }
    });

// We can do something similar, but this time the object will be
// tinted when the mouse pointer intersects with the hitarea
app.renderer.plugins.interaction.on('pointermove',
    (event) => {
        if (testForHit(starButtonWithHitArea, event)) {
            console.log('TINT');
            starButtonWithHitArea.tint = 0x666666;
        } else {
            starButtonWithHitArea.tint = 0xFFFFFF;
        }

        if (testForHit(starButtonWithMask, event)) {
            console.log('TINT');
            starButtonWithMask.tint = 0x666666;
        } else {
            starButtonWithMask.tint = 0xFFFFFF;
        }
    });
