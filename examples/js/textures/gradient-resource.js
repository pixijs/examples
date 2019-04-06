// PixiJS V5 Texture-Resource API + canvas2d gradient API + WebGL texImage2D
// Look here for advanced upload function:
// https://github.com/pixijs/pixi.js/blob/dev/packages/core/src/textures/resources/BaseImageResource.js#L54

class GradientResource extends PIXI.resources.Resource {
    constructor() {
        // pass width and height. (0,0) if we dont know yet
        // gradient needs only 1 pixel height
        super(256, 1);
    }

    upload(renderer, baseTexture, glTexture) {
        var width = this.width; // default size or from baseTexture?
        var height = this.height; // your choice.

        // temporary canvas, we dont need it after texture is uploaded to GPU
        var canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        var ctx = canvas.getContext('2d');

        var grd = ctx.createLinearGradient(0, 0, width, 0);
        grd.addColorStop(0, 'rgba(255, 255, 255, 0.0)');
        grd.addColorStop(.3, 'cyan');
        grd.addColorStop(0.7, 'red');
        grd.addColorStop(1, 'green');

        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, width, height);

        // This info ios usseful if upload happens second time
        // Some people use that to track used memory
        glTexture.width = width;
        glTexture.height = height;

        // PURE WEBGL CALLS - that's what its all about.
        // PixiJS cant wrap all that API, we give you acceess to it!
        var gl = renderer.gl;
        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, baseTexture.premultiplyAlpha);
        gl.texImage2D(baseTexture.target, 0, baseTexture.format, baseTexture.format, baseTexture.type, canvas);

        return true;
    }
}

var app = new PIXI.Application(800, 600, { antialias: true });
document.body.appendChild(app.view);

var gradBaseTexture = new PIXI.BaseTexture(new GradientResource());
// Here you can fake baseTexture size to avoid resizing all sprites
// There can be multiple baseTextures per gradient, but be careful:
// resource will spawn more glTextures!
gradBaseTexture.setSize(500, 50);

var gradTexture = new PIXI.Texture(gradBaseTexture);

var sprite = new PIXI.Sprite(gradTexture);
sprite.position.set(100, 100);
sprite.rotation = Math.PI / 8;
app.stage.addChild(sprite);
