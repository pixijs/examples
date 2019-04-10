const app = new PIXI.Application({ backgroundColor: 0x1099bb });
document.body.appendChild(app.view);

PIXI.Loader.shared
    .add('desyrel', 'examples/assets/bitmap-font/desyrel.xml')
    .load(onAssetsLoaded);

function onAssetsLoaded() {
    const bitmapFontText = new PIXI.BitmapText('bitmap fonts are supported!\nWoo yay!', { font: '55px Desyrel', align: 'left' });

    bitmapFontText.x = 50;
    bitmapFontText.y = 200;

    app.stage.addChild(bitmapFontText);
}
