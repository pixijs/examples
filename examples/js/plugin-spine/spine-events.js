const app = new PIXI.Application();
document.body.appendChild(app.view);

// load spine data
app.loader
    .add('p1', 'examples/assets/pixi-spine/hero-pro.json')
    .add('p2', 'examples/assets/pixi-spine/spineboy-pro.json')
    .load(onAssetsLoaded);

function onAssetsLoaded(loader, res) {
    // setup spine
    const p1 = new PIXI.spine.Spine(res.p1.spineData);
        p1.position.set(200,app.screen.height);// position
        p1.state.setAnimation(0, 'idle', true);// play animation
        p1.state.timeScale = 0.3;
    const p2 = new PIXI.spine.Spine(res.p2.spineData);
        p2.position.set(500,app.screen.height);// position
        p2.scale.set(-0.5,0.5);// scale
        p2.state.setAnimation(0, 'idle', true);// play animation
        p2.state.timeScale = 0.5;
    app.stage.addChild(p1,p2);


    //events listener for p1
    //distribute spine events
    function checkEvent(entry, event) {
        switch (event.data.name) {
            case 'atkHit':
                event_atkHit(entry, event);
                event_showName(entry, event);
              break;
            default:break;
        }
    };
    // spine events hit (hit 5 time and death)
    let dmg = 0;
    function event_atkHit(entry, event) {
        if(dmg++===5){
            p2.state.setAnimation(0, 'death', false).timeScale = 2;
        }else if(dmg<=5){
            p2.state.setAnimation(1, 'run-to-idle', false);
            p2.state.addEmptyAnimation(1, 0.1, 0.1);
        }
    };
    // spine events text
    function event_showName(entry, event) {
        const txt = new PIXI.Text(event.data.name,{fill: "white"});
        txt.position.set(5,app.screen.height);
        app.stage.addChild(txt);
    };
    p1.state.addListener({ event: checkEvent });

    
    //move txt events name
    app.ticker.add((delta) => {
        app.stage.children.forEach(child => {
            child.text && child.y--;
        });
    });
    //click on screen allowed
    app.stage.interactive = true;
    app.stage.on('pointerdown', () => {
        p1.state.setAnimation(1, 'attack', false);
        p1.state.addEmptyAnimation(1, 0.1, 0);
    });
}
