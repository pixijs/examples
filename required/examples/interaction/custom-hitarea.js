var app = new PIXI.Application( 800, 600, { backgroundColor: 0x1099bb } );
document.body.appendChild( app.view );

// A list of button data (can be tweaked and played with)
var buttons = {
    circle: {
        type: 'Circle',
        x: 70,
        y: 70,
        radius: 50,
        colour: 0xe74c3c
    },
    rectangle: {
        type: 'Rectangle',
        x: 140,
        y: 20,
        width: 100,
        height: 100,
        colour: 0x3498db
    },
    polygon: {
        type: 'Polygon',
        points: [
            550, 20,
            570, 70,
            630, 75,
            585, 115,
            600, 170,
            550, 140,
            500, 170,
            515, 115,
            470, 75,
            530, 70
        ],
        colour: 0xf1c40f
    },
    ellipse: {
        type: 'Ellipse',
        x: 300,
        y: 50,
        width: 100,
        height: 50,
        radius: 50,
        colour: 0x9b59b6
    },
    roundedRectangle: {
        type: 'RoundedRectangle',
        x: 360,
        y: 20,
        width: 100,
        height: 100,
        radius: 20,
        colour: 0x2c3e50
    },
};

// Hitarea object
// Used here to make setting up hit areas easier
function HitArea ( settings, func, displayObject ) {
    // If we don't have something to draw, we'll make our own with
    // PIXI.Graphics
    this.pairedObject = displayObject || new PIXI.Graphics();

    // If we're using Graphics, then we'll need to add this to the stage
    if ( displayObject === null ) {
        app.stage.addChild( this.pairedObject );
    }

    // This is a stored function we can call when the hitarea is clicked
    this._func = func;

    // Turns on interactive elements to show that these are buttons
    // to be clicked
    this.pairedObject.interactive = true;
    this.pairedObject.buttonMode = true;

    // If there's settings to work with
    if ( settings ) {
        // Depending on the shape desired, add a shape of that
        // kind as a 'hitarea'. This shape is used in determining whether
        // a point has intersected with the area instead of other geometry
        // the object might have
        if ( settings.type === 'Rectangle' ) {
            this.pairedObject.hitArea = new PIXI.Rectangle(
                settings.x,
                settings.y,
                settings.width,
                settings.height
            );

            // Again, if we don't have a displayObject to work with, we'll
            // make our own using Graphics
            if ( displayObject === null ) {
                this.pairedObject.beginFill( settings.colour );
                this.pairedObject.drawRect(
                    settings.x,
                    settings.y,
                    settings.width,
                    settings.height
                );
                this.pairedObject.endFill();
            }
        } else if ( settings.type === 'Circle' ) {
            this.pairedObject.hitArea = new PIXI.Circle(
                settings.x,
                settings.y,
                settings.radius
            );

            if ( displayObject === null ) {
                this.pairedObject.beginFill( settings.colour );
                this.pairedObject.drawCircle(
                    settings.x,
                    settings.y,
                    settings.radius
                );
                this.pairedObject.endFill();
            }
        } else if ( settings.type === 'Ellipse' ) {
            this.pairedObject.hitArea = new PIXI.Ellipse(
                settings.x,
                settings.y,
                settings.width / 2,
                settings.height / 2
            );

            if ( displayObject === null ) {
                this.pairedObject.beginFill( settings.colour );
                this.pairedObject.drawEllipse(
                    settings.x,
                    settings.y,
                    settings.width / 2,
                    settings.height / 2
                );
                this.pairedObject.endFill();
            }
        } else if ( settings.type === 'Polygon' ) {
            this.pairedObject.hitArea = new PIXI.Polygon(
                settings.points
            );

            if ( displayObject === null ) {
                this.pairedObject.beginFill( settings.colour );
                this.pairedObject.drawPolygon( settings.points );
                this.pairedObject.endFill();
            }
        } else if ( settings.type === 'RoundedRectangle' ) {
            this.pairedObject.hitArea = new PIXI.RoundedRectangle(
                settings.x,
                settings.y,
                settings.width,
                settings.height,
                settings.radius
            );

            if ( displayObject === null ) {
                this.pairedObject.beginFill( settings.colour );
                this.pairedObject.drawRoundedRect(
                    settings.x,
                    settings.y,
                    settings.width,
                    settings.height,
                    settings.radius
                );
                this.pairedObject.endFill();
            }
        }
    } else {
        // Make a default if we don't have a defined area specified
        this.pairedObject.hitArea = new PIXI.Rectangle( 0, 0, 50, 50 );
        if ( displayObject === null ) {
            this.pairedObject.beginFill( 0xe74c3c );
            this.pairedObject.drawRect(
                settings.x,
                settings.y,
                settings.width,
                settings.height
            );
            this.pairedObject.endFill();
        }
    }

    // Register a function to happen on an event fired by
    // the InteractionManager In short, instead of looking to hook
    // into the event of a displayObject being clicked, we instead
    // check if clicks are happening at all, then check whether it
    // hit our hitarea
    app.renderer.plugins.interaction.on( 'pointerdown',
        ( event ) => {
            console.log( 'CLICK' );
            if ( this.testForHit( event ) ) {
                this._func( event, this.pairedObject );
            }
        } );

    // We can do something similar, but this time the object will be
    // tinted when the mouse pointer intersects with the hitarea
    app.renderer.plugins.interaction.on( 'pointermove',
        ( event ) => {
            if ( this.testForHit( event ) ) {
                console.log( 'TINT' );
                this.pairedObject.tint = 0x666666;
            } else {
                this.pairedObject.tint = 0xFFFFFF;
            }
        } );

    // Test For Hit
    // Lets us check whether the mouse pointer intersects with the hitarea
    this.testForHit = function ( event ) {
        if ( this.pairedObject === null || this.pairedObject.hitArea === null ) {
            return;
        }
        var mouseCoords = event.data.global;
        return this.pairedObject.hitArea.contains( mouseCoords.x, mouseCoords.y );
    };
}

