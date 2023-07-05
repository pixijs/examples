const app = new PIXI.Application({ background: '#1099bb' });
document.body.appendChild(app.view);

// lets add our container
const container = new PIXI.Container();


// allows for container's children to have a z-Index
// this is very important, without sortable children, Sprite.zIndex doesnt work!
container.sortableChildren = true;
app.stage.addChild(container);


// Initiating our monsters/sprites
const blue = PIXI.Sprite.from('examples/assets/helmlok.png');
const green = PIXI.Sprite.from('examples/assets/flowerTop.png');
const pink = PIXI.Sprite.from('examples/assets/eggHead.png');
const skully = PIXI.Sprite.from('examples/assets/skully.png');

// looping our sprites to put them in position
const monsters = [blue, green, pink, skully];
monsters.forEach((sprite, index) => {
    sprite.anchor.set(0.5);
    sprite.x = 250 + 50 * index + 1;
    sprite.y = 250 + 50 * index + 1;

    // allow for our sprites to be interactive (have events such as on mounse over)
    sprite.interactive = true;

    // when the mouse in on top of them, increase their z index
    // so they come on top of other sprites
    sprite.on('pointerover', () => {
        this.isOver = true;
        if (this.isdown) {
            return;
        }
        sprite.zIndex = 10;
        console.log(sprite.zIndex);
    });

    // when the mouse leaves them, reduce their z-index
    // so they go back to their original position
    sprite.on('pointerout', () => {
        this.isOver = false;
        if (this.isdown) {
            return;
        }
        sprite.zIndex = 0;
    });
    container.addChild(sprite);
});
