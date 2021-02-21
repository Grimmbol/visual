
// State contains a list of objects to render
function render(state, context) {
    draw_axis(context);
    
    x1 = 0; y1 = 0; x2 = 3; y2 = 4; 
    render_vector(x1, y1, x2, y2, context);
}

function draw_axis(context) {
    context.strokeStyle = 'rgb(0,0,0)';
    
    console.log(context)
    
    context.beginPath();
    context.moveTo(250,   0);
    context.lineTo(250, 500);
    context.moveTo(0  , 250);
    context.lineTo(500, 250);
    context.closePath();
    context.stroke();
}

// 2D
function render_vector(x1, y1, x2, y2, context) {
    
}

const init = () => {
    console.log("hello world!");
    handle = document.querySelector("#main_canvas");
    context = handle.getContext('2d')
    state = [];
    render(state, context);
}

window.onload = init;
