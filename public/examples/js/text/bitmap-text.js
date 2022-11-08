const app = new PIXI.Application({ background: '#1099bb' });
document.body.appendChild(app.view);

PIXI.Assets.load('examples/assets/bitmap-font/desyrel.xml').then(() => {
    const bitmapFontText = new PIXI.BitmapText(
        'bitmap fonts are supported!\nWoo yay!', {
            fontName: 'Desyrel',
            fontSize: 55,
            align: 'left',
        },
    );

    bitmapFontText.x = 50;
    bitmapFontText.y = 200;

    app.stage.addChild(bitmapFontText);
});
