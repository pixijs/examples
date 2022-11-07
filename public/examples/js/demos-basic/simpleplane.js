const app = new PIXI.Application({ background: '#1099bb' });
document.body.appendChild(app.view);

PIXI.Assets.load('examples/assets/bg_grass.jpg').then((texture) => {
    const plane = new PIXI.SimplePlane(texture, 10, 10);

    plane.x = 100;
    plane.y = 100;

    app.stage.addChild(plane);

    // Get the buffer for vertice positions.
    const buffer = plane.geometry.getBuffer('aVertexPosition');

    // Listen for animate update
    let timer = 0;
    app.ticker.add(() => {
        // Randomize the vertice positions a bit to create movement.
        for (let i = 0; i < buffer.data.length; i++) {
            buffer.data[i] += Math.sin((timer / 10) + i) * 0.5;
        }
        buffer.update();
        timer++;
    });
});
