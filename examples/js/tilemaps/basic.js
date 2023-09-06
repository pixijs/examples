const renderer = PIXI.autoDetectRenderer({
    antialias: true,
    autoDensity: true,
});

let stage;
let tilemap;
let frame = 0;

document.body.appendChild(renderer.view);

PIXI.Assets.add('atlas', 'examples/assets/tilemaps/atlas.json');
PIXI.Assets.add('button', 'examples/assets/tilemaps/button.png');
PIXI.Assets.load(['atlas', 'button']).then(() => {
    // Setup tilemap scene
    stage = new PIXI.Container();
    tilemap = new PIXI.tilemap.CompositeTilemap();
    stage.addChild(tilemap);

    // Setup rendering loop
    PIXI.Ticker.shared.add(() => renderer.render(stage));

    makeTilemap();
    setInterval(() => {
        // Animate the chest tile textures. Since they are placed in 1 row
        // only, we only need to update tileAnim[0] (for x) and not
        // tileAnim[1] (for y).
        renderer.plugins.tilemap.tileAnim[0] = frame++;
    }, 400);
});

function makeTilemap() {
    // Clear the tilemap, in case it is being reused.
    tilemap.clear();

    const size = 32;

    // Calculate the dimensions of the tilemap to build
    const pxW = renderer.screen.width;
    const pxH = renderer.screen.height;
    const tileW = pxW / size;
    const tileH = pxH / size;
    const wallBoundary = 2 + Math.floor(tileH / 2);

    // Fill the scene with grass and sparse rocks on top and chests on
    // the bottom. Some chests are animated between two tile textures
    // (so they flash red).
    for (let i = 0; i < tileW; i++) {
        for (let j = 0; j < tileH; j++) {
            tilemap.tile(
                (j < tileH / 2) && (i % 2 === 1) && (j % 2 === 1)
                    ? 'tough.png'
                    : 'grass.png',
                i * size,
                j * size,
            );

            if (j === wallBoundary) {
                tilemap.tile('brick_wall.png', i * size, j * size);
            } else if (j > wallBoundary + 1 && j < tileH - 1) {
                if (Math.random() > 0.8) {
                    tilemap.tile('chest.png', i * size, j * size);

                    if (Math.random() > 0.8) {
                        // Animate between 2 tile textures. The x-offset
                        // between them in the base-texture is 34px, i.e.
                        // "red_chest" is exactly 34 pixels right in the atlas.
                        tilemap.tileAnimX(34, 2);
                    }
                }
            }
        }
    }

    // Button does not appear in the atlas, but @pixi/tilemap won't surrender
    // - it will create second layer for special for buttons and they will
    // appear above all the other tiles.
    tilemap.tile(PIXI.Assets.get('button'), 0, 0);
}
