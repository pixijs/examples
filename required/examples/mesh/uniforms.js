// please switch to `next` branch to see this demo

var app = new PIXI.Application(800, 600);
document.body.appendChild(app.view);

var geometry = new PIXI.Geometry()
.addAttribute('aVertexPosition',  // the attribute name
              [-100, -100,   // x, y
                100, -100,   // x, y
                100 , 100,
               -100 , 100], // x, y
               2)           // the size of the attribute
.addAttribute('aUvs',  // the attribute name
              [0, 0,  // u, v
               1, 0,  // u, v
               1, 1,
               0, 1], // u, v
               2)        // the size of the attribute
.addIndex([0, 1, 2, 0, 2, 3]);

var vertexSrc = `

    precision mediump float;

    attribute vec2 aVertexPosition;
    attribute vec2 aUvs;

    uniform mat3 translationMatrix;
    uniform mat3 projectionMatrix;

    varying vec2 vUvs;

    void main() {

        vUvs = aUvs;
        gl_Position = vec4((projectionMatrix * translationMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);

    }`

var fragmentSrc = `

    precision mediump float;

    varying vec2 vUvs;

    uniform sampler2D uSampler2;
    uniform float time;

    void main() {

        gl_FragColor = texture2D(uSampler2, vUvs + sin( (time + (vUvs.x) * 14.) ) * 0.1 );
    }`

var uniforms = {
    uSampler2:PIXI.Texture.from('required/assets/SceneRotate.jpg'),
    time:0
}

var uniforms = { uSampler2:PIXI.Texture.from('required/assets/SceneRotate.jpg') };

var shader = new PIXI.Shader.from(vertexSrc, fragmentSrc, uniforms);

var quad = new PIXI.RawMesh(geometry, shader, uniforms);

quad.position.set(400, 300);
quad.scale.set(2);

app.stage.addChild(quad);

// start the animation..
requestAnimationFrame(animate);

app.ticker.add(function(delta) {
    quad.rotation += 0.01;
    quad.shader.uniforms.time += 0.1
});
