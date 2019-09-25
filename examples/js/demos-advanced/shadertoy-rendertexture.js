const app = new PIXI.Application({ backgroundColor: 0x1099bb });
document.body.appendChild(app.view);

app.loader
    .add('examples/assets/perlin.jpg', 'examples/assets/perlin.jpg')
    .add('shader', 'examples/assets/pixi-filters/raymarch.frag')
    .load(onAssetsLoaded);

let filter = null;
const renderTexture = PIXI.RenderTexture.create(200, 200);
const filterContainer = new PIXI.Container();

filterContainer.filterArea = new PIXI.Rectangle(0,0, 200, 200);
const sprite = new PIXI.Sprite( new PIXI.Texture(renderTexture));
sprite.anchor.set(0.5, 0.0);
app.stage.addChild(sprite);

let totalTime = 0;

// onAssetsLoaded handler builds the example.
function onAssetsLoaded(loader, res) {
	//Add perlin noise as base for filter
	loader.resources["examples/assets/perlin.jpg"].texture.baseTexture.wrapMode = PIXI.WRAP_MODES.REPEAT;
	loader.resources["examples/assets/perlin.jpg"].texture.baseTexture.mipmap = false;
	
	const perlin = new PIXI.Sprite(loader.resources["examples/assets/perlin.jpg"].texture);
	
	perlin.width = perlin.height = 200;
	filterContainer.addChild(perlin);
	//Build the filter
	filter = new PIXI.Filter(null, res.shader.data, {
		time:0.0,
		noise:perlin
	});
	filterContainer.filters = [filter];
    // Listen for animate update.
    app.ticker.add((delta) => {
        if(true) //Check if rendering actually needs to happen, for now always
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
