// This example shows how you can create your own EventBoundary to accelerate
// hit-testing using spatial hashes. This can be used to optimize relatively
// "flat" scene graphs, where  a container contains so many objects that it
// covers the whole scene.

// This special event boundary overrides the hit-testing implementation to use
// HashingContainer's own childHash to find children near the pointer
// location.
class HashingEventBoundary extends PIXI.EventBoundary {
    constructor(...args) {
        super(...args);
        // Create reusable temp rectangle for hit-testing!
        this.tempRect = new PIXI.Rectangle();
    }

    hitTestRecursive(
        currentTarget,
        interactive,
        location,
        testFn,
        pruneFn,
    ) {
        // If currentTarget isn't a HashingContainer, then default to the
        // regular hit-testing implementation provided by PixiJS.
        if (!currentTarget
                || !currentTarget.visible
                || !currentTarget.childHash) {
            return super.hitTestRecursive(
                currentTarget,
                interactive,
                location,
                testFn,
                pruneFn,
            );
        }

        // Check if the location is outside of the entire container
        if (pruneFn(currentTarget, location)) return null;

        // Time to get recursive and find the next child in the propagation
        // path of the event, accelerated using the childHash.
        if (currentTarget.interactiveChildren) {
            /* This is where the magic happens! */
            const tempRect = this.tempRect;

            // Store the location as a 0x0 rectangle. SpatialHash requires a
            // rectangle for searching.
            tempRect.x = location.x;
            tempRect.y = location.y;

            // Find all the children overlapping with tempRect a.k.a location,
            // and then sort them by their index in the HashingContainer's
            // children array.
            const children = Array
                .from(currentTarget.childHash.search(tempRect))
                .sort((a, b) => a.refIndex - b.refIndex);

            /* The following is copied from EventBoundary's code. */
            for (let i = children.length - 1; i >= 0; i--) {
                const child = children[i];
                const nestedHit = this.hitTestRecursive(
                    child,
                    interactive || child.interactive,
                    location,
                    testFn,
                    pruneFn,
                );

                if (nestedHit) {
                    // Its a good idea to check if a child has lost its
                    // parent. this means it has been removed whilst looping
                    // so its best
                    if (nestedHit.length > 0
                            && !nestedHit[nestedHit.length - 1].parent) {
                        // eslint-disable-next-line no-continue
                        continue;
                    }

                    // Only add the current hit-test target to the hit-test
                    // chain if the chain has already started (i.e. the event
                    // target has been found) or if the current target is
                    // interactive (i.e. it becomes the event target).
                    if (nestedHit.length > 0 || currentTarget.interactive) {
                        nestedHit.push(currentTarget);
                    }

                    return nestedHit;
                }
            }
        }

        /* The following is copied from EventBoundary's own implementation. */

        // Finally, hit test this DisplayObject itself.
        if (interactive && testFn(currentTarget, location)) {
            // The current hit-test target is the event's target only if it
            // is interactive. Otherwise, the first interactive ancestor will
            // be the event's target.
            return currentTarget.interactive ? [currentTarget] : [];
        }

        return null;
    }
}

// HashingContainer is a special kind of container that organizes its children
// in a spatial hash. It also sets each child's refIndex property to its index
// in the hashing container's children array.
class HashingContainer extends PIXI.Container {
    constructor() {
        super();
        this.childHash = new PIXI.SpatialHash();
    }

    // Override updateTransform to update this.childHash!
    updateTransform() {
        super.updateTransform();

        // Reset childHash & re-add all the children. This will
        // make the spatial hash re-evaluate the coverage of each child.
        this.childHash.reset();
        for (let i = 0; i < this.children.length; i++) {
            const child = this.children[i];

            this.childHash.put(child);
            child.refIndex = i;
        }
    }
}

// This is the actual program using HashingEventBoundary, HashingContainer.
function main() {
    // Create app. autoStart = false so that the app doesn't render until
    // something changes - this prevents redundant spatial-hash updates.
    const app = new PIXI.Application({
        antialias: true,
        autoDensity: true,
        autoStart: false,
        background: '#1099bb',
    });
    document.body.appendChild(app.view);

    // Install our own EventBoundary!
    app.renderer.events.rootBoundary = new HashingEventBoundary(app.stage);

    // Make the hashing container
    const container = app.stage.addChild(new HashingContainer());
    // Textures to choose from for each random character
    const textures = [
        PIXI.Texture.from('examples/assets/skully.png'),
        PIXI.Texture.from('examples/assets/eggHead.png'),
        PIXI.Texture.from('examples/assets/flowerTop.png'),
        PIXI.Texture.from('examples/assets/helmlok.png'),
    ];
    // Rerender scene when each texture loads
    textures.forEach(
        (tex) => tex.baseTexture.once('loaded', () => app.render()),
    );

    // Populate the hashing container!
    function makeMonster(x, y) {
        const texture = textures[Math.floor(Math.random() * textures.length)];
        const sprite = new PIXI.Sprite(texture);

        // Randomly place the character
        sprite.position.set(
            x || Math.random() * (app.screen.width - 64),
            y || (64 + Math.random() * (app.screen.height - 128)),
        );

        // Make character smaller so we can have a bunch of 'em
        sprite.scale.set(0.34);

        // Make the character interactive!
        sprite.interactive = true;

        // Explode on clicks!
        sprite.addEventListener('click', onMonsterClicked);

        container.addChild(sprite);

        return sprite;
    }
    function onMonsterClicked(e) {
        const monster = this;
        const pos = monster.position;
        const radius = Math.max(monster.width, monster.height) * 2;

        // Remove monster from scene once the event finishes propagating.
        e.manager.dispatch.once('click', () => {
            // TODO: Fix PixiJS throwing errors since the monster is removed
            // from scene graph while was under hover.

            monster.parent.removeChild(monster);
            PIXI.Ticker.shared.addOnce(() => app.render());
        });

        for (let i = 0; i < 8; i++) {
            const x = pos.x + radius * Math.cos(i * Math.PI / 4);
            const y = pos.y + radius * Math.sin(i * Math.PI / 4);

            makeMonster(x, y);
        }
    }
    // Make initial set of monsters
    for (let i = 0; i < 100; i++) makeMonster();

    // Add a descriptive title
    const title = app.stage.addChild(
        new PIXI.Text(
            'Click on a monster and see it explode into more!',
            {
                fontSize: 12,
            },
        ),
    );
    title.position.set(12, 12);

    // Render the stage once
    app.render();
}

// Run our program!
main();
