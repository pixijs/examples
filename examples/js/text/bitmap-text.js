var app = new PIXI.Application(800, 600, { backgroundColor: 0x1099bb } );
document.body.appendChild(app.view);

PIXI.loader
    .add('desyrel', 'examples/assets/bitmap-font/desyrel.xml')
    .load(onAssetsLoaded);

function onAssetsLoaded() {
    var bitmapFontText = new PIXI.extras.BitmapText('bitmap fonts are supported!\nWoo yay!', { font: '55px Desyrel', align: 'left' });

    bitmapFontText.x = 50;
    bitmapFontText.y = 200;

    app.stage.addChild(bitmapFontText);
}
