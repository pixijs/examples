/**
Please note that this is not the most optimal way of doing pure shader generated rendering and should be used when scene is wanted as input texture.
Check the mesh version of example for more performant version if you need only shader generated content.
* */

const app = new PIXI.Application({ background: '#1099bb' });
document.body.appendChild(app.view);

PIXI.Assets.load('examples/assets/perlin.jpg').then(onAssetsLoaded);

let filter = null;

const text = new PIXI.Text('PixiJS', { fill: 0xFFFFFF, fontSize: 80 });
text.anchor.set(0.5, 0.5);
text.position.set(app.renderer.screen.width / 2, app.renderer.screen.height / 2);

app.stage.addChild(text);

let totalTime = 0;

// Fragment shader, in real use this would be much cleaner when loaded from a file/embedded into the application as data resource.
const fragment = `//Based on this: https://www.shadertoy.com/view/wtlSWX

varying vec2 vTextureCoord;
uniform sampler2D uSampler;
uniform sampler2D noise;
uniform float time;
//Distance function. Just calculates the height (z) from x,y plane with really simple length check. Its not exact as there could be shorter distances.
vec2 dist(vec3 p)
{
  float id = floor(p.x)+floor(p.y);
  id = mod(id, 2.);
  float h = texture2D(noise, vec2(p.x, p.y)*0.04).r*5.1;
  float h2 = texture2D(uSampler, vTextureCoord).r;
  return vec2(h+h2-p.z,id);
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

function onAssetsLoaded(perlin) {
    // Add perlin noise for filter, make sure it's wrapping and does not have mipmap.
    perlin.baseTexture.wrapMode = PIXI.WRAP_MODES.REPEAT;
    perlin.baseTexture.mipmap = false;
    perlin.width = perlin.height = 200;

    // Build the filter
    filter = new PIXI.Filter(null, fragment, {
        time: 0.0,
        noise: perlin,
    });
    app.stage.filterArea = app.renderer.screen;
    app.stage.filters = [filter];

    // Listen for animate update.
    app.ticker.add((delta) => {
        filter.uniforms.time = totalTime;
        totalTime += delta / 60;
    });
}
