PIXI.Loader.registerPlugin(PIXI.WebfontLoaderPlugin);

const app = new PIXI.Application({ backgroundColor: 0x1099bb });
document.body.appendChild(app.view);

// Load from any font file!
app.loader.add({ name: 'name for ChaChicle', url: 'examples/assets/webfont-loader/ChaChicle.ttf' });
app.loader.add({ name: 'name for Lineal', url: 'examples/assets/webfont-loader/Lineal.otf' });
app.loader.add({ name: 'name for Dotrice', url: 'examples/assets/webfont-loader/Dotrice-Regular.woff' });
app.loader.add({ name: 'name for Crosterian', url: 'examples/assets/webfont-loader/Crosterian.woff2' });

app.loader.onComplete.once(() => {
    const text1 = new PIXI.Text('ChaChicle.ttf', new PIXI.TextStyle({ fontFamily: 'name for ChaChicle', fontSize: 50 }));
    const text2 = new PIXI.Text('Lineal.otf', new PIXI.TextStyle({ fontFamily: 'name for Lineal', fontSize: 50 }));
    const text3 = new PIXI.Text('Dotrice.woff', new PIXI.TextStyle({ fontFamily: 'name for Dotrice', fontSize: 50 }));
    const text4 = new PIXI.Text('Crosterian.woff2', new PIXI.TextStyle({ fontFamily: 'name for Crosterian', fontSize: 50 }));

    text2.y = 150;
    text3.y = 300;
    text4.y = 450;

    app.stage.addChild(text1);
    app.stage.addChild(text2);
    app.stage.addChild(text3);
    app.stage.addChild(text4);
});

app.loader.load();
