PIXI.Loader.registerPlugin(PIXI.WebfontLoaderPlugin);

const app = new PIXI.Application({ backgroundColor: 0x1099bb });
document.body.appendChild(app.view);

// Bundle of fonts created with Transfonter
app.loader.add({ name: 'Bundle of fonts', url: 'examples/assets/webfont-loader/stylesheet.css' });

app.loader.onComplete.once(() => {
    const text1 = new PIXI.Text('ChaChicle', new PIXI.TextStyle({ fontFamily: 'ChaChicle', fontSize: 65 }));
    const text2 = new PIXI.Text('Lineal', new PIXI.TextStyle({ fontFamily: 'Lineal', fontSize: 65 }));
    const text3 = new PIXI.Text('Dotrice', new PIXI.TextStyle({ fontFamily: 'Dotrice', fontSize: 65 }));
    const text4 = new PIXI.Text('Crosterian', new PIXI.TextStyle({ fontFamily: 'Crosterian', fontSize: 65 }));

    text2.y = 150;
    text3.y = 300;
    text4.y = 450;

    app.stage.addChild(text1);
    app.stage.addChild(text2);
    app.stage.addChild(text3);
    app.stage.addChild(text4);
});

app.loader.load();
