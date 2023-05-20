// This example logs the order of events hover-related events in the scene.
const app = new PIXI.Application({
    antialias: true,
    background: '#1099bb',
});
document.body.appendChild(app.view);

const title = app.stage.addChild(new PIXI.Text(`Move your mouse slowly over the boxes to
    see the order of pointerenter, pointerleave,
    pointerover, pointerout events on each target!`, {
    fontSize: 16,
}));

title.x = 2;

const logs = [];
const logText = app.stage.addChild(new PIXI.Text('', {
    fontSize: 14,
}));

logText.y = 80;
logText.x = 2;

app.stage.name = 'stage';

// Mount outer black box
const blackBox = app.stage.addChild(new PIXI.Graphics()
    .beginFill(0)
    .drawRect(0, 0, 400, 400)
    .endFill());
blackBox.name = 'black box';
blackBox.x = 400;

// Mount white box inside the white one
const whiteBox = blackBox.addChild(new PIXI.Graphics()
    .beginFill(0xffffff)
    .drawRect(100, 100, 200, 200)
    .endFill());
whiteBox.name = 'white box';

// Enable interactivity everywhere!
app.stage.interactive = true;
app.stage.hitArea = app.screen;
whiteBox.interactive = true;
blackBox.interactive = true;

function onEvent(e) {
    const type = e.type;
    const targetName = e.target.name;
    const currentTargetName = e.currentTarget.name;

    // Add event to top of logs
    logs.push(`${currentTargetName} received ${type} event (target is ${targetName})`);

    if (currentTargetName === 'stage'
        || type === 'pointerenter'
        || type === 'pointerleave') {
        logs.push('-----------------------------------------', '');
    }

    // Prevent logs from growing too long
    if (logs.length > 30) {
        while (logs.length > 30) {
            logs.shift();
        }
    }

    // Update logText
    logText.text = logs.join('\n');
}

[app.stage, whiteBox, blackBox].forEach((object) => {
    object.addEventListener('pointerenter', onEvent);
    object.addEventListener('pointerleave', onEvent);
    object.addEventListener('pointerover', onEvent);
    object.addEventListener('pointerout', onEvent);
});
