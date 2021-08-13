const app = new PIXI.Application({ backgroundColor: 0x1099bb });
document.body.appendChild(app.view);

PIXI.Loader.registerPlugin(PIXI.WebfontLoaderPlugin);

PIXI.Loader.shared.add({ name: 'From Google 1', url: 'https://fonts.googleapis.com/css2?family=Montserrat' });
PIXI.Loader.shared.add({ name: 'From Google 2', url: 'https://fonts.googleapis.com/css2?family=WindSong' });


PIXI.Loader.shared.onComplete.once(() => {
    const text1 = new PIXI.Text('This text uses the\nMonserrat font from Google', new PIXI.TextStyle({ fontFamily: 'Montserrat', fontSize: 55 }));
    const text2 = new PIXI.Text('This text uses the\nWindSong font from Google', new PIXI.TextStyle({ fontFamily: 'WindSong', fontSize: 55 }));

    text2.y = 300;

    app.stage.addChild(text1);
    app.stage.addChild(text2);
});

PIXI.Loader.shared.load();
