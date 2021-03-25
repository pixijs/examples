// eslint-disable-next-line no-underscore-dangle
delete PIXI.Renderer.__plugins.interaction;

class DnDApplication extends PIXI.Application {
    constructor() {
        super({ backgroundColor: 0x1099bb });

        // Make sure stage captures all events when interactive
        this.stage.hitArea = this.renderer.screen;

        // Install EventSystem, if not already (PixiJS 6 doesn't add it by default)
        if (!('event' in this.renderer)) {
            this.renderer.addSystem(PIXI.EventSystem, 'events');
        }

        // create a texture from an image path
        this.imageTexture = PIXI.Texture.from('examples/assets/bunny.png');

        // Scale mode for pixelation
        this.imageTexture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;

        for (let i = 0; i < 10; i++) {
            this.stage.addChild(this.makeBunny(
                Math.floor(Math.random() * this.screen.width),
                Math.floor(Math.random() * this.screen.height),
            ));
        }
    }

    makeBunny(x, y) {
        // create our little bunny friend..
        const bunny = new PIXI.Sprite(this.imageTexture);

        // enable the bunny to be interactive... this will allow it to respond to mouse and touch events
        bunny.interactive = true;

        // this button mode will mean the hand cursor appears when you roll over the bunny with your mouse
        bunny.buttonMode = true;

        // center the bunny's anchor point
        bunny.anchor.set(0.5);

        // make it a bit bigger, so it's easier to grab
        bunny.scale.set(3);

        // setup events for mouse + touch using
        // the pointer events
        bunny.addEventListener('pointerdown', onDragStart);
        bunny.addEventListener('pointerup', onDragEnd);
        bunny.addEventListener('pointerupoutside', onDragEnd);

        // move the sprite to its designated position
        bunny.x = x;
        bunny.y = y;

        return bunny;
    }
}

const app = new DnDApplication();
let dragTarget = null;

document.body.appendChild(app.view);

// Make bunny semi-transparent and listen to drag-move events when one is pressed.
function onDragStart(e) {
    e.target.alpha = 0.5;
    dragTarget = e.target;

    app.stage.interactive = true;
    app.stage.addEventListener('pointermove', onDragMove);
}

// Restore the dragTarget bunny's alpha & deregister listener when the bunny is release.
function onDragEnd(e) {
    dragTarget.alpha = 1;
    dragTarget = null;

    app.stage.interactive = false;
    app.stage.removeEventListener('pointermove', onDragMove);
}

// Copy the position of the cursor into the dragTarget's position.
function onDragMove(e) {
    dragTarget.parent.toLocal(e.global, null, dragTarget.position);
}
