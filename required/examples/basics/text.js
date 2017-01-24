var app = new PIXI.Application(800, 600, {backgroundColor: 0x1099bb});
document.body.appendChild(app.view);

var basicText = new PIXI.Text('Basic text in pixi');
basicText.x = 30;
basicText.y = 90;

app.stage.addChild(basicText);

var style = new PIXI.TextStyle({
    fontFamily: 'Arial',
    fontSize: '36px',
    fontStyle: 'italic',
    fontWeight: 'bold',
    fill: '#F7EDCA',
    stroke: '#4a1850',
    strokeThickness: 5,
    dropShadow: true,
    dropShadowColor: '#000000',
    dropShadowAngle: Math.PI / 6,
    dropShadowDistance: 6,
    wordWrap: true,
    wordWrapWidth: 440
});

var richText = new PIXI.Text('Rich text with a lot of options and across multiple lines', style);
richText.x = 30;
richText.y = 180;

app.stage.addChild(richText);
