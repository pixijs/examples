const PROJ = PIXI.projection;

class BagPart extends PROJ.Container3d {
    constructor(tIn, tOut = undefined) {
        super();

        this._axis = new PROJ.Container3d();
        this._cent = new PROJ.Container3d();
        this._closed = false;
        this._closing = false;
        this._duration = 0;
        this._fader = 0;

        this._in = new PROJ.Sprite3d(tIn);

        this.sideWidth = this._in.width;
        this.sideHeight = this._in.height;

        this._cent.addChild(this._in);

        if (tOut) {
            this._out = new PROJ.Sprite3d(tOut);
            this._out.renderable = false;
            this._out.tint = 0xff00ff;
            this._cent.addChild(this._out);
        }

        this._cent.pivot3d.set(this.sideWidth / 2, this.sideHeight / 2);
        this._cent.position3d.set(this.sideWidth / 2, this.sideHeight / 2);

        this._axis.addChild(this._cent);
        this.addChild(this._axis);

        this.rotPoint = new PIXI.ObservablePoint(this._rChange, this, -1, 0);
        this._rChange();

        this.parentSide = undefined;
        this.parentLink = undefined;

        this.index = 0;
    }

    update(dt) {
        if (this._closing) {
            this._closeBech(dt);
        }

        if (this._childSide) {
            this._childSide.update(dt);
        }
    }

    _closeBech(dt) {
        const e = this.euler;

        if (this._fader >= 1) {
            this._closed = true;
            this._closing = false;
            this._fader = 1;
            this._closingEnd();
        } else {
            this._fader += dt / this._duration;
        }

        const r = -this._fader * Math.PI;

        this._axis.euler.y = r;
        if (this._out) {
            this._out.renderable = this._fader > 0.5;
            this._in.renderable = this._fader < 0.5;
        } else {
            this._in.alpha = 1 - this._fader;
        }
    }

    _closingEnd() {
        this.emit('closed', this);
    }

    _rChange() {
        const p = this.rotPoint;
        const p3d = this._axis.pivot3d;
        const angle = Math.atan2(-p.y, p.x);

        p3d.x = (p.x + 1) * 0.5 * this.sideWidth;
        p3d.y = (p.y + 1) * 0.5 * this.sideHeight;

        this._axis.euler.z = angle;
        this.euler.z = -angle;
    }

    get realLink() {
        return new PIXI.Point(
            this.sideWidth * (this.linkPoint.x + 1) * 0.5,
            this.sideHeight * (this.linkPoint.y + 1) * 0.5,
        );
    }

    close(duration = 300) {
        if (this._closed || this._closing) {
            return;
        }

        this._duration = duration;
        this._closing = true;
        this._fader = 0;
    }

    bind(parent, link = [-1, 0]) {
        this.parentSide = parent;
        this.parentLink = link;
        this.index = parent.index + 1;

        const x = 0.5 * (link[0] + 1) * parent.sideWidth;
        const y = 0.5 * (link[1] + 1) * parent.sideHeight;
        const piv = parent._axis.pivot3d;

        this.position.x = x + parent.position.x - piv.x;
        this.position.y = y + parent.position.y - piv.y;

        if (link[0] && this.index % 2 === 1) {
            this._cent.scale3d.x = -1;
        }

        if (link[1] && this.index % 2 === 1) {
            this._cent.scale3d.y = -1;
        }
    }

    link() {
        const p = this.parentSide;
        const link = this.parentLink;

        if (!p) return;

        p._axis.addChild(this);

        const x = p.sideWidth * (link[0] + 1) * 0.5;
        const y = p.sideHeight * (link[1] + 1) * 0.5;

        this.position.x = x;
        this.position.y = y;
    }
}

class Bag extends PROJ.Container3d {
    constructor() {
        super();
        this._sides = [];
    }

    pack(side, parent = undefined, link = undefined) {
        const t = this.tall;
        const h = this.head;

        this.addChild(side);
        if (h) {
            this.addChild(h);
            side.rotPoint.set(-link[0], -link[1]);
        }
        this._sides.push(side);

        if (parent) {
            side.bind(parent, link);
        }

        return this;
    }

    close(duration = 300) {
        const len = this._sides.length;
        let index = len - 1;

        const c = (side) => {
            if (index < 0) return;

            let ch = this._sides[index];
            if (side) {
                side.link();
            }

            // skip second
            if (index === 1) {
                index--;
                ch = this._sides[index];
            }

            ch.once('closed', c);
            ch.close(duration / len);

            index--;
        };
        c();
    }

    update(dt) {
        this._sides.forEach((e) => {
            e.update(dt);
        });
    }

    get tall() {
        return this._sides[this.children.length - 1];
    }

    get head() {
        return this._sides[0];
    }
}

// Create our application instance
const app = new PIXI.Application({
    width: window.innerWidth,
    height: window.innerHeight,
    backgroundColor: 0x2c3e50,
});
document.body.appendChild(app.view);

// Load the bunny texture
app.loader.add('bunny', 'https://pixijs.io/examples/examples/assets/bunny.png')
    .load(startup);

function startup() {
    const camera = new PIXI.projection.Camera3d();
    camera.position.set(app.screen.width / 2, app.screen.height / 2);
    camera.setPlanes(100, 45, 1000);
    app.stage.addChild(camera);

    const t = app.loader.resources.bunny.texture;
    const pack = new Bag();

    const a = new BagPart(t, t);
    const b = new BagPart(t);
    const c = new BagPart(t);
    const d = new BagPart(t);
    const e = new BagPart(t);

    a.rotPoint.set(1, 0);

    pack.pack(a)
        .pack(b, a, [1, 0])
        .pack(c, b, [1, 0])
        .pack(d, c, [0, 1])
        .pack(e, a, [0, -1]);

    pack.scale.set(3);

    app.stage.interactive = true;
    app.stage.on('click', () => {
        pack.close(1000);
    });
    camera.addChild(pack);

    // Listen for animate update
    app.ticker.add((delta) => {
        // Rotate mr rabbit clockwise
        pack.update(1000 / 60);
        camera.updateTransform();
    });
}
