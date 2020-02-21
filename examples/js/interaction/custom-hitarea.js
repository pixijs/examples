const app = new PIXI.Application(800, 600, { backgroundColor: 0x1099bb });
document.body.appendChild(app.view);

// A few options to control how the bunny sprite moves
let speedStep = 0.1;
let spinSpeed = 0.1;
const moveSpeed = 100;
let moveBunny = false;

// Test For Hit
// Lets us check whether the mouse pointer intersects with the hitarea
function testForHit(button, event) {
    if (button === null || button.hitArea === null) {
        return false;
    }
    const mouseCoords = event.data.global;
    return button.hitArea.contains(mouseCoords.x, mouseCoords.y);
}

// For the first example, we'll make our button. You can use any shape instead of a
// polygon
const starButton = new PIXI.Graphics()
    .beginFill(0xf1c40f)
    .drawPolygon([
        550, 20,
        570, 70,
        630, 75,
        585, 115,
        600, 170,
        550, 140,
        500, 170,
        515, 115,
        470, 75,
        530, 70,
    ])
    .endFill();

// Turns on interactive elements to show that these are buttons
// to be clicked
starButton.interactive = true;
starButton.buttonMode = true;

// Add to stage
app.stage.addChild(starButton);

// Create a hitarea that matches, which will be used for point intersection
starButton.hitArea = new PIXI.Polygon([
    550, 20,
    570, 70,
    630, 75,
    585, 115,
    600, 170,
    550, 140,
    500, 170,
    515, 115,
    470, 75,
    530, 70,
]);

// This time, the same thing but for a sprite
const bunnyButtonSprite = PIXI.Sprite.from('examples/assets/bunny.png');
bunnyButtonSprite.x = 650;
bunnyButtonSprite.y = 20;
bunnyButtonSprite.scale.set(3);
app.stage.addChild(bunnyButtonSprite);

// Turns on interactive elements to show that these are buttons
// to be clicked
bunnyButtonSprite.interactive = true;
bunnyButtonSprite.buttonMode = true;
app.stage.addChild(bunnyButtonSprite);

// We also add a polygon to represent the clickable area
bunnyButtonSprite.hitArea = new PIXI.Polygon([
    668, 24,
    681, 24,
    682, 37,
    685, 37,
    685, 41,
    692, 41,
    692, 37,
    696, 37,
    695, 24,
    710, 24,
    710, 127,
    704, 127,
    701, 113,
    676, 114,
    673, 127,
    668, 127,
    668, 24,
]);

// Register a function to happen on an event fired by
// the InteractionManager. In short, instead of looking to hook
// into the event of a displayObject being clicked, we instead
// check if clicks are happening at all, then check whether it
// hit our hitarea
app.renderer.plugins.interaction.on('pointerdown',
    (event) => {
        console.log('CLICK');
        if (testForHit(starButton, event)) {
            spinSpeed = -spinSpeed;
            speedStep = -speedStep;
        }

        if (testForHit(bunnyButtonSprite, event)) {
            moveBunny = !moveBunny;
        }
    });

// We can do something similar, but this time the object will be
// tinted when the mouse pointer intersects with the hitarea
app.renderer.plugins.interaction.on('pointermove',
    (event) => {
        if (testForHit(starButton, event)) {
            console.log('TINT');
            starButton.tint = 0x666666;
        } else {
            starButton.tint = 0xFFFFFF;
        }

        if (testForHit(bunnyButtonSprite, event)) {
            console.log('TINT');
            bunnyButtonSprite.tint = 0x666666;
        } else {
            bunnyButtonSprite.tint = 0xFFFFFF;
        }
    });

// Set Up Bunny Sprite
const bunny = PIXI.Sprite.from('examples/assets/bunny.png');
bunny.anchor.set(0.5);
bunny.x = app.screen.width / 2;
bunny.y = app.screen.height / 2;
bunny.scale.set(2);
app.stage.addChild(bunny);

// Listen for animate update
app.ticker.add((delta) => {
    bunny.rotation += spinSpeed * delta;

    // If the bunny button has been clicked, then move the bunny across
    // the screen
    if (moveBunny) {
        bunny.x += (moveSpeed * spinSpeed) * delta;

        // Check that the bunny doesn't fly off screen by making it zip back
        // to the opposite side when it does
        if (bunny.x < 0) {
            bunny.x = app.screen.width;
        }

        if (bunny.x > app.screen.width) {
            bunny.x = 0;
        }
    }
});
