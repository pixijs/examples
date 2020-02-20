var app = new PIXI.Application( 800, 600, { backgroundColor: 0x1099bb } );
document.body.appendChild( app.view );

var colliding = false;

var movementSpeed = 0.1;
var greenSquareMass = 3;
var redSquareMass = 1;

var impulsePower = 5;

// Test For Hit
// Lets us check whether the mouse pointer intersects with the hitarea
function testForHit( object1, object2 ) {
    if ( !object1 || !object1.hitArea || !object2 || !object2.vertexData ) {
        return;
    }
    var objectVertexList = object2.vertexData.reduce( function ( accumulator, vertex, index ) {
        if ( index % 2 === 0 ) {
            return accumulator.concat( new PIXI.Point( vertex ) );
        } else {
            accumulator[accumulator.length - 1].y = vertex;
            return accumulator;
        }
    }, [] );

    return objectVertexList.some( function ( vertex ) {
        return object1.hitArea.contains( vertex.x, vertex.y );
    } );
}

function collisionResponse( object1, object2, object1Acceleration, object2Acceleration, object1Mass, object2Mass ) {
    if ( !object1 || !object2 ) {
        return;
    }

    var vCollision = new PIXI.Point( object2.x - object1.x, object2.y - object1.y );
    var distance = Math.sqrt(
        ( object2.x - object1.x ) * ( object2.x - object1.x ) +
        ( object2.y - object1.y ) * ( object2.y - object1.y )
    );
    var vCollisionNorm = new PIXI.Point( vCollision.x / distance, vCollision.y / distance );
    var vRelativeVelocity = new PIXI.Point( object1Acceleration.x - object2Acceleration.x, object1Acceleration.y - object2Acceleration.y );
    var speed = vRelativeVelocity.x * vCollisionNorm.x + vRelativeVelocity.y * vCollisionNorm.y;
    var impulse = impulsePower * speed / ( object1Mass + object2Mass );

    return new PIXI.Point( impulse * vCollisionNorm.x, impulse * vCollisionNorm.y );
}

function distanceBetweenTwoPoints( p1, p2 ) {
    var a = p1.x - p2.x;
    var b = p1.y - p2.y;

    return Math.hypot( a, b );
}

// For the first example, we'll make our button. You can use any shape instead of a
// polygon
var greenSquare = new PIXI.Graphics()
    .beginFill( 0x33FF33 )
    .drawRect(
        ( app.screen.width - 100 ) / 2,
        ( app.screen.height - 100 ) / 2,
        100,
        100
    )
    .endFill();

// Turns on interactive elements to show that these are buttons
// to be clicked
greenSquare.interactive = true;
greenSquare.buttonMode = true;

// Add to stage
app.stage.addChild( greenSquare );

// Create a hitarea that matches, which will be used for point intersection
greenSquare.hitArea = new PIXI.Rectangle(
    ( app.screen.width - 100 ) / 2,
    ( app.screen.height - 100 ) / 2,
    100,
    100
);

var redSquare = new PIXI.Graphics()
    .beginFill( 0xFF3333 )
    .drawRect(
        100,
        100,
        100,
        100
    )
    .endFill();

// Turns on interactive elements to show that these are buttons
// to be clicked
redSquare.interactive = true;
redSquare.buttonMode = true;

// Add to stage
app.stage.addChild( redSquare );

var greenAcceleration = new PIXI.Point( 0 );

// Listen for animate update
app.ticker.add( function ( delta ) {
    var mouseCoords = app.renderer.plugins.interaction.mouse.global;

    var halfWidth = app.screen.width / 2;
    var halfHeight = app.screen.height / 2;

    if ( greenSquare.x < -halfWidth || greenSquare.x > halfWidth ) {
        greenAcceleration.x = -greenAcceleration.x;
    }

    if ( greenSquare.y < -halfHeight || greenSquare.y > halfHeight ) {
        greenAcceleration.y = -greenAcceleration.y;
    }

    if ( app.screen.width < mouseCoords.x || mouseCoords.x < 0 || app.screen.height < mouseCoords.y || mouseCoords.y < 0 ) {
        return;
    }

    colliding = testForHit( greenSquare, redSquare );

    var redSquareAdjustedPosition = new PIXI.Point( redSquare.x + ( redSquare.width * 1.5 ), redSquare.y + ( redSquare.height * 1.5 ) );

    var toMouseDirection = new PIXI.Point( mouseCoords.x - redSquareAdjustedPosition.x, mouseCoords.y - redSquareAdjustedPosition.y );
    var angleToMouse = Math.atan2( toMouseDirection.y, toMouseDirection.x );
    var redSpeed = distanceBetweenTwoPoints( mouseCoords, redSquareAdjustedPosition ) * movementSpeed;
    var redAcceleration = new PIXI.Point( Math.cos( angleToMouse ) * redSpeed, Math.sin( angleToMouse ) * redSpeed );

    if ( colliding ) {
        var collisionPush = collisionResponse(
            greenSquare, redSquare,
            greenAcceleration, redAcceleration,
            greenSquareMass, redSquareMass
        );
        redAcceleration.set( ( collisionPush.x * greenSquareMass ), ( collisionPush.y * greenSquareMass ) );
        greenAcceleration.set( -( collisionPush.x * redSquareMass ), -( collisionPush.y * redSquareMass ) );
    }

    redSquare.x += redAcceleration.x * delta;
    redSquare.y += redAcceleration.y * delta;

    greenSquare.x += greenAcceleration.x * delta;
    greenSquare.y += greenAcceleration.y * delta;
    greenSquare.hitArea.x += greenAcceleration.x * delta;
    greenSquare.hitArea.y += greenAcceleration.y * delta;

} );
