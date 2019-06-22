// This examples is hard
// To understand it, you have to carefully read all readme`s and other examples of respective plugins
// Be ready to study the plugins code. Please use latest version of those libs
// Used plugins: pixi-projection, pixi-display

const app = new PIXI.Application({ autoStart: false, antialias: true });
document.body.appendChild(app.view);
app.stage = new PIXI.display.Stage();

const { loader } = app;

const camera = new PIXI.projection.Camera3d();
camera.position.set(app.screen.width / 2, app.screen.height / 2);
camera.setPlanes(350, 30, 10000);
camera.euler.x = Math.PI / 5.5;
app.stage.addChild(camera);

const cards = new PIXI.projection.Container3d();
cards.position3d.y = -50;
// MAKE CARDS LARGER:
cards.scale3d.set(1.5);
camera.addChild(cards);

const shadowGroup = new PIXI.display.Group(1);
const cardsGroup = new PIXI.display.Group(2, ((item) => {
    item.zOrder = item.getDepth();
    item.parent.checkFace();
}));

// Layers are 2d elements but we use them only to show stuff, not to transform items, so its fine :)
camera.addChild(new PIXI.display.Layer(shadowGroup));
camera.addChild(new PIXI.display.Layer(cardsGroup));
// we could also add layers in the stage, but then we'll need extra layer for the text

// load assets
loader.add('cards', 'examples/assets/pixi-projection/cards.json');
loader.add('table', 'examples/assets/pixi-projection/table.png');
loader.load(onAssetsLoaded);

// blur for shadow. Do not use it in production, bake shadow into the texture!
const blurFilter = new PIXI.filters.BlurFilter();
blurFilter.blur = 0.2;

class CardSprite extends PIXI.projection.Container3d {
    constructor() {
        super();

        const tex = loader.resources.cards.textures;

        // shadow will be under card
        this.shadow = new PIXI.projection.Sprite3d(tex['black.png']);
        this.shadow.anchor.set(0.5);
        this.shadow.scale3d.set(0.98);
        this.shadow.alpha = 0.7;
        // TRY IT WITH FILTER:
        this.shadow.filters = [blurFilter];
        // all shadows are UNDER all cards
        this.shadow.parentGroup = shadowGroup;
        this.inner = new PIXI.projection.Container3d();
        // cards are above the shadows
        // either they have back, either face
        this.inner.parentGroup = cardsGroup;

        this.addChild(this.shadow);
        this.addChild(this.inner);

        // construct "inner" from back and face
        this.back = new PIXI.projection.Sprite3d(tex['cover1.png']);
        this.back.anchor.set(0.5);
        this.face = new PIXI.projection.Container3d();
        this.inner.addChild(this.back);
        this.inner.addChild(this.face);
        this.code = 0;
        this.showCode = -1;
        this.inner.euler.y = Math.PI;
        this.scale3d.set(0.2);

        // construct "face" from four sprites
        this.createFace();
    }

    createFace() {
        const { face } = this;
        face.removeChildren();
        const tex = loader.resources.cards.textures;
        const sprite = new PIXI.projection.Sprite3d(tex['white1.png']);
        const sprite2 = new PIXI.projection.Sprite3d(PIXI.Texture.EMPTY);
        const sprite3 = new PIXI.projection.Sprite3d(PIXI.Texture.EMPTY);
        const sprite4 = new PIXI.projection.Sprite3d(PIXI.Texture.EMPTY);
        sprite2.y = -120;
        sprite2.x = -80;
        sprite3.y = 70;
        sprite3.x = 40;
        sprite4.y = -70;
        sprite4.x = -100;

        sprite.anchor.set(0.5);
        sprite2.anchor.set(0.5);
        sprite3.anchor.set(0.5);
        face.addChild(sprite);
        face.addChild(sprite2);
        face.addChild(sprite3);
        face.addChild(sprite4);

        this.updateFace();
    }

    updateFace() {
        const tex = loader.resources.cards.textures;
        const code = this.showCode === -1 ? 0 : this.showCode;
        const num = code & 0xf;
        const suit = code >> 4;

        const { face } = this;
        face.children[1].texture = num > 0 ? tex[`${suit % 2}_${num}.png`] : PIXI.Texture.EMPTY;
        if (!face.children[1].texture) {
            console.log('FAIL 1 ', `${suit % 2}_${num}.png`);
        }
        face.children[2].texture = suit !== 0 ? tex[`${suit}_big.png`] : PIXI.Texture.EMPTY;
        if (!face.children[2].texture) {
            console.log('FAIL 2', `${suit}_big.png`);
        }
        face.children[3].texture = suit !== 0 ? tex[`${suit}_small.png`] : PIXI.Texture.EMPTY;
        if (!face.children[3].texture) {
            console.log('FAIL 3', `${suit}_small.png`);
        }
    }

    update(dt) {
        const { inner } = this;
        if (this.code > 0 && inner.euler.y > 0) {
            inner.euler.y = Math.max(0, inner.euler.y - dt * 5);
        }
        if (this.code === 0 && inner.euler.y < Math.PI) {
            inner.euler.y = Math.min(Math.PI, inner.euler.y + dt * 5);
        }
        inner.position3d.z = -Math.sin(inner.euler.y) * this.back.width;

        // assignment is overriden, so its actually calling euler.copyFrom(this.euler)
        this.shadow.euler = inner.euler;
    }

    checkFace() {
        const { inner } = this;
        let cc;

        if (!inner.isFrontFace()) {
        // user sees the back
            cc = 0;
        } else {
        // user sees the face
            cc = this.showCode || this.code;
        }
        if (cc === 0) {
            this.back.renderable = true;
            this.face.renderable = false;
        } else {
            this.back.renderable = false;
            this.face.renderable = true;
        }

        if (cc !== this.showCode) {
            this.showCode = cc;
            this.updateFace();
        }
    }
}

function dealHand() {
    cards.removeChildren();
    for (let i = 0; i < 5; i++) {
        const card = new CardSprite();
        card.position3d.x = 56 * (i - 2);
        if ((Math.random() * 3 | 0) === 0) {
            onClick({ target: card });
        }
        card.update(0);
        card.interactive = true;
        card.on('mouseup', onClick);
        card.on('touchend', onClick);
        cards.addChild(card);
    }
}

function onClick(event) {
    const { target } = event;
    if (target.code === 0) {
        const num = (Math.random() * 13 | 0) + 2;
        const suit = (Math.random() * 4 | 0) + 1;
        target.code = suit * 16 + num;
    } else {
        target.code = 0;
    }
}

function addText(txt) {
    const style = {
        font: 'normal 80px Arial',
        fill: '#f5ffe3',
        dropShadow: true,
        dropShadowColor: 'rgba(1, 1, 1, 0.4)',
        dropShadowDistance: 6,
        wordWrap: false,
    };
    const basicText = new PIXI.projection.Text3d(txt, style);
    basicText.position3d.x = -240;
    basicText.position3d.y = 20;
    camera.addChild(basicText);
}

function onAssetsLoaded() {
    // background must be UNDER camera, it doesnt have z-index or any other bullshit for camera
    app.stage.addChildAt(new PIXI.Sprite(loader.resources.table.texture), 0);
    dealHand();
    addText('Tap on cards');
    // start animating
    app.start();
}

app.ticker.add((deltaTime) => {
    for (let i = 0; i < cards.children.length; i++) {
        cards.children[i].update(deltaTime / 60.0);
    }

    // We are gonna sort and show correct side of card,
    // so we need updateTransform BEFORE the sorting will be called.
    // otherwise this part will be tardy by one frame
    camera.updateTransform();
});
