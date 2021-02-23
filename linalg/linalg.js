'use strict';

// global contants
const STROKE_DEFAULT = 'rgb(  0,  0,  0)';
const STROKE_VECTOR  = 'rgb(255,  0,  0)';


// *** Rendring ***
function render(state) {
    draw_axis(state);
    render_objects(state)
}

function render_objects(state) {
    let num_objects = state.objects.length
    let objects = state.objects;
    for(let i = 0; i < num_objects; i++) {
	let current_object = objects[i]
	let current_type = current_object.type
	
	if(string_keys_match(current_type, "vector")) {
	    console.log("render a vector")
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

    console.log(originx, originy, width, height);
    
    console.log(context)
    
    context.beginPath();
    context.moveTo(originx, 0);
    context.lineTo(originx, height);
    context.moveTo(0, originy);
    context.lineTo(width, originy);
    context.closePath();
    context.stroke();
}

function render_vector(state, x, y, start) {
    let context = state.context;
    let offsetx = state.origin.x;
    let offsety = state.origin.y;

    context.strokeStyle = STROKE_VECTOR;
    context.beginPath();

    // The line
    context.moveTo(start.x+offsetx, start.y+offsety);
    context.lineTo(start.x+offsetx + x, start.y+offsety - y);

    // The arrowhead. This should be a right angle, with the line at 45 degrees
    
    
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


const init = () => {
    console.log("Initialising canvas!");
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
		x: 100,
		y: 150,
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
