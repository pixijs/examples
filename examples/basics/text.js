var renderer = PIXI.autoDetectRenderer(800, 600,{backgroundColor : 0x1099bb});
document.body.appendChild(renderer.view);

// create the root of the scene graph
var stage = new PIXI.Container();

var basicText = new PIXI.Text('Basic text in pixi');
basicText.x = 30;
basicText.y = 90;

stage.addChild(basicText);

var style = {
    font : 'bold italic 36px Arial',
    fill : '#F7EDCA',
    stroke : '#4a1850',
    strokeThickness : 5,
    dropShadow : true,
    dropShadowColor : '#000000',
    dropShadowAngle : Math.PI / 6,
    dropShadowDistance : 6,
    wordWrap : true,
    wordWrapWidth : 440
};

var richText = new PIXI.Text('Rich text with a lot of options and across multiple lines',style);
richText.x = 30;
richText.y = 180;

stage.addChild(richText);

// start animating
animate();

function animate() {

    requestAnimationFrame(animate);

    // render the root container
    renderer.render(stage);
}
