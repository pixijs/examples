var app = new PIXI.Application();
document.body.appendChild(app.view);

// Create background image
var background = PIXI.Sprite.fromImage("required/assets/bkg-grass.jpg");
background.width = app.screen.width;
background.height = app.screen.height;
app.stage.addChild(background);

var shaderFrag = `
 precision mediump float;
  
  uniform vec2 mouse;
  uniform vec2 resolution;
  uniform float time;

  void main() {
	// because of premultiplied blendModes, we have to multiply WHOLE VECTOR by alpha,
	// instead of setting only alpha.
    gl_FragColor = vec4( sin(time), mouse.x/resolution.x, mouse.y/resolution.y, 1) * 0.5;
  }
`;

var container = new PIXI.Container();
container.filterArea = app.screen;
app.stage.addChild(container);
var filter = new PIXI.Filter(null, shaderFrag);
container.filters = [filter];

// Animate the filter
app.ticker.add(function(delta) {
    var v2 = filter.uniforms.mouse;
    var global = app.renderer.plugins.interaction.mouse.global;
    v2[0] = global.x; v2[1] = global.y;
    filter.uniforms.mouse = v2;
  
    v2 = filter.uniforms.resolution;
    v2[0] = app.screen.width;
    v2[1] = app.screen.height;
    filter.uniforms.resolution = v2;
});
