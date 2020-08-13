const app = new PIXI.Application();

document.body.appendChild(app.view);

const geometry = new PIXI.Geometry()
    .addAttribute('aVPos', [-100, 0, 100, 0, 0, -150]);

    geometry.instanced = true;
    geometry.instanceCount = 5;

    const positionSize = 2;
    const colorSize = 3;
    const buffer = new PIXI.Buffer(new Float32Array(geometry.instanceCount * (positionSize + colorSize)));

    geometry.addAttribute('aIPos', buffer, positionSize, false, PIXI.TYPES.FLOAT, 4 * (positionSize + colorSize), 0, true);
    geometry.addAttribute('aICol', buffer, colorSize, false, PIXI.TYPES.FLOAT, 4 * (positionSize + colorSize), 4 * positionSize, true);

    for (let i = 0; i < geometry.instanceCount; i++)
    {
        const instanceOffset = i * (positionSize + colorSize);

        buffer.data[instanceOffset + 0] = i * 80;
        buffer.data[instanceOffset + 2] = Math.random();
        buffer.data[instanceOffset + 3] = Math.random();
        buffer.data[instanceOffset + 4] = Math.random();
    }

const shader = PIXI.Shader.from(`
    precision mediump float;
    attribute vec2 aVPos;
    attribute vec2 aIPos;
    attribute vec3 aICol;

    uniform mat3 translationMatrix;
    uniform mat3 projectionMatrix;

    varying vec3 vCol;

    void main() {
        vCol = aICol;

        gl_Position = vec4((projectionMatrix * translationMatrix * vec3(aVPos + aIPos, 1.0)).xy, 0.0, 1.0);
    }`,

    `precision mediump float;

    varying vec3 vCol;

    void main() {
        gl_FragColor = vec4(vCol, 1.0);
    }

`);

const triangles = new PIXI.Mesh(geometry, shader);

triangles.position.set(400, 300);

app.stage.addChild(triangles);

app.ticker.add((delta) => {
    triangles.rotation += 0.01;
});
