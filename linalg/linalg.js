'use strict';

// global contants
const STROKE_DEFAULT = 'rgb(  0,  0,  0)';
const STROKE_VECTOR  = 'rgb(255,  0,  0)';
const FONT_DEFAULT = '20px sans';


// *** Rendring ***
function render(state) {
    clear_canvas(state);
    draw_axis(state);
    render_objects(state);
}

function clear_canvas(state) {
    let context = state.context;
    console.log("clear canvas!", state.size.width, state.size.height);
    context.clearRect(0,0, state.size.width, state.size.height);
}

function render_objects(state) {
    let numObjects = state.objects.length
    let objects = state.objects;
    console.log("about to render these objects", objects);
    for(let i = 0; i < numObjects; i++) {
	let currentObject = objects[i]
	let currentType = currentObject.type
	
	if(stringKeysMatch(currentType, "vector")) {
	    render_vector(
		state,
		currentObject.x,
		currentObject.y,
		currentObject.translation
	    );
	}
	else if(stringKeysMatch(currentType, "label")) {
	    renderLabel(
		state,
		currentObject.x,
		currentObject.y,
		currentObject.content
	    )
	}
	else {
	    throw 'Unrecognised object "' + currenType + '" at index ' + i;
	}
    }
}

function renderLabel(state, x, y, content) {
    console.log(state);
    let context = state.context;
    let renderx = state.origin.x + x;
    let rendery = state.origin.y - y;

    console.log("rendering", content, " at ", renderx, rendery);
    context.font = FONT_DEFAULT;
    context.fillText(content, renderx, rendery);
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
    let baseAngle = findVectorAngle(x, y);

    console.log(baseAngle);
    
    let upperAngle = baseAngle + 180 - 45;
    let lowerAngle = baseAngle + 180 + 45;
    let baseLength = 10;

    let baseVector = {x: baseLength, y:0};
    let upperVector = rotateVector(baseVector.x, baseVector.y, upperAngle);
    let lowerVector = rotateVector(baseVector.x, baseVector.y, lowerAngle);

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
function stringKeysMatch(s1, s2) {
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

// *** Geometry and linear algebra ***
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

// Outputs in degrees
function findVectorAngle(x, y) {
    // first compute the angle as if the vector was in the first quadrant
    let angle = Math.abs(Math.asin(y / Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2))));
    console.log("The raw angle", angle);
    
    // Then we check the quadrant
    if(x < 0 && y > 0) { // Second, angle flipped about the y-axis
	console.log("second quadrant")
	angle += (Math.PI - 2 * angle);
    }
    else if(x < 0 && y < 0) { // Third, flipped about y = -x
	console.log("third quadrant")
	angle += Math.PI;
    }
    else if(x > 0 && y < 0) { // Fourth, angle flipped about the x-axis
	console.log("fourth quadrant")
	angle = -angle;
    }
    
    // Convert to degrees and return
    angle = 360 * (angle/(2*Math.PI));
    console.log("the angle was found to be", angle);
    return angle
}

// *** Setup ***
const init = () => {
    let canvasHandle = document.querySelector("#main_canvas");
    let context = canvasHandle.getContext('2d');
    let state = initiateState(context);
    
    let matrixHandles = [
	[document.querySelector("#matrix11"), document.querySelector("#matrix12")],
	[document.querySelector("#matrix21"), document.querySelector("#matrix22")]
    ];
    console.log(matrixHandles);
    let matrixValues = [[ 40, 20],
			[-20 ,10]];

    let bValues = [100,
		   100];
    
    let bHandles = [
	document.querySelector("#b11"), document.querySelector("#b21")
    ];

    state.matrixHandles = matrixHandles;
    state.matrixValues = matrixValues;

    state.bHandles = bHandles;
    state.bValues = bValues;
    
    setupMatrixListeners(state);
    setupBListeners(state);
    
    setUIFromState(state);
    update(state);
}

