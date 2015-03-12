
// create an new instance of a pixi stage
var stage = new PIXI.Container();

// create a renderer instance
var renderer = PIXI.autoDetectRenderer(400, 300,{backgroundColor : 0x66FF99});

// add the renderer view element to the DOM
document.getElementById('example').appendChild(renderer.view);

var bol = false;

// create a texture from an image path
var texture = PIXI.Texture.fromImage("_assets/flowerTop.png");
texture.baseTexture.on("loaded", function(){

    console.log("texture loaded !")

});

// create a second texture
var secondTexture = PIXI.Texture.fromImage("_assets/eggHead.png");

// create a new Sprite using the texture
var bunny = new PIXI.Sprite(texture);

// center the sprites anchor point
bunny.anchor.set(0.5);

// move the sprite to the center of the screen
bunny.position.x = 200;
bunny.position.y = 150;

stage.addChild(bunny);

// make the sprite interactive
bunny.interactive = true;

    bunny.click = function()
    {
        bol = !bol;

        if(bol)
        {
            bunny.texture = secondTexture;
        }
        else{
            bunny.texture = texture;
        }
    }

    requestAnimationFrame(animate);

    function animate() {
        requestAnimationFrame(animate);

        // just for fun, let's rotate mr rabbit a little
        bunny.rotation += 0.1;

        // render the stage
        renderer.render(stage);
    }
