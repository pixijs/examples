var app = new PIXI.Application( 800, 600, { backgroundColor: 0x1099bb } );
document.body.appendChild( app.view );

console.log( '' );

//
// APPLICATION
// ===========================================================================
var COLLISION = {
    NONE: 0x4caf50,
    AABB: 0x2196F3,
    SHAPE: 0xf44336
};

var vw = app.screen.width;
var vh = app.screen.height;

var sprites = [];
var container = new PIXI.Container();

// for (var i = 0; i < 10; i++) {
//     sprites.push(createRandomPolygon());
// }

// Walls
sprites.push( createRect( 0, 0, 1800, 50 ) );
sprites.push( createRect( 0, 300, 1800, 50 ) );
sprites.push( createRect( 0, 50, 50, 1100 ) );
sprites.push( createRect( 300, 10, 50, 780 ) );

// Listen for animate update
var graphics = new PIXI.Graphics();
app.stage.addChild( container, graphics );
app.ticker.add( update );

//
// EDGE
// ===========================================================================
function Edge( p1, p2 ) {
    this.p1 = p1 || new PIXI.Point();
    this.p2 = p2 || new PIXI.Point();

    this.intersects = function ( edge, asSegment, point ) {
        var _asSegment = asSegment || true;
        var _point = point || new PIXI.Point();

        var a = this.p1;
        var b = this.p2;
        var e = edge.p1;
        var f = edge.p2;

        var a1 = b.y - a.y;
        var a2 = f.y - e.y;
        var b1 = a.x - b.x;
        var b2 = e.x - f.x;
        var c1 = ( b.x * a.y ) - ( a.x * b.y );
        var c2 = ( f.x * e.y ) - ( e.x * f.y );
        var denom = ( a1 * b2 ) - ( a2 * b1 );

        if ( denom === 0 ) {
            return null;
        }

        _point.x = ( ( b1 * c2 ) - ( b2 * c1 ) ) / denom;
        _point.y = ( ( a2 * c1 ) - ( a1 * c2 ) ) / denom;

        if ( _asSegment ) {
            var uc = ( ( f.y - e.y ) * ( b.x - a.x ) - ( f.x - e.x ) * ( b.y - a.y ) );
            var ua = ( ( ( f.x - e.x ) * ( a.y - e.y ) ) - ( f.y - e.y ) * ( a.x - e.x ) ) / uc;
            var ub = ( ( ( b.x - a.x ) * ( a.y - e.y ) ) - ( ( b.y - a.y ) * ( a.x - e.x ) ) ) / uc;

            if ( ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1 ) {
                return _point;
            } else {
                return null;
            }
        }

        return _point;
    };
}

//
// COLLISION SHAPE
// ===========================================================================
function CollisionShape( target, vertices ) {
    var _vertices = vertices || [];

    this.edges = [];
    this.points = [];
    this.AABB = new PIXI.Rectangle();
    this.bounds = new PIXI.Bounds();
    this.intersectionPoint = new PIXI.Point();

    for ( var i = 0; i < _vertices.length; i++ ) {
        var p1 = _vertices[i];
        var p2 = _vertices[i + 1] || _vertices[0];
        this.points.push( p1.clone() );
        this.edges.push( new Edge( p1, p2 ) );
    }

    this.update = function () {
        var transform = target.transform.worldTransform;

        this.bounds.clear();

        for ( var i = 0; i < this.points.length; i++ ) {

            var vertex = transform.apply( this.points[i], _vertices[i] );
            this.bounds.addPoint( vertex );
        }

        this.bounds.getRectangle( this.AABB );
    };

    this.intersectsAABB = function ( shape ) {
        var a = this.bounds;
        var b = shape.bounds;

        return !(
            a.maxX < b.minX ||
            a.maxY < b.minY ||
            a.minX > b.maxX ||
            a.minY > b.maxY
        );
    };

    this.intersectsShape = function ( shape ) {
        var edges1 = this.edges;
        var edges2 = shape.edges;

        for ( var i = 0; i < edges1.length; i++ ) {
            var edge1 = edges1[i];

            for ( var j = 0; j < edges2.length; j++ ) {
                var edge2 = edges2[j];

                if ( edge1.intersects( edge2, true, this.intersectionPoint ) ) {
                    return true;
                }
            }
        }

        return false;
    };

    this.update();
}

//
// CREATE SPRITE
// ===========================================================================
function createRect( x, y, width, height ) {
    var points = [
        new PIXI.Point( x, y ),
        new PIXI.Point( x + width, y ),
        new PIXI.Point( x + width, y + height ),
        new PIXI.Point( x, y + height ),
        new PIXI.Point( x, y )
    ];

    var graphics = new PIXI.Graphics()
        .beginFill( 0xffffff )
        .drawPolygon( points )
        .endFill();

    // var points = graphics.geometry.points.reduce( ( accumulator, point, index ) => {
    //     if ( index % 2 === 0 ) {
    //         return accumulator.concat( new PIXI.Point( point ) );
    //     } else {
    //         accumulator[accumulator - 1].y = point;
    //         return accumulator;
    //     }
    // }, [] );

    var shapeData = {
        x: x,
        y: y,
        width: width,
        height: height,
        rotation: 0
    };

    return generateSprite( shapeData, graphics, points );
}

