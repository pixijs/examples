// This example is the based on demos-basic/container, but running in Web Worker.

function workerSource(self) {
    self.onmessage = async ({
        data: { baseUrl, pixiWebWorkerUrl, options },
    }) => {
        self.importScripts(new URL(pixiWebWorkerUrl, baseUrl));

        const app = new PIXI.Application(options);

        const container = new PIXI.Container();

        app.stage.addChild(container);

        // Create a new texture
        const textureUrl = new URL('examples/assets/bunny.png', baseUrl).toString();
        const texture = PIXI.Texture.from(textureUrl);

        // Create a 5x5 grid of bunnies
        for (let i = 0; i < 25; i++) {
            const bunny = new PIXI.Sprite(texture);
            bunny.anchor.set(0.5);
            bunny.x = (i % 5) * 40;
            bunny.y = Math.floor(i / 5) * 40;
            container.addChild(bunny);
        }

        // Move container to the center
        container.x = app.screen.width / 2;
        container.y = app.screen.height / 2;

        // Center bunny sprite in local container coordinates
        container.pivot.x = container.width / 2;
        container.pivot.y = container.height / 2;

        // Listen for animate update
        app.ticker.add((delta) => {
            // rotate the container!
            // use delta to create frame-independent transform
            container.rotation -= 0.01 * delta;
        });
    };
}
const blob = new Blob(['(', workerSource, ')(self);'], { type: 'application/javascript' });
const url = URL.createObjectURL(blob);
const worker = new Worker(url);
URL.revokeObjectURL(url);

const width = 800;
const height = 600;
const resolution = window.devicePixelRatio;
const canvas = document.createElement('canvas');
canvas.style.width = `${width}px`;
canvas.style.height = `${height}px`;
document.body.appendChild(canvas);
const view = canvas.transferControlToOffscreen();

const baseUrl = window.location.href;
const pixiWebWorkerUrl = window.PIXI_WEBWORKER_URL;
worker.postMessage({
    baseUrl,
    pixiWebWorkerUrl,
    options: {
        width, height, resolution, view, backgroundColor: 0x1099bb,
    },
}, [view]);
