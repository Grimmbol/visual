'use strict';

// global contants
const STROKE_DEFAULT = 'rgb(  0,  0,  0)';
const STROKE_VECTOR  = 'rgb(255,  0,  0)';


// *** Rendring ***
function render(state) {
    draw_axis(state);
    render_objects(state);
}

function render_objects(state) {
    let num_objects = state.objects.length
    let objects = state.objects;
    for(let i = 0; i < num_objects; i++) {
	let current_object = objects[i]
	let current_type = current_object.type
	
	if(string_keys_match(current_type, "vector")) {
	    render_vector(
		state,
		current_object.x,
		current_object.y,
		current_object.start
	    );
	}
	else {
	    throw 'Unrecognised object "' + current_type + '" at index ' + i;
	}
    }
}

function draw_axis(state) {
    let context = state.context;
    
    context.strokeStyle = STROKE_DEFAULT;
    let originx = state.origin.x;
    let originy = state.origin.y;
    let width   = state.size.width;
    let height  = state.size.height;
    
    context.beginPath();
    context.moveTo(originx, 0);
    context.lineTo(originx, height);
    context.moveTo(0, originy);
    context.lineTo(width, originy);
    context.closePath();
    context.stroke();
}

function render_vector(state, x, y, start) {

    // The base line
    renderLine(state, STROKE_VECTOR, x, y, start);
    
    // The arrowhead. This should be a right angle, with the line at 45 degrees
    let baseAngle = 0
    baseAngle = Math.asin (
	y / Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2))
    )

    console.log('baseAngle in rads:', baseAngle);
    baseAngle = (baseAngle/(2*Math.PI)) * 360;
    
    console.log('baseAngle:', baseAngle);

    let upperAngle = baseAngle + 180 - 45;
    let lowerAngle = baseAngle + 180 + 45;
    let baseLength = 10;

    console.log(upperAngle, lowerAngle);
    
    let baseVector = {x: baseLength, y:0};
    let upperVector = rotateVector(baseVector.x, baseVector.y, upperAngle);
    let lowerVector = rotateVector(baseVector.x, baseVector.y, lowerAngle);

    console.log(baseVector, upperVector, lowerVector);

    let tipx = start.x + x;
    let tipy = start.y + y;
    
    renderLine(state, STROKE_VECTOR, upperVector.x, upperVector.y, {x: tipx, y: tipy});
    renderLine(state, STROKE_VECTOR, lowerVector.x, lowerVector.y, {x: tipx, y: tipy});
}

function renderLine(state, stroke, x, y, start) {
    let context = state.context;
    let offsetx = state.origin.x;
    let offsety = state.origin.y;

    context.strokeStyle = stroke;
    
    // The line
    context.beginPath();
    context.moveTo(start.x+offsetx, -(start.y)+offsety);
    context.lineTo(start.x+offsetx + x, -(start.y)+offsety - y);

    context.closePath();
    context.stroke();
    context.strokeStyle = STROKE_DEFAULT;
}

// *** helpers and generators ***
function string_keys_match(s1, s2) {
    if (s1.localeCompare(s2) == 0) {
	return true;
    }
    else {
	return false
    }
}

function pxstringToInt(input) {
    let trimmedString = input.substring(0, input.length - 2);
    return parseInt(trimmedString);
}

// In degrees
function rotateVector(x, y, angle) {
    let cycles = (angle%360) / 360;
    let angle_rad = 2*Math.PI*cycles;
    
    let rotation_matrix =
	[Math.cos(angle_rad), -Math.sin(angle_rad),
	 Math.sin(angle_rad), Math.cos(angle_rad)];

    let result = {x: (rotation_matrix[0] * x + rotation_matrix[1] * y),
		  y: (rotation_matrix[2] * x + rotation_matrix[3] * y)};

    return result;
}

const init = () => {
    let handle = document.querySelector("#main_canvas");
    let context = handle.getContext('2d');
    let state = {
	origin: {x: 250, y: 250},
	size: {
	    width:  pxstringToInt(context.canvas.attributes.width.value),
	    height: pxstringToInt(context.canvas.attributes.height.value)
	},
	context: context,
	objects: [
	    {
		type: 'vector',
		x: 150,
		y: 100,
		start: {
		    x: 0,
		    y: 0
		}
	    }
	]
    };

    render(state);
}

window.onload = init;
