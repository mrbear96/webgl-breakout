
/** GLOBALS **/
var gl; // Application WebGL instance
var program; // Shader program (should contain vertex & fragment shaders)

var transY1; // Variable containing vertical translation for paddle
var transXBall; // Variable containing horizontal translation for ball
var transYBall; // Variable containing vertical translation for ball
var transX1;

var yDir; // The direction of the ball in the y-axis
var xDir; // The direction of the ball in the x-axis

var theta; // The angle used for ricocheting the ball

var transLoc; // trans Uniform location from shader
var fragColorLoc; // frag_color Uniform location from shader

var paddle, ball, field; // Game objectss
var viewportRatio; //  Variable used to correct how objects appear on the viewport

var trailLen = 30; // Circular buffer length for trail
var trailIdx = 0; // It's index
var sparksCnt = 10;
var ballSpeedGain = 0.5;

var canvas;

 /* ----=================---------------==================--------------------========================================== */

function initObjects() {

    paddle = {
		x: 0,
		y: -0.925,
		width: 0.34,
		halfwidth: 0.17,
		height: 0.05,
		halfheight: 0.025,
		speed: 0,
		vertices: [
			vec2(0.17, -0.95),
			vec2(0.17, -0.9),
			vec2(-0.17, -0.9),
			vec2(-0.17, -0.95)
		]
	};

	ball = {
		x: 0,
		y: 0,
		radius: 0.03,
		speed: 2,
		color: vec4(1.0,1.0,1.0,1.0),
		vertices: []
	};

	trail = {
		coords: [],
		vertices: []
	}

	bricks = {
		height: 0.10,
		width: 0.10,
		coords: [],
		vertices: [],
		colors: []
	}

	sparks = {
		height: 0.03,
		width: viewportRatio*0.03,
		lcoords:[],
		coords: [],
		vertices: [],
		m_directions:[],
		alive: [],
		colors: [1.0,1.0,0.4,1.0]
	}
		
	field = {
		score1: 0,
		score2: 0,
		playing: false
	};


	transY1 = 0.0; 
	transXBall = 0.0; 
	transYBall = 0.01;
	transX1 = 0.0;

	yDir = -1; 
	xDir = -1; 
	
	theta = 0;

	initBall();
	initTrail();
	initBricks();
	initSparks();

	document.getElementById("score1").innerHTML = 0;
	document.getElementById('ball-speed').innerHTML = 2;
}

function initBall(){
	for (var i=0; i<360; i++){
		ball.vertices.push(vec2(ball.radius*viewportRatio*( Math.sin(i*3.141592/180) - Math.cos(i*3.141592/180) ), 
								ball.radius*( Math.sin(i*3.141592/180) + Math.cos(i*3.141592/180))) );
	}
}

function initTrail(){
	//initially no trail
	for (var i=0; i<100; i++){
		trail.coords.push(vec2(0,0));
	}
	//push vertices(which are used to form a circle)
	for (var i=0; i<360; i++){
		trail.vertices.push(vec2(ball.radius/4*viewportRatio*( Math.sin(i*3.141592/180) - Math.cos(i*3.141592/180) ), 
								ball.radius/4*( Math.sin(i*3.141592/180) + Math.cos(i*3.141592/180))) );
	}
}

function initBricks(){
	var x = -1;
	var y = 0.8;

	// setup coords for bricks, random row offset with 0.04 space between columns and 0.03 space between rows
	for (var y = 0.8; y >= 0.0; y-= 0.03 + bricks.height){
		for (var x = -1 + Math.random()%bricks.width; x<1 - bricks.width ; x+= 0.04 + bricks.width){
			bricks.coords.push(vec2(x,y));
		}
	}

	// random color for each brick
	for (var i=0; i<bricks.coords.length; i++){
		bricks.colors.push(vec4(Math.random().toFixed(2),Math.random().toFixed(2),Math.random().toFixed(2),1.0));
	}

	bricks.vertices.push(vec2(0, 0));
	bricks.vertices.push(vec2(0,  bricks.height));
	bricks.vertices.push(vec2(bricks.width, bricks.height));	
	bricks.vertices.push(vec2(bricks.width, 0.0));
}

//sparks are made from 3 triangles to form a star with 6 corners
function initSparks()
{
	//first triangle
	sparks.vertices.push(vec2(sparks.width/2, 0));
	sparks.vertices.push(vec2(0.20*sparks.width, -sparks.height));
	sparks.vertices.push(vec2(0.70*sparks.width, -sparks.height*0.60));
	//second triangle
	sparks.vertices.push(vec2(0, -sparks.height*0.40));
	sparks.vertices.push(vec2(0.80*sparks.width,  -sparks.height));
	sparks.vertices.push(vec2(0.60*sparks.width, -sparks.height*0.40));
	//third triangle
	sparks.vertices.push(vec2(0.20*sparks.width, -sparks.height));
	sparks.vertices.push(vec2(sparks.width,  -sparks.height*0.40));
	sparks.vertices.push(vec2(0.40*sparks.width, -0.40*sparks.height));
}

/* initGL(): Spin up initial WebGL program state */
function initGL()
{
	canvas = document.getElementById( "canvas" ); // Grab canvas from HTML

	gl = WebGLUtils.setupWebGL( canvas );
	if ( !gl ) { alert( "WebGL isn't available" ); }

	gl.viewport( 0, 0, canvas.width, canvas.height); // Viewport size 1024x768
	gl.clearColor( 0.0, 0.0, 0.0, 0.0 ); // Background color is utterly transparent

	viewportRatio = canvas.height / canvas.width;
	initObjects(); // Spin up game state

	program = initShaders( gl, "vertex-shader", "fragment-shader" ); // Spin up our shader programs
	gl.useProgram( program ); // Bind shader program 'program' to currently used set of shaders

	var vertexBuffer = gl.createBuffer(); // Initialize buffer
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer); // Bind vertexBuffer to currently used buffer

	var vertexPositionLoc = gl.getAttribLocation(program, "vertexPosition"); // Get 'vertexPosition' uniform location from shader program

	gl.vertexAttribPointer(vertexPositionLoc, 2, gl.FLOAT, false, 0, 0); // Initialize it as an Attrib Array
	gl.enableVertexAttribArray(vertexPositionLoc); // Bind it as currently used attrib array

	transLoc = gl.getUniformLocation(program, "trans"); // Populate global variable w/ trans location
	fragColorLoc = gl.getUniformLocation(program, "fragColor"); // Populate global variable w/ frag_color location

	document.addEventListener( 'mousemove', onDocumentMouseMove, false );

	render();
}
