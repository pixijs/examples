const app = new PIXI.Application({ antialias: true });
document.body.appendChild(app.view);

const sprite = PIXI.Sprite.fromImage('examples/assets/bg_rotate.jpg');

// // BEZIER CURVE ////
// information: https://en.wikipedia.org/wiki/Bézier_curve

const realPath = new PIXI.Graphics();

realPath.lineStyle(2, 0xFFFFFF, 1);
realPath.moveTo(0, 0);
realPath.lineTo(100, 200);
realPath.lineTo(200, 200);
realPath.lineTo(240, 100);

realPath.position.x = 50;
realPath.position.y = 50;

app.stage.addChild(realPath);

const bezier = new PIXI.Graphics();

bezier.lineStyle(5, 0xAA0000, 1);
bezier.bezierCurveTo(100, 200, 200, 200, 240, 100);

bezier.position.x = 50;
bezier.position.y = 50;

app.stage.addChild(bezier);

// // BEZIER CURVE 2 ////
const realPath2 = new PIXI.Graphics();

realPath2.lineStyle(2, 0xFFFFFF, 1);
realPath2.moveTo(0, 0);
realPath2.lineTo(0, -100);
realPath2.lineTo(150, 150);
realPath2.lineTo(240, 100);

realPath2.position.x = 320;
realPath2.position.y = 150;

app.stage.addChild(realPath2);

const bezier2 = new PIXI.Graphics();

bezier2.lineTextureStyle(10, sprite.texture);
bezier2.bezierCurveTo(0, -100, 150, 150, 240, 100);

bezier2.position.x = 320;
bezier2.position.y = 150;

app.stage.addChild(bezier2);

// // ARC ////
const arc = new PIXI.Graphics();

arc.lineStyle(5, 0xAA00BB, 1);
arc.arc(600, 100, 50, Math.PI, 2 * Math.PI);

app.stage.addChild(arc);

// // ARC 2 ////
const arc2 = new PIXI.Graphics();

arc2.lineStyle(6, 0x3333DD, 1);
arc2.arc(650, 270, 60, 2 * Math.PI, 3 * Math.PI / 2);

app.stage.addChild(arc2);

// // ARC 3 ////
const arc3 = new PIXI.Graphics();

arc3.lineTextureStyle(20, sprite.texture);
arc3.arc(650, 420, 60, 2 * Math.PI, 2.5 * Math.PI / 2);

app.stage.addChild(arc3);

// / Hole ////
const rectAndHole = new PIXI.Graphics();

rectAndHole.beginFill(0x00FF00);
rectAndHole.drawRect(350, 350, 150, 150);
rectAndHole.beginHole();
rectAndHole.drawCircle(375, 375, 25);
rectAndHole.drawCircle(425, 425, 25);
rectAndHole.drawCircle(475, 475, 25);
rectAndHole.endHole();
rectAndHole.endFill();

app.stage.addChild(rectAndHole);

// // Line Texture Style ////
const beatifulRect = new PIXI.Graphics();

beatifulRect.lineTextureStyle(20, sprite.texture);
beatifulRect.beginFill(0xFF0000);
beatifulRect.drawRect(80, 350, 150, 150);
beatifulRect.endFill();

app.stage.addChild(beatifulRect);
