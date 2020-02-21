// Based somewhat on this article by Spicy Yoghurt
// URL for further reading: https://spicyyoghurt.com/tutorials/html5-javascript-game-development/collision-detection-physics
const app = new PIXI.Application(800, 600, { backgroundColor: 0x1099bb });
document.body.appendChild(app.view);

// Flag for colliding
let colliding = false;

// Options for how objects interact
// How fast the red square moves
const movementSpeed = 0.05;

// Mass of the squares
const greenSquareMass = 3;
const redSquareMass = 1;

// Strength of the impulse push between two objects
const impulsePower = 5;

// Test For Hit
// Lets us check whether the mouse pointer intersects with the hitarea
// Note: There are better ways of detecting a collision, such as AABB.
// This is a quick and dirty way of getting a similar result
function testForHit(object1, object2) {
    if (!object1 || !object1.hitArea || !object2 || !object2.vertexData) {
        return false;
    }
    // Convert vertex data into a list of PIXI.Points
    const objectVertexList = object2.vertexData.reduce(
        (accumulator, vertex, index) => {
            if (index % 2 === 0) {
                return accumulator.concat(new PIXI.Point(vertex));
            }
            accumulator[accumulator.length - 1].y = vertex;
            return accumulator;
        },
        [],
    );

    return objectVertexList.some((vertex) => object1.hitArea.contains(vertex.x, vertex.y));
}

// Calculates the results of a collision, allowing us to give an impulse that
// shoves objects apart
function collisionResponse(object1Data, object2Data) {
    const { object1, object1Acceleration, object1Mass } = object1Data;
    const { object2, object2Acceleration, object2Mass } = object2Data;

    if (!object1 || !object2) {
        return new PIXI.Point(0);
    }

    const vCollision = new PIXI.Point(
        object2.x - object1.x,
        object2.y - object1.y,
    );
    const distance = Math.sqrt(
        (object2.x - object1.x) * (object2.x - object1.x)
        + (object2.y - object1.y) * (object2.y - object1.y),
    );
    const vCollisionNorm = new PIXI.Point(
        vCollision.x / distance,
        vCollision.y / distance,
    );
    const vRelativeVelocity = new PIXI.Point(
        object1Acceleration.x - object2Acceleration.x,
        object1Acceleration.y - object2Acceleration.y,
    );
    const speed = vRelativeVelocity.x * vCollisionNorm.x
        + vRelativeVelocity.y * vCollisionNorm.y;
    const impulse = impulsePower * speed / (object1Mass + object2Mass);

    return new PIXI.Point(
        impulse * vCollisionNorm.x,
        impulse * vCollisionNorm.y,
    );
}

// Calculate the distance between two given points
function distanceBetweenTwoPoints(p1, p2) {
    const a = p1.x - p2.x;
    const b = p1.y - p2.y;

    return Math.hypot(a, b);
}

// The green square we will knock about
const greenSquare = new PIXI.Graphics()
    .beginFill(0x33FF33)
    .drawRect(
        (app.screen.width - 100) / 2,
        (app.screen.height - 100) / 2,
        100,
        100,
    )
    .endFill();

// Create a hitarea that matches the shape, which will be used for point
// intersection
greenSquare.hitArea = new PIXI.Rectangle(
    (app.screen.width - 100) / 2,
    (app.screen.height - 100) / 2,
    100,
    100,
);

// Add to stage
app.stage.addChild(greenSquare);

// The square you move around
const redSquare = new PIXI.Graphics()
    .beginFill(0xFF3333)
    .drawRect(
        100,
        100,
        100,
        100,
    )
    .endFill();

// Add to stage
app.stage.addChild(redSquare);

// The green squares acceleration value
const greenAcceleration = new PIXI.Point(0);
const redAcceleration = new PIXI.Point(0);

// Listen for animate update
app.ticker.add((delta) => {
    // Applied deacceleration for both squares, done by reducing the
    // acceleration by 0.01% of the acceleration every loop
    redAcceleration.set(redAcceleration.x * 0.99, redAcceleration.y * 0.99);
    greenAcceleration.set(greenAcceleration.x * 0.99, greenAcceleration.y * 0.99);

    const mouseCoords = app.renderer.plugins.interaction.mouse.global;

    // Check halves of the screen
    const halfWidth = app.screen.width / 2;
    const halfHeight = app.screen.height / 2;

    // Check whether the green square ever moves off the screen
    // If so, reverse acceleration in that direction
    if (greenSquare.x < -halfWidth || greenSquare.x > halfWidth) {
        greenAcceleration.x = -greenAcceleration.x;
    }

    if (greenSquare.y < -halfHeight || greenSquare.y > halfHeight) {
        greenAcceleration.y = -greenAcceleration.y;
    }

    // Check if the two squares are colliding
    colliding = testForHit(greenSquare, redSquare);

    // If the mouse is off screen, then don't update any further
    if (app.screen.width > mouseCoords.x || mouseCoords.x > 0
        || app.screen.height > mouseCoords.y || mouseCoords.y > 0) {
        // Get the red square's center point
        const redSquareCenterPosition = new PIXI.Point(
            redSquare.x + (redSquare.width * 1.5),
            redSquare.y + (redSquare.height * 1.5),
        );

        // Calculate the direction vector between the mouse pointer and
        // the red square
        const toMouseDirection = new PIXI.Point(
            mouseCoords.x - redSquareCenterPosition.x,
            mouseCoords.y - redSquareCenterPosition.y,
        );

        // Use the above to figure out the angle that direction has
        const angleToMouse = Math.atan2(
            toMouseDirection.y,
            toMouseDirection.x,
        );

        // Figure out the speed the square should be travelling by, as a
        // function of how far away from the mouse pointer the red square is
        const distMouseRedSquare = distanceBetweenTwoPoints(
            mouseCoords,
            redSquareCenterPosition,
        );
        const redSpeed = distMouseRedSquare * movementSpeed;

        // Calculate the acceleration of the red square
        redAcceleration.set(
            Math.cos(angleToMouse) * redSpeed,
            Math.sin(angleToMouse) * redSpeed,
        );
    }

    // If the two squares are colliding
    if (colliding) {
        // Calculate the changes in acceleration that should be made between
        // each square as a result of the collision
        const collisionPush = collisionResponse(
            {
                object1: greenSquare,
                object1Acceleration: greenAcceleration,
                object1Mass: greenSquareMass,
            },
            {
                object2: redSquare,
                object2Acceleration: redAcceleration,
                object2Mass: redSquareMass,
            },
        );
        // Set the changes in acceleration for both squares
        redAcceleration.set(
            (collisionPush.x * greenSquareMass),
            (collisionPush.y * greenSquareMass),
        );
        greenAcceleration.set(
            -(collisionPush.x * redSquareMass),
            -(collisionPush.y * redSquareMass),
        );
    }

    greenSquare.x += greenAcceleration.x * delta;
    greenSquare.y += greenAcceleration.y * delta;
    greenSquare.hitArea.x += greenAcceleration.x * delta;
    greenSquare.hitArea.y += greenAcceleration.y * delta;

    // Apply the acceleration to the XY coords of the squares to update their
    // positions
    redSquare.x += redAcceleration.x * delta;
    redSquare.y += redAcceleration.y * delta;
});
