/**
Please note that this is not the most optimal way of doing pure shader generated rendering.
Check the mesh version of example for more performant version.
This is on the other hand useful if something is being done that does not update every frame, just replace the filter scene with actual content.
**/

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
const fragment = `//Based on this: https://www.shadertoy.com/view/wtlSWX

varying vec2 vTextureCoord;
uniform sampler2D noise;
uniform float time;
//Distance function. Just calculates the height (z) from x,y plane with really simple length check. Its not exact as there could be shorter distances.
vec2 dist(vec3 p)
{
  float id = floor(p.x)+floor(p.y);
  id = mod(id, 2.);
  float h = texture2D(noise, vec2(p.x, p.y)*0.04).r*5.1;
  return vec2(h-p.z,id);
}
//Light calculation.
vec3 calclight(vec3 p, vec3 rd)
{
  vec2 eps = vec2( 0., 0.001);
  vec3 n = normalize( vec3(
    dist(p+eps.yxx).x - dist(p-eps.yxx).x,
    dist(p+eps.xyx).x - dist(p-eps.xyx).x,
    dist(p+eps.xxy).x - dist(p-eps.xxy).x
  ));
  
  vec3 d = vec3( max( 0., dot( -rd ,n)));
  
  return d;
}

void main()
{
  vec2 uv = vec2(vTextureCoord.x, 1.-vTextureCoord.y);
  uv *=2.;
  uv-=1.;
  
  vec3 cam = vec3(0.,time -2., -3.);
  vec3 target = vec3(sin(time)*0.1, time+cos(time)+2., 0. );
  float fov = 2.2;
  vec3 forward = normalize( target - cam);
  vec3 up = normalize(cross( forward, vec3(0., 1.,0.)));
  vec3 right = normalize( cross( up, forward));
  vec3 raydir = normalize(vec3( uv.x *up + uv.y * right + fov*forward));
  
  //Do the raymarch
  vec3 col = vec3(0.);
  float t = 0.;
  for( int i = 0; i < 100; i++)
  {
    vec3 p = t * raydir + cam;
    vec2 d = dist(p);
    t+=d.x*0.5;//Jump only half of the distance as height function used is not really the best for heightmaps.
    if(d.x < 0.001)
    {
      vec3 bc = d.y < 0.5 ? vec3(1.0, .8, 0.) :
                vec3(0.8,0.0, 1.0);
      col = vec3( 1.) * calclight(p, raydir) * (1. - t/150.) *bc;
      break;
    }
    if(t > 1000.)
    {
      break;
    }
  }
  gl_FragColor = vec4(col, 1.);
}
`;

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
		
		let dx = (Math.cos((totalTime-10/60)*0.5)*250 + 400) - npx;
		
		sprite.x = npx;
		sprite.y = npy;
		
		sprite.rotation = Math.atan2(sprite.y-8, dx)-Math.PI/2;
		
    });
}