// A few options to control how the bunny sprite moves
var spinBunny = true;
var speedStep = 0.1;
var spinSpeed = 0.1;
var moveSpeed = 100;
var moveBunny = false;

// Functions to change how the bunny moves
function onClickSpin( event, pairedObject ) {
    spinBunny = !spinBunny;
}

function onClickReverseSpin( event, pairedObject ) {
    spinSpeed = -spinSpeed;
    speedStep = -speedStep;
}

function onClickIncreaseSpeed( event, pairedObject ) {
    spinSpeed += speedStep;
}

function onClickDecreaseSpeed( event, pairedObject ) {
    spinSpeed -= speedStep;

    if ( ( speedStep > 0 && spinSpeed < 0 ) || ( speedStep < 0 && spinSpeed > 0 ) ) {
        spinSpeed = 0;
    }
}

function onClickResetSpeed( event, pairedObject ) {
    spinSpeed = speedStep;
}

function onClickMove( event, pairedObject ) {
    moveBunny = !moveBunny;
}

// Create the sprite for our Sprite based button
var bunnyButtonSprite = PIXI.Sprite.from( 'required/assets/basics/bunny.png' );
bunnyButtonSprite.x = 650;
bunnyButtonSprite.y = 20;
bunnyButtonSprite.scale.set( 3 );
app.stage.addChild( bunnyButtonSprite );

var circleButton = new HitArea( buttons.circle, onClickSpin, null );

var rectButton = new HitArea( buttons.rectangle, onClickReverseSpin, null );

var ellipseButton = new HitArea( buttons.ellipse, onClickIncreaseSpeed, null );

var polygonButton = new HitArea( buttons.polygon, onClickDecreaseSpeed, null );

var roundedRectButton = new HitArea( buttons.roundedRectangle, onClickResetSpeed, null );

var bunnyButton = new HitArea(
    {
        type: 'Polygon',
        points: [
            668, 24,
            681, 24,
            682, 37,
            685, 37,
            685, 41,
            692, 41,
            692, 37,
            696, 37,
            695, 24,
            710, 24,
            710, 127,
            704, 127,
            701, 113,
            676, 114,
            673, 127,
            668, 127,
            668, 24
        ]
    },
    onClickMove,
    bunnyButtonSprite
);

// Set Up Bunny Sprite
var bunny = PIXI.Sprite.from( 'required/assets/basics/bunny.png' );
bunny.anchor.set( 0.5 );
bunny.x = app.screen.width / 2;
bunny.y = app.screen.height / 2;
bunny.scale.set( 2 );
app.stage.addChild( bunny );

// Listen for animate update
app.ticker.add( function ( delta ) {
    // If the red circle has been clicked, then either spin the bunny or not
    if ( spinBunny ) {
        bunny.rotation += spinSpeed * delta;
    }

    // If the bunny button has been clicked, then move the bunny across
    // the screen
    if ( moveBunny ) {
        bunny.x += ( moveSpeed * spinSpeed ) * delta;

        // Check that the bunny doesn't fly off screen by making it zip back
        // to the opposite side when it does
        if ( bunny.x < 0 ) {
            bunny.x = app.screen.width;
        }

        if ( bunny.x > app.screen.width ) {
            bunny.x = 0;
        }
    }
} );
