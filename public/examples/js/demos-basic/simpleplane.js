const app = new PIXI.Application({ background: '#1099bb' });
document.body.appendChild(app.view);

PIXI.Assets.load('examples/assets/bg_grass.jpg').then((texture) => {
    // Create the simple plane
    const verticesX = 10;
    const verticesY = 10;
    const plane = new PIXI.SimplePlane(texture, verticesX, verticesY);

    plane.x = 100;
    plane.y = 100;

    app.stage.addChild(plane);

    // Get the buffer for vertice positions.
    const buffer = plane.geometry.getBuffer('aVertexPosition');

    // Listen for animate update
    app.ticker.add((delta) => {
        // Randomize the vertice positions a bit to create movement.
        for (let i = 0; i < buffer.data.length; i++) {
            buffer.data[i] += (Math.random() - 0.5);
        }
        buffer.update();
    });
});
