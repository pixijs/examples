var app = new PIXI.Application(800, 600, {backgroundColor: 0x707070});
document.body.appendChild(app.view);

//compressed textures setup

PIXI.compressedTextures.detectExtensions(app.renderer);
var loader = new PIXI.loaders.Loader();
loader.pre(PIXI.compressedTextures.imageParser());

// in this example you can see what can happen when pixi does not respect premultiplied alpha
// actually, DDS is never premultiplied in videomemory, but pixi doesn't know about it

var textStyle = { fill: 0xffffff };
function createSprite(texture, text) {
	var sprite = new PIXI.Sprite(texture);
	sprite.addChild(new PIXI.Text(text, textStyle));
	sprite.anchor.set(0.5, 1);
	sprite.children[0].anchor.set(0.5, 0);
	return sprite;
}

loader.add('house_png', 'required/assets/compressed/dracula_house_4.png')
	.add('house_png_2', 'required/assets/compressed/dracula_house_4.png')
    .add('house_dds', 'required/assets/compressed/dracula_house_4.dds')
	.add('house_dds_2', 'required/assets/compressed/dracula_house_4.dds')
    .load(function(loader, resources) {
        var spr1 = createSprite(resources.house_png.texture, "PNG premultiplied=true");
        var spr2 = createSprite(resources.house_png_2.texture, "PNG premultiplied=false");
		var spr3 = createSprite(resources.house_dds.texture, "DDS premultiplied=true");
		var spr4 = createSprite(resources.house_dds_2.texture, "DDS premultiplied=false");
		
		resources.house_png_2.texture.baseTexture.premultipliedAlpha = false;
		resources.house_dds_2.texture.baseTexture.premultipliedAlpha = false;
		
		
		spr1.position.set(250, 250);
		spr1.scale.set(0.5);
		
		spr2.position.set(450, 250);
		spr2.scale.set(0.5);
		
		spr3.position.set(250, 500);
		spr3.scale.set(0.5);
		
		spr4.position.set(450, 500);
		spr4.scale.set(0.5);
		
        app.stage.addChild(spr1, spr2, spr3, spr4);
    });