function createRandomPolygon() {
    var sides = random( 4, 16 ) | 0;
    var step = Math.PI * 2 / sides;
    var points = [];

    var minX = Infinity;
    var minY = Infinity;

    for ( var i = 0; i < sides - 1; i++ ) {
        var theta = ( step * i ) + random( step );
        var radius = random( 100, 160 );

        var x = radius * Math.cos( theta );
        var y = radius * Math.sin( theta );

        minX = Math.min( minX, x );
        minY = Math.min( minY, y );

        points.push( new PIXI.Point( x, y ) );
    }

    points.forEach( function ( point ) {
        point.x = point.x - minX;
        point.y = point.y - minY;
    } );

    var graphics = new PIXI.Graphics()
        .beginFill( 0xffffff )
        .drawPolygon( points )
        .endFill();

    var shapeData = {
        x: random( 100, vw - 100 ),
        y: random( 100, vh - 100 ),
        scale: random( 0.4, 1 ),
        rotation: random( Math.PI * 2 )
    };

    return generateSprite( shapeData, graphics, points );
}

function generateSprite( shapeData, graphics, points ) {
    var texture = PIXI.RenderTexture.create( graphics.width, graphics.height );
    app.renderer.render( graphics, texture );

    var sprite = new PIXI.Sprite( texture );

    sprite.x = shapeData.x;
    sprite.y = shapeData.y;
    sprite.pivot.x = sprite.width * 0.5;
    sprite.pivot.y = sprite.height * 0.5;
    sprite.rotation = shapeData.rotation;
    if ( shapeData.scale ) {
        sprite.scale.set( shapeData.scale );
    } else {
        sprite.width = shapeData.width || 0;
        sprite.height = shapeData.height || 0;
    }

    sprite.hitArea = new PIXI.Polygon( points );
    sprite.shape = new CollisionShape( sprite, points );
    sprite.collisionID = 1;
    sprite.collision = COLLISION.NONE;
    sprite.tint = sprite.collision;

    // sprite.dragging = false;
    // sprite.newPosition = new PIXI.Point();
    // sprite.lastPosition = new PIXI.Point();

    // sprite.interactive = true;
    // sprite.buttonMode = true;
    // sprite
    //     .on("pointerdown", onDragStart)
    //     .on("pointerup", onDragEnd)
    //     .on("pointerupoutside", onDragEnd)
    //     .on("pointermove", onDragMove);

    graphics.destroy();
    container.addChild( sprite );

    return sprite;
}

//
// DETECT COLLISIONS
// ===========================================================================
function detectCollisions() {

    container.updateTransform();

    for ( var i = 0; i < sprites.length; i++ ) {

        var sprite = sprites[i];
        sprite.collision = COLLISION.NONE;

        if ( sprite.collisionID ) {
            sprite.shape.update();
            sprite.collisionID = 0;
        }
    }

    for ( var i = 0; i < sprites.length; i++ ) {

        var sprite1 = sprites[i];

        for ( var j = i + 1; j < sprites.length; j++ ) {

            var sprite2 = sprites[j];

            // Check for AABB intersections to determine what shapes might be overlapping
            if ( sprite1.shape.intersectsAABB( sprite2.shape ) ) {

                if ( sprite1.collision === COLLISION.NONE ) {
                    sprite1.collision = COLLISION.AABB;
                }

                if ( sprite2.collision === COLLISION.NONE ) {
                    sprite2.collision = COLLISION.AABB;
                }

                if ( sprite1.shape.intersectsShape( sprite2.shape ) ) {
                    sprite1.collision = COLLISION.SHAPE;
                    sprite2.collision = COLLISION.SHAPE;
                }
            }

            sprite2.tint = sprite2.collision;
        }

        sprite1.tint = sprite1.collision;
    }
}

//
// UPDATE
// ===========================================================================
function update() {
    detectCollisions();

    graphics
        .clear()
        .lineStyle( 1, 0xffffff, 0.8 );

    for ( var i = 0; i < sprites.length; i++ ) {
        var box = sprites[i].shape.AABB;
        graphics.drawRect( box.x, box.y, box.width, box.height );
    }
}

function random( min, max ) {
    if ( !max ) {
        max = min;
        min = 0;
    }
    if ( min > max ) {
        var tmp = min;
        min = max;
        max = tmp;
    }
    return min + ( max - min ) * Math.random();
}
