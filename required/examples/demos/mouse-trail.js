var app = new PIXI.Application(800, 600, {backgroundColor : 0x1099bb});
document.body.appendChild(app.view);

//Get the texture for rope.
var trailTexture = PIXI.Texture.fromImage('required/assets/trail.png')
var historyX = [];
var historyY = [];
//historySize determines how long the trail will be.
var historySize = 20;
//ropeSize determines how smooth the trail will be.
var ropeSize = 100;
var points = [];

//Create history array.
for( var i = 0; i < historySize; i++)
{
	historyX.push(0);
	historyY.push(0);
}
//Create rope points.
for(var i = 0; i < ropeSize; i++)
{
	points.push(new PIXI.Point(0,0));
}

//Create the rope
var rope = new PIXI.mesh.Rope(trailTexture, points);

//Set the blendmode
rope.blendmode = PIXI.BLEND_MODES.ADD;

app.stage.addChild(rope);

// Listen for animate update
app.ticker.add(function(delta) {
	//Read mouse points, this could be done also in mousemove/touchmove update. For simplicity it is done here for now.
	//When implemeting this properly, make sure to implement touchmove as interaction plugins mouse might not update on certain devices.
	var mouseposition = app.renderer.plugins.interaction.mouse.global;
	
	//Update the mouse values to history
	historyX.pop();
	historyX.unshift(mouseposition.x);
	historyY.pop();
	historyY.unshift(mouseposition.y);
	//Update the points to correspond with history.
	for( var i = 0; i < ropeSize; i++)
	{
		var p = points[i];
		
		//Smooth the curve with cubic interpolation to prevent sharp edges.
		var ix = cubicInterpolation( historyX, i / ropeSize * historySize);
		var iy = cubicInterpolation( historyY, i / ropeSize * historySize);
		
		p.x = ix;
		p.y = iy;
		
	}
});

/**
 * Cubic interpolation based on https://github.com/osuushi/Smooth.js
 * @param	k
 * @return
 */
function clipInput(k, arr)
{
	if (k < 0)
		k = 0;
	if (k > arr.length - 1)
		k = arr.length - 1;
	return arr[k];
}

function getTangent(k, factor, array)
{
	return factor * (clipInput(k + 1, array) - clipInput(k - 1,array)) / 2;
}

function cubicInterpolation(array, t, tangentFactor)
{
	if (tangentFactor == null) tangentFactor = 1;
	
	var k = Math.floor(t);
	var m = [getTangent(k, tangentFactor, array), getTangent(k + 1, tangentFactor, array)];
	var p = [clipInput(k,array), clipInput(k+1,array)];
	t -= k;
	var t2 = t * t;
	var t3 = t * t2;
	return (2 * t3 - 3 * t2 + 1) * p[0] + (t3 - 2 * t2 + t) * m[0] + ( -2 * t3 + 3 * t2) * p[1] + (t3 - t2) * m[1];
}