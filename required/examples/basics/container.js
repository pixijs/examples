var app = new PIXI.Application(800, 600, {backgroundColor : 0x1099bb});
document.body.appendChild(app.view);

var container = new PIXI.Container();

app.stage.addChild(container);

for (var j = 0; j < 5; j++) {

    for (var i = 0; i < 5; i++) {
        var bunny = PIXI.Sprite.fromImage('required/assets/basics/bunny.png');
        bunny.x = 40 * i;
        bunny.y = 40 * j;
        container.addChild(bunny);
    };
};
/*
 * All the bunnies are added to the container with the addChild method
 * when you do this, all the bunnies become children of the container, and when a container moves,
 * so do all its children.
 * This gives you a lot of flexibility and makes it easier to position elements on the screen
 */
container.x = 100;
container.y = 60;
