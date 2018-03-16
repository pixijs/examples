// please switch to `next` version to see this demo

var app = new PIXI.Application(800, 600);
document.body.appendChild(app.view);

var geometry = new PIXI.Geometry()
.addAttribute('aVertexPosition',  // the attribute name
              [-100, -100,   // x, y
                100, -100,   // x, y
                100 , 100]) // x, y

.addAttribute('aUvs',  // the attribute name
              [0, 0,  // u, v
               1, 0,  // u, v
               1, 1]) // u, v

var shader = new PIXI.Shader.from(`

    precision mediump float;

    attribute vec2 aVertexPosition;
    attribute vec2 aUvs;

    uniform mat3 translationMatrix;
    uniform mat3 projectionMatrix;

    varying vec2 vUvs;

    void main() {

        vUvs = aUvs;
        gl_Position = vec4((projectionMatrix * translationMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);

    }`,

    `precision mediump float;

    varying vec2 vUvs;

    uniform sampler2D uSampler2;

    void main() {

        gl_FragColor = texture2D(uSampler2, vUvs);
    }

`,
{
    uSampler2:PIXI.Texture.from('required/assets/SceneRotate.jpg')
})

var shader2 = new PIXI.Shader.from(`

    precision mediump float;

    attribute vec2 aVertexPosition;
    attribute vec2 aUvs;

    uniform mat3 translationMatrix;
    uniform mat3 projectionMatrix;

    varying vec2 vUvs;

    void main() {

        vUvs = aUvs;
        gl_Position = vec4((projectionMatrix * translationMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);

    }`,

    `precision mediump float;

    varying vec2 vUvs;

    uniform sampler2D uSampler2;

    void main() {

        gl_FragColor = texture2D(uSampler2, vUvs);
        gl_FragColor.r += (abs(sin(gl_FragCoord.x * 0.06)) * 0.5) * 2.;
        gl_FragColor.g += (abs(cos(gl_FragCoord.y * 0.06)) * 0.5) * 2.;
    }

`,
{
  uSampler2:PIXI.Texture.from('required/assets/SceneRotate.jpg')
})


var triangle = new PIXI.RawMesh(geometry, shader);


var triangle2 = new PIXI.RawMesh(geometry, shader2);

triangle.position.set(400, 300);
triangle.scale.set(2);

triangle2.position.set(500, 400);
triangle2.scale.set(3);

app.stage.addChild(triangle2, triangle);

app.ticker.add(function(delta) {
    triangle.rotation += 0.01;
    triangle2.rotation -= 0.005;
});
