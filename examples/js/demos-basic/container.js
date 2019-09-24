const app = new PIXI.Application({
    width: 800, height: 600, backgroundColor: 0x1099bb, resolution: window.devicePixelRatio || 1,
});
document.body.appendChild(app.view);

const container = new PIXI.Container();

app.stage.addChild(container);

// Create a new texture
const texture = PIXI.Texture.from('examples/assets/bunny.png');

// Create a 5x5 grid of bunnies
for (let i = 0; i < 25; i++) {
    const bunny = new PIXI.Sprite(texture);
    bunny.anchor.set(0.5);
    bunny.x = (i % 5) * 40;
    bunny.y = Math.floor(i / 5) * 40;
    container.addChild(bunny);
}

// Move container to the center
container.x = app.screen.width / 2;
container.y = app.screen.height / 2;

// Center bunny sprite in local container coordinates
container.pivot.x = container.width / 2;
container.pivot.y = container.height / 2;

// Listen for animate update
app.ticker.add((delta) => {
    // rotate the container!
    // use delta to create frame-independent transform
    container.rotation -= 0.01 * delta;
});


//this demo can use dat.gui
const gui = new dat.GUI();
const [f1,f2] = [gui.addFolder('container'),gui.addFolder('children[0]')];
f1.add(container.position,"x").min(0).max(app.screen.width).step(1).name('.position.x');
f1.add(container.position,"y").min(0).max(app.screen.height).step(1).name('.position.y');
f1.add(container.position,"x").min(0).max(app.screen.width).step(1).name('.pivot.x');
f1.add(container,"alpha").min(0).max(1).step(0.01);
f1.add(container.position,"y").min(0).max(app.screen.height).step(1).name('.pivot.y');
f1.add(container,"rotation").step(0.01).listen();

f2.add(container.children[0],"x").min(0).max(container.height).step(1).name('.position.x');
f2.add(container.children[0],"y").min(0).max(container.height).step(1).name('.position.y');
f2.add(container.children[0],"rotation").min(-Math.PI).max(Math.PI).step(0.01).name('rotation');
f2.add(container.children[0],"alpha").min(0).max(10).step(0.01);
