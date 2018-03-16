// please switch to `next` branch to see this demo

var app = new PIXI.Application(800, 600);
document.body.appendChild(app.view);

var geometry = new PIXI.Geometry()
.addAttribute('aVertexPosition',  // the attribute name
              [-100, -100,   // x, y
                100, -100,   // x, y
                100 , 100], // x, y
               2)           // the size of the attribute

.addAttribute('aColor',  // the attribute name
              [1, 0, 0,  // r, g, b
               0, 1, 0,  // r, g, b
               0, 0, 1], // r, g, b
               3)        // the size of the attribute

.addAttribute('aUvs',  // the attribute name
              [0, 0,  // u, v
               1, 0,  // u, v
               1, 1], // u, v
               2)        // the size of the attribute

var vertexSrc = `

    precision mediump float;

    attribute vec2 aVertexPosition;
    attribute vec3 aColor;
    attribute vec2 aUvs;

    uniform mat3 translationMatrix;
    uniform mat3 projectionMatrix;

    varying vec2 vUvs;
    varying vec3 vColor;

    void main() {

        vUvs = aUvs;
        vColor = aColor;
        gl_Position = vec4((projectionMatrix * translationMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);

    }`

var fragmentSrc = `

    precision mediump float;

    varying vec3 vColor;
    varying vec2 vUvs;

    uniform sampler2D uSampler2;

    void main() {

        gl_FragColor = texture2D(uSampler2, vUvs) * vec4(vColor, 1.0);
    }`

var uniforms = { uSampler2:PIXI.Texture.from('required/assets/SceneRotate.jpg') };

var shader = new PIXI.Shader.from(vertexSrc, fragmentSrc, uniforms);

var triangle = new PIXI.RawMesh(geometry, shader);

triangle.position.set(400, 300);
triangle.scale.set(2);

app.stage.addChild(triangle);

app.ticker.add(function(delta) {
    triangle.rotation += 0.01;
});
