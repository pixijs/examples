const app = new PIXI.Application({ backgroundColor: 0x1099bb });
document.body.appendChild(app.view);

app.loader
    .add('examples/assets/perlin.jpg', 'examples/assets/perlin.jpg')
    .load(onAssetsLoaded);

let filter = null;
const renderTexture = PIXI.RenderTexture.create(200, 200);
const filterContainer = new PIXI.Container();

filterContainer.filterArea = new PIXI.Rectangle(0,0, 200, 200);
const sprite = new PIXI.Sprite( new PIXI.Texture(renderTexture));
sprite.anchor.set(0.5, 0.0);
app.stage.addChild(sprite);

let totalTime = 0;

//Fragment shader, in real use this would be much cleaner when loaded from a file/embedded into the application as data resource.
const fragment = '//Based on this: https://www.shadertoy.com/view/wtlSWX\n\
\n\
varying vec2 vTextureCoord;\n\
uniform sampler2D noise;\n\
uniform float time;\n\
//Distance function. Just calculates the height (z) from x,y plane with really simple length check. Its not exact as there could be shorter distances.\n\
vec2 dist(vec3 p)\n\
{\n\
  float id = floor(p.x)+floor(p.y);\n\
  id = mod(id, 2.);\n\
  float h = texture2D(noise, vec2(p.x, p.y)*0.04).r*5.1;\n\
  return vec2(h-p.z,id);\n\
}\n\
//Light calculation.\n\
vec3 calclight(vec3 p, vec3 rd)\n\
{\n\
  vec2 eps = vec2( 0., 0.001);\n\
  vec3 n = normalize( vec3(\n\
    dist(p+eps.yxx).x - dist(p-eps.yxx).x,\n\
    dist(p+eps.xyx).x - dist(p-eps.xyx).x,\n\
    dist(p+eps.xxy).x - dist(p-eps.xxy).x\n\
  ));\n\
  \n\
  vec3 d = vec3( max( 0., dot( -rd ,n)));\n\
  \n\
  return d;\n\
}\n\
\n\
void main()\n\
{\n\
  vec2 uv = vec2(vTextureCoord.x, 1.-vTextureCoord.y);\n\
  uv *=2.;\n\
  uv-=1.;\n\
  \n\
  vec3 cam = vec3(0.,time -2., -3.);\n\
  vec3 target = vec3(sin(time)*0.1, time+cos(time)+2., 0. );\n\
  float fov = 2.2;\n\
  vec3 forward = normalize( target - cam);\n\
  vec3 up = normalize(cross( forward, vec3(0., 1.,0.)));\n\
  vec3 right = normalize( cross( up, forward));\n\
  vec3 raydir = normalize(vec3( uv.x *up + uv.y * right + fov*forward));\n\
  \n\
  //Do the raymarch\n\
  vec3 col = vec3(0.);\n\
  float t = 0.;\n\
  for( int i = 0; i < 100; i++)\n\
  {\n\
    vec3 p = t * raydir + cam;\n\
    vec2 d = dist(p);\n\
    t+=d.x*0.5;//Jump only half of the distance as height function used is not really the best for heightmaps.\n\
    if(d.x < 0.001)\n\
    {\n\
      vec3 bc = d.y < 0.5 ? vec3(1.0, .8, 0.) :\n\
                vec3(0.8,0.0, 1.0);\n\
      col = vec3( 1.) * calclight(p, raydir) * (1. - t/150.) *bc;\n\
      break;\n\
    }\n\
    if(t > 1000.)\n\
    {\n\
      break;\n\
    }\n\
  }\n\
  gl_FragColor = vec4(col, 1.);\n\
}\n\
';

function onAssetsLoaded(loader) {
	//Add perlin noise for filter, make sure it's wrapping and does not have mipmap.
	loader.resources["examples/assets/perlin.jpg"].texture.baseTexture.wrapMode = PIXI.WRAP_MODES.REPEAT;
	loader.resources["examples/assets/perlin.jpg"].texture.baseTexture.mipmap = false;
	
	const perlin = new PIXI.Sprite(loader.resources["examples/assets/perlin.jpg"].texture);
	perlin.width = perlin.height = 200;
	filterContainer.addChild(perlin);
	//Build the filter
	filter = new PIXI.Filter(null, fragment, {
		time:0.0,
		noise:perlin
	});
	filterContainer.filters = [filter];
	
    // Listen for animate update.
    app.ticker.add((delta) => {
        if(true) //Check if rendering for RT actually needs to happen, for now always
		{
			app.renderer.render(filterContainer, renderTexture);
		}
		filter.uniforms.time = totalTime;
		totalTime += delta/60;
		
		//Animate the sprite somehow just to show it is actually just a sprite.
		let npx = Math.cos(totalTime*0.5)*250 + 400;
		let npy = Math.sin(totalTime*0.45)*100 + 200;
		
		let dx = sprite.x - npx;
		
		sprite.x = npx;
		sprite.y = npy;
		
		sprite.rotation = Math.atan2(sprite.y-8, dx*25)-Math.PI/2;
		
    });
}