function setupMatrixListeners(state) {

    const {matrixHandles} = state;
    
    matrixHandles[0][0].addEventListener('input',
					 (e) => {
					     let newVal = parseInt(e.target.value);
					     state.matrixValues[0][0] = newVal;
					     update(state);
					 });
    matrixHandles[0][1].addEventListener('input',
					 (e) => {
					     let newVal = parseInt(e.target.value);
					     state.matrixValues[0][1] = newVal;
					     update(state);
					 });    
    matrixHandles[1][0].addEventListener('input',
					 (e) => {
					     let newVal = parseInt(e.target.value);
					     state.matrixValues[1][0] = newVal;
					     update(state);
					 });
    matrixHandles[1][1].addEventListener('input',
					 (e) => {
					     let newVal = parseInt(e.target.value);
					     state.matrixValues[1][1] = newVal;
					     update(state);
					 });    
}

function setupBListeners(state) {
    const {bHandles} = state;
    bHandles[0].addEventListener('input',
				 (e) => {
				     let newVal = parseInt(e.target.value);
				     state.bValues[0] = newVal;
				     update(state);
				 });
    bHandles[1].addEventListener('input',
				 (e) => {
				     let newVal = parseInt(e.target.value);
				     state.bValues[1] = newVal;
				     update(state);
				 });
}

function setUIFromState(state) {
    // The matrix A
    state.matrixHandles[0][0].value = state.matrixValues[0][0];
    state.matrixHandles[0][1].value = state.matrixValues[0][1];
    state.matrixHandles[1][0].value = state.matrixValues[1][0];
    state.matrixHandles[1][1].value = state.matrixValues[1][1];

    // The vector b
    state.bHandles[0].value = state.bValues[0];
    state.bHandles[1].value = state.bValues[1];
    
}

function update(state) {
    updateRenderObjects(state);
    render(state);
}

function updateRenderObjects(state) {
    console.log("Update!")
    console.log("The current matrix values", state.matrixValues);
    let col1 = {
	type: 'vector',
	x: state.matrixValues[0][0],
	y: state.matrixValues[1][0],
	translation: {x: 0, y: 0}
    };
    let col1l = {
	type: 'label',
	content: 'col 1',
 	x: state.matrixValues[0][0],
	y: state.matrixValues[1][0] + 10,
    };
    let col2 = {
	type: 'vector',
	x: state.matrixValues[0][1],
	y: state.matrixValues[1][1],
	translation: {x: 0, y: 0}
    };
    let col2l = {
	type: 'label',
	content: 'col 2',
 	x: state.matrixValues[0][1],
	y: state.matrixValues[1][1] + 10,
    };

    let bVec = {
	type: 'vector',
	x: state.bValues[0],
	y: state.bValues[1],
	translation: {x: 0, y: 0}
    }
    let bLabel =  {
	type: 'label',
	content: 'b',
	x: state.bValues[0],
	y: state.bValues[1] + 10,
    }
    
    state.objects = [col1, col2, bVec, bLabel, col1l, col2l];
}

function initiateState(context) {
    return {
	origin: {x: 250, y: 250},
	size: {
	    width:  pxstringToInt(context.canvas.attributes.width.value),
	    height: pxstringToInt(context.canvas.attributes.height.value)
	},
	context: context,
	objects:[]
    }
}

function populateTestState(context) {
    return {
	origin: {x: 250, y: 250},
	size: {
	    width:  pxstringToInt(context.canvas.attributes.width.value),
	    height: pxstringToInt(context.canvas.attributes.height.value)
	},
	context: context,
	objects: [
	    {
		type: 'vector',
		x: 200,
		y: 20,
		translation: {
		    x: 0,
		    y: 0
		}
	    },
	    {
		type: 'label',
		content: 'v1',
		x: 200,
		y: 30
	    },
	    {
		type: 'vector',
		x: -100,
		y: 50,
		translation: {
		    x: 0,
		    y: 0
		}
	    },
	    {
		type: 'label',
		content: 'v2',
		x: -100,
		y: 60
	    },
	    {
		type: 'vector',
		x: -50,
		y: -50,
		translation: {
		    x: 0,
		    y: 0
		}
	    },
	    {
		type: 'label',
		content: 'v3',
		x: -70,
		y: -40
	    },
	    {
		type: 'vector',
		x: 150,
		y: -230,
		translation: {
		    x: 0,
		    y: 0
		}
	    },
	    {
		type: 'label',
		content: 'v4',
		x: 150,
		y: -200
	    },
	]
    };
}

window.onload = init;
