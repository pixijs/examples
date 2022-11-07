const app = new PIXI.Application({
    antialias: true,
    background: '#1099bb',
});
document.body.appendChild(app.view);

// Create a texture from an image path
const imageTexture = PIXI.Texture.from('examples/assets/bunny.png');

// Make the whole scene interactive
app.stage.interactive = true;
// Make sure stage captures all events when interactive
app.stage.hitArea = app.screen;
// Handle clicks on the canvas
app.stage.addEventListener('click', onClick);

// Scale mode for pixelation
imageTexture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;

// Populate scene graph with bunnies
for (let i = 0; i < 10; i++) {
    // Create our little bunny friend..
    const bunny = new PIXI.Sprite(imageTexture);

    // Enable the bunny to be interactive... this will allow it to respond to
    // mouse and touch events
    bunny.interactive = true;

    // This button mode will mean the hand cursor appears when you roll over
    // the bunny with your mouse
    bunny.cursor = 'pointer';

    // Center the bunny's anchor point.
    bunny.anchor.set(0.5);

    // Make it a bit bigger, so it's easier to grab.
    bunny.scale.set(3);

    // Setup events for mouse + touch using the pointer events
    bunny.addEventListener('pointerdown', onDragStart);
    bunny.addEventListener('pointerup', onDragEnd);
    bunny.addEventListener('pointerupoutside', onDragEnd);

    // Move the sprite to its designated position
    bunny.x = Math.floor(Math.random() * app.screen.width);
    bunny.y = Math.floor(Math.random() * app.screen.height);

    // Add it into the scene
    app.stage.addChild(bunny);
}

// Add a description
const title = app.stage.addChild(new PIXI.Text(
    'Drag a bunny around! Then click around the canvas to move the bunny to your pointer!',
    {
        fontSize: 12,
    },
));
title.position.set(12, 12);

// Store the bunny being dragged
let selectedTarget;

// Make bunny semi-transparent and listen to drag-move events when one is
// pressed.
function onDragStart(e) {
    // Show that the bunny can now be dragged.
    e.target.alpha = 0.5;
    selectedTarget = e.target;

    // Start listening to dragging on the stage
    app.stage.addEventListener('pointermove', onDragMove);
}

// Restore the dragTarget bunny's alpha & deregister listener when the bunny is
// released.
function onDragEnd() {
    // Restore the original bunny alpha.
    selectedTarget.alpha = 1;

    // Stop listening to dragging on the stage
    app.stage.removeEventListener('pointermove', onDragMove);
}

// Copy the position of the cursor into the dragTarget's position.
function onDragMove(e) {
    // Don't use e.target because the pointer might move out of the bunny if
    // the user drags fast, which would make e.target become the stage.
    selectedTarget.parent.toLocal(e.global, null, selectedTarget.position);
}

function onClick(e) {
    if (selectedTarget) {
        selectedTarget.position.copyFrom(e.global);
    }
}
