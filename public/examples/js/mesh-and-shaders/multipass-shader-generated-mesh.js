const app = new PIXI.Application({ height: 640 });
document.body.appendChild(app.view);

// Build geometry.
const geometry = new PIXI.Geometry()
    .addAttribute(
        'aVertexPosition', // the attribute name
        [0, 0, // x, y
            200, 0, // x, y
            200, 200,
            0, 200], // x, y
        2, // the size of the attribute
    )
    .addAttribute(
        'aUvs', // the attribute name
        [0, 0, // u, v
            1, 0, // u, v
            1, 1,
            0, 1], // u, v
        2, // the size of the attribute
    )
    .addIndex([0, 1, 2, 0, 2, 3]);

// Vertex shader. Use same shader for all passes.
const vertexSrc = `

    precision mediump float;

    attribute vec2 aVertexPosition;
    attribute vec2 aUvs;

    uniform mat3 translationMatrix;
    uniform mat3 projectionMatrix;

    varying vec2 vUvs;

    void main() {

        vUvs = aUvs;
        gl_Position = vec4((projectionMatrix * translationMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);

    }`;

// Load a perlinnoise texture for one of the shaders.
const perlinTexture = PIXI.Texture.from('examples/assets/perlin.jpg');

// First pass, generates a grid.
const fragmentGridSrc = `
precision mediump float;
varying vec2 vUvs;
uniform float zoom;

void main()
{
    //Generate a simple grid.
    //Offset uv so that center is 0,0 and edges are -1,1
    vec2 uv = (vUvs-vec2(0.5))*2.0;
    vec2 gUv = floor(uv*zoom);
    vec4 color1 = vec4(0.8, 0.8, 0.8, 1.0);
    vec4 color2 = vec4(0.4, 0.4, 0.4, 1.0);
    vec4 outColor = mod(gUv.x + gUv.y, 2.) < 0.5 ? color1 : color2;
    gl_FragColor = outColor;
    
}`;

const gridUniforms = {
    zoom: 10,
};
const gridShader = PIXI.Shader.from(vertexSrc, fragmentGridSrc, gridUniforms);
// Sharing textures and meshes is possible. But for simplicity each pass has it's own output texture and mesh in this example.
const gridTexture = PIXI.RenderTexture.create({ width: 200, height: 200 });
const gridQuad = new PIXI.Mesh(geometry, gridShader);
const gridContainer = new PIXI.Container();
gridContainer.addChild(gridQuad);

// Second pass. Takes grid as input and makes it ripple.
const fragmentRippleSrc = `
precision mediump float;
varying vec2 vUvs;
uniform float amount;
uniform float phase;
uniform sampler2D texIn;

void main()
{
    //Generate a simple grid.
    vec2 uv = vUvs;
    //Calculate distance from center
    float distance = length( uv - vec2(0.5));
    vec4 color = texture2D(texIn, uv);
    color.rgb *= sin(distance*25.0+phase) * amount+1.;
    gl_FragColor = color;
}`;
const rippleUniforms = {
    amount: 0.5,
    phase: 0,
    texIn: gridTexture,
};
const rippleShader = PIXI.Shader.from(vertexSrc, fragmentRippleSrc, rippleUniforms);
const rippleTexture = PIXI.RenderTexture.create({ width: 200, height: 200 });
const rippleQuad = new PIXI.Mesh(geometry, rippleShader);
const rippleContainer = new PIXI.Container();
rippleContainer.addChild(rippleQuad);

// Second effect. Generates a filtered noise.
const fragmentNoiseSrc = `
precision mediump float;
varying vec2 vUvs;
uniform float limit;
uniform sampler2D noise;

void main()
{
    float color = texture2D(noise, vUvs).r;
    color = step(limit, color);
    gl_FragColor = vec4(color);
}`;
const noiseUniforms = {
    limit: 0.5,
    noise: perlinTexture,
};
const noiseShader = PIXI.Shader.from(vertexSrc, fragmentNoiseSrc, noiseUniforms);
const noiseTexture = PIXI.RenderTexture.create({ width: 200, height: 200 });
const noiseQuad = new PIXI.Mesh(geometry, noiseShader);
const noiseContainer = new PIXI.Container();
noiseContainer.addChild(noiseQuad);

// Third effect
const fragmentWaveSrc = `
precision mediump float;
varying vec2 vUvs;
uniform float amplitude;
uniform float time;

void main()
{
    //Offset uv so that center is 0,0 and edges are -1,1
    vec2 uv = (vUvs-vec2(0.5))*2.0;
    
    vec3 outColor = vec3(0.);
    
    //Simple wavefunctions inversed and with small offsets.
    outColor += 5./length(uv.y*200. - 50.0*sin( uv.x*0.25+ time*0.25)*amplitude);
    outColor += 4./length(uv.y*300. - 100.0*sin(uv.x*0.5+time*0.5)*amplitude*1.2);
    outColor += 3./length(uv.y*400. - 150.0*sin(uv.x*0.75+time*0.75)*amplitude*1.4);
    outColor += 2./length(uv.y*500. - 200.0*sin(uv.x+time)*amplitude*1.6);
    
    gl_FragColor = vec4(outColor,1.0);
}`;
const waveUniforms = {
    amplitude: 0.75,
    time: 0,
};
const waveShader = PIXI.Shader.from(vertexSrc, fragmentWaveSrc, waveUniforms);
const waveTexture = PIXI.RenderTexture.create({ width: 200, height: 200 });
const waveQuad = new PIXI.Mesh(geometry, waveShader);
const waveContainer = new PIXI.Container();
waveContainer.addChild(waveQuad);

// Final combination pass
const fragmentCombineSrc = `
precision mediump float;
varying vec2 vUvs;

uniform sampler2D texRipple;
uniform sampler2D texNoise;
uniform sampler2D texWave;

void main()
{
    //Read color from all
    vec4 ripple = texture2D(texRipple, vUvs);
    vec4 noise = texture2D(texNoise, vUvs);
    vec4 wave = texture2D(texWave, vUvs);
    
    gl_FragColor = mix(ripple, wave,noise.r);
}`;
const combineUniforms = {
    texRipple: rippleTexture,
    texNoise: noiseTexture,
    texWave: waveTexture,
};
const combineShader = PIXI.Shader.from(vertexSrc, fragmentCombineSrc, combineUniforms);
const combineQuad = new PIXI.Mesh(geometry, combineShader);

gridContainer.position.set(10, 10);
rippleContainer.position.set(220, 10);
noiseContainer.position.set(10, 220);
waveContainer.position.set(10, 430);
combineQuad.position.set(430, 220);

// Add all phases to stage so all the phases can be seen separately.
app.stage.addChild(gridContainer);
app.stage.addChild(rippleContainer);
app.stage.addChild(noiseContainer);
app.stage.addChild(waveContainer);
app.stage.addChild(combineQuad);

// start the animation..
let time = 0;
app.ticker.add((delta) => {
    time += 1 / 60;
    // gridQuad.shader.uniforms.zoom = Math.sin(time)*5+10;
    rippleQuad.shader.uniforms.phase = -time;
    waveQuad.shader.uniforms.time = time;
    noiseQuad.shader.uniforms.limit = Math.sin(time * 0.5) * 0.35 + 0.5;

    // Render the passes to get textures.
    app.renderer.render(gridQuad, { renderTexture: gridTexture });
    app.renderer.render(rippleQuad, { renderTexture: rippleTexture });
    app.renderer.render(noiseQuad, { renderTexture: noiseTexture });
    app.renderer.render(waveQuad, { renderTexture: waveTexture });
});
