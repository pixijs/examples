const app = new PIXI.Application(800, 600, { backgroundColor: 0x1099bb });
document.body.appendChild(app.view);

const yellowStar = PIXI.Texture.from('examples/assets/yellowstar.png');

// Standard Sprite Button
const starButton1 = new PIXI.Sprite(yellowStar);

starButton1.position.set(50, 200);

starButton1.buttonMode = true;
starButton1.interactive = true;

starButton1.pointerdown = (event) => {
    starButton1.tint = 0x333333;
};

starButton1.pointerover = (event) => {
    starButton1.tint = 0x666666;
};

starButton1.pointerout = (event) => {
    starButton1.tint = 0xFFFFFF;
};

// Custom Hitarea Button
const starButton2 = new PIXI.Sprite(yellowStar);
starButton2.position.set(250, 200);

// Create a hitarea that matches the sprite, which will be used for point
// intersection
starButton2.hitArea = new PIXI.Polygon([
    80, 0,
    100, 50,
    160, 55,
    115, 95,
    130, 150,
    80, 120,
    30, 150,
    45, 95,
    0, 55,
    60, 50,
]);
starButton2.buttonMode = true;
starButton2.interactive = true;

starButton2.pointerdown = (event) => {
    starButton2.tint = 0x333333;
};

starButton2.pointerover = (event) => {
    starButton2.tint = 0x666666;
};

starButton2.pointerout = (event) => {
    starButton2.tint = 0xFFFFFF;
};

// With Mask, No Hit Area
const starButton3 = new PIXI.Sprite(yellowStar);

starButton3.position.set(450, 200);

starButton3.buttonMode = true;
starButton3.interactive = true;

const squareMask = new PIXI.Graphics()
    .beginFill(0xFFFFFF)
    .drawRect(starButton3.x, starButton3.y, 75, 200)
    .endFill();

starButton3.mask = squareMask;

starButton3.pointerdown = (event) => {
    starButton3.tint = 0x333333;
};

starButton3.pointerover = (event) => {
    starButton3.tint = 0x666666;
};

starButton3.pointerout = (event) => {
    starButton3.tint = 0xFFFFFF;
};

// With a Mask and Hit Area
// Hitareas ignore masks. You can still click on a button made in this way,
// even from areas covered by a mask
const starButton4 = new PIXI.Sprite(yellowStar);
starButton4.position.set(600, 200);

const squareMask2 = new PIXI.Graphics()
    .beginFill(0xFFFFFF)
    .drawRect(starButton4.x, starButton4.y, 75, 200)
    .endFill();

starButton4.mask = squareMask2;

// Again, hitarea for intersection checks
starButton4.hitArea = new PIXI.Polygon([
    80, 0,
    100, 50,
    160, 55,
    115, 95,
    130, 150,
    80, 120,
    30, 150,
    45, 95,
    0, 55,
    60, 50,
]);
starButton4.buttonMode = true;
starButton4.interactive = true;

starButton4.pointerdown = (event) => {
    starButton4.tint = 0x333333;
};

starButton4.pointerover = (event) => {
    starButton4.tint = 0x666666;
};

starButton4.pointerout = (event) => {
    starButton4.tint = 0xFFFFFF;
};

const style = new PIXI.TextStyle({ fill: '#ffffff' });

const text1 = new PIXI.Text('Standard', style);
text1.x = starButton1.x + 25;
text1.y = starButton1.y + 170;

const text2 = new PIXI.Text('Hit Area', style);
text2.x = starButton2.x + 35;
text2.y = starButton2.y + 170;

const text3 = new PIXI.Text('Mask', style);
text3.x = starButton3.x + 10;
text3.y = starButton3.y + 170;

const text4 = new PIXI.Text('Mask + Hit Area', style);
text4.x = starButton4.x - 10;
text4.y = starButton4.y + 170;

// Add to stage
app.stage.addChild(
    starButton2,
    starButton1,
    starButton3,
    starButton4,
    squareMask,
    squareMask2,
    text1,
    text2,
    text3,
    text4,
);
