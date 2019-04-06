var app = new PIXI.Application();
document.body.appendChild(app.view);

var bol = false;

// create a texture from an image path

PIXI.loader.add('flowerTop', 'examples/assets/flowerTop.png');
PIXI.loader.load(function(loader, resources) {
    texture = resources.flowerTop.texture;
    init();
});
var texture;

function init() {
// create rotated textures
    var textures = [texture];
    var D8 = PIXI.GroupD8;
    for (var rotate = 1; rotate < 16; rotate++) {
        var h = D8.isVertical(rotate) ? texture.frame.width : texture.frame.height;
        var w = D8.isVertical(rotate) ? texture.frame.height : texture.frame.width;

      	var frame = texture.frame;
        var crop = new PIXI.Rectangle(texture.frame.x, texture.frame.y, w, h);
        var trim = crop;
        var rotatedTexture;
        if (rotate%2==0) {
        	rotatedTexture = new PIXI.Texture(texture.baseTexture, frame, crop, trim, rotate);
        } else {
            //HACK to avoid exception
			//PIXI doesnt like diamond-shaped UVs, because they are different in canvas and webgl
          	rotatedTexture = new PIXI.Texture(texture.baseTexture, frame, crop, trim, rotate-1);
          	rotatedTexture.rotate++;
        }
        textures.push(rotatedTexture);
    }

    var offsetX = app.screen.width / 16 | 0;
    var offsetY = app.screen.height / 8 | 0;
    var gridW = app.screen.width / 4 | 0;
    var gridH = app.screen.height / 5 | 0;

    //normal rotations and mirrors
    for (var i = 0; i < 16; i++) {
        // create a new Sprite using rotated texture
        var dude = new PIXI.Sprite(textures[i < 8 ? i*2 : (i-8)*2+1]);
        dude.scale.x = 0.5;
        dude.scale.y = 0.5;
        // show it in grid
        dude.x = offsetX + gridW * (i % 4);
        dude.y = offsetY + gridH * (i / 4 | 0);
        app.stage.addChild(dude);
        var text = new PIXI.Text("rotate = "+dude.texture.rotate, { fontFamily:'Courier New', fontSize:'12px', fill: 'white', align: 'left' });
        text.x = dude.x;
        text.y = dude.y - 20;
        app.stage.addChild(text);
    }
}
