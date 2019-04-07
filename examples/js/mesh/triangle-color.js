const app = new PIXI.Application();
document.body.appendChild(app.view);

const geometry = new PIXI.Geometry()
    .addAttribute('aVertexPosition', // the attribute name
        [-100, -50, // x, y
            100, -50, // x, y
            0.0, 100.0], // x, y
        2) // the size of the attribute

    .addAttribute('aColor', // the attribute name
        [1, 0, 0, // r, g, b
            0, 1, 0, // r, g, b
            0, 0, 1], // r, g, b
        3); // the size of the attribute

const shader = PIXI.Shader.from(`

    precision mediump float;
    attribute vec2 aVertexPosition;
    attribute vec3 aColor;

    uniform mat3 translationMatrix;
    uniform mat3 projectionMatrix;

    varying vec3 vColor;

    void main() {

        vColor = aColor;
        gl_Position = vec4((projectionMatrix * translationMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);

    }`,

`precision mediump float;

    varying vec3 vColor;

    void main() {
        gl_FragColor = vec4(vColor, 1.0);
    }

`);

const triangle = new PIXI.Mesh(geometry, shader);

triangle.position.set(400, 300);
triangle.scale.set(2);

app.stage.addChild(triangle);

app.ticker.add((delta) => {
    triangle.rotation += 0.01;
});
