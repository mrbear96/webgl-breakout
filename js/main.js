
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
		colors: [1.0,1.0,0.0,1.0]
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
}

function initBall(){
	for (var i=0; i<360; i++){
		ball.vertices.push(vec2(ball.radius*viewportRatio*( Math.sin(i*3.141592/180) - Math.cos(i*3.141592/180) ), 
								ball.radius*( Math.sin(i*3.141592/180) + Math.cos(i*3.141592/180))) );
	}
}

function initTrail(){
	//initially no trail
	for (var i=0; i<trailLen; i++){
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
		//bricks.colors.push(vec4("0.6","0.63","0.7", "1.0"));
	}

	bricks.vertices.push(vec2(0, 0));
	bricks.vertices.push(vec2(0,  bricks.height));
	bricks.vertices.push(vec2(bricks.width, bricks.height));	
	bricks.vertices.push(vec2(bricks.width, 0.0));
}

//sparks are made from 3 triangles to form a star with 6 corners
function initSparks(){
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

function generateSparks( num ){
	for (var i=0; i<num; i++){
		sparks.lcoords.push(vec2(ball.x,ball.y));
		sparks.coords.push(vec2(ball.x,ball.y));
		sparks.m_directions.push(vec2(randomIntFromInterval(-0.005,0.005), randomIntFromInterval(-0.005,0.005)));
		sparks.alive.push(10);
	}
}

/* initGL(): Spin up initial WebGL program state */
function initGL(){
	canvas = document.getElementById( "canvas" ); // Grab canvas from HTML

	gl = WebGLUtils.setupWebGL( canvas );
	if ( !gl ) { alert( "WebGL isn't available" ); }

	gl.viewport( 0, 0, canvas.width, canvas.height); // Viewport size 1024x768
	gl.clearColor( 0.0, 0.0, 0.0, 0.0 ); // Background color is utterly transparent

	viewportRatio = canvas.height / canvas.width;
	initObjects(); // Spin up game state

	// Set up score in webpage
	document.getElementById('score1').innerHTML = field.score1;
	//document.getElementById('score2').innerHTML = field.score2;

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
	canvas.addEventListener ('click', onDocumentMouseClick, true);

	render();
}

 /* ----=================---------------==================--------------------==========================================

// ************* RENDER FUNCTIONS *****************

/* render(): Main event loop, controls vertex/fragment rendering and fires
	collision detection/score update functions when necessary. */
function render() {
	gl.clear(gl.COLOR_BUFFER_BIT); // Clear the buffer

	if (field.playing){ // If game is ongoing...
		
		renderTrail();
		renderBall();
		renderPaddle();
		renderBricks();
		renderSparks();
		ballCollisionUpdate(); // Check ball collision
	}

	requestAnimFrame(render); // Inform the browser we're ready to render another frame
	
}

function renderSparks(){

	gl.uniform4f(fragColorLoc, sparks.colors[0], sparks.colors[1], sparks.colors[2], 1.0);

	for (var num=0; num < sparks.lcoords.length; num++){
		sparks.alive[num] -= 1;
		if(sparks.alive[num] < 0) {
			sparks.lcoords.splice(num,1);
			sparks.coords.splice(num,1);
			sparks.alive.splice(num,1);
			sparks.m_directions.splice(num,1);
			continue;
		}

		gl.bufferData(gl.ARRAY_BUFFER, flatten(sparks.vertices), gl.STATIC_DRAW);
		for (var i=0; i < sparks.coords.length; i++){
			sparks.coords[i][0] += sparks.m_directions[i][0]/4;
			sparks.coords[i][1] += sparks.m_directions[i][1]/4;
			//console.log(sparks.coords[i][0] + "  " + sparks.coords[i][1]);
			
			gl.uniform2f(transLoc, sparks.coords[i][0], sparks.coords[i][1]);
			gl.drawArrays(gl.TRIANGLES, 0, sparks.vertices.length);

		}
	}
}

function renderPaddle() {
	gl.bufferData(gl.ARRAY_BUFFER, flatten(paddle.vertices), gl.STATIC_DRAW);
	gl.uniform4f(fragColorLoc, 1.0, 1.0, 1.0, 1.0); // Ensure paddles get rendered as white, regardlesss of ball
	gl.uniform2f(transLoc, transX1, 0);
	gl.drawArrays(gl.TRIANGLE_FAN, 0, paddle.vertices.length);
}

function renderBall() {
	gl.bufferData(gl.ARRAY_BUFFER, flatten(ball.vertices), gl.STATIC_DRAW);
	gl.uniform4f(fragColorLoc, ball.color[0], ball.color[1], ball.color[2], ball.color[3]);
	gl.uniform2f(transLoc, ball.x, ball.y);
	gl.drawArrays(gl.TRIANGLE_FAN, 0, ball.vertices.length);
	
	ball.x += ball.speed * xDir * 0.01 * Math.sin(theta) * Math.abs(Math.cos(theta))  ;
	ball.y += ball.speed * yDir * 0.01 * Math.cos(theta);

}

function renderTrail(){
	trail.coords[trailIdx] = vec2(ball.x, ball.y);
	trailIdx = (trailIdx+1) % trailLen;

	gl.bufferData(gl.ARRAY_BUFFER, flatten(trail.vertices), gl.STATIC_DRAW);
	for (var i=0; i<trailLen; i++){
		if (i == trailIdx - 1) 
			continue;
		
		gl.uniform4f(fragColorLoc, ball.color[0], ball.color[1], ball.color[2], ball.color[3]);
		gl.uniform2f(transLoc, trail.coords[i][0], trail.coords[i][1]);
		gl.drawArrays(gl.TRIANGLE_FAN, 0, trail.vertices.length);
	}
}

function renderBricks(){
	gl.bufferData(gl.ARRAY_BUFFER, flatten(bricks.vertices), gl.STATIC_DRAW);
	for (var i=0; i<bricks.coords.length; i++){
		gl.uniform4f(fragColorLoc, bricks.colors[i][0], bricks.colors[i][1], bricks.colors[i][2], bricks.colors[i][3]);
		gl.uniform2f(transLoc, bricks.coords[i][0], bricks.coords[i][1]);
		gl.drawArrays(gl.TRIANGLE_FAN, 0, bricks.vertices.length);
	}
}



 /* ----=================---------------==================--------------------==========================================

/************** COLLISION FUNCTIONS *************** */
 
/* ballCollisionUpdate(): Initial function for ball collision checks */
function ballCollisionUpdate() {

	//if all bricks = destroyed , endgame win
	checkVictory();

	// check collision with paddle
	if (checkPaddleCollision() == true){
		playSound("audio/anvil.mp3");
		generateSparks(10);
		return true;
	}

	// Check to see if ball is touching wall
	if (checkWallCollision() == true)
		return true;

	//remove the brick if collision with ball
	var collidedWith = -1;
	if ( (collidedWith = checkBrickCollision()) >- 1){
		playSound("audio/anvil.mp3");
		displayScore();
		bricks.coords.splice(collidedWith,1);
		bricks.colors.splice(collidedWith,1);
		generateSparks(10);
		return true;
	}
}

function checkBrickCollision(){

	for (var i=0; i<bricks.coords.length; i++)
	{
		if (ball.x >= bricks.coords[i][0] && ball.x <= bricks.coords[i][0] + bricks.width &&
			ball.y >= bricks.coords[i][1] && ball.y <= bricks.coords[i][1] + bricks.height)
		{
			var ub = Math.abs(ball.y - (bricks.coords[i][1] + bricks.height));
			var db = Math.abs(ball.y - (bricks.coords[i][1]));
			var rb = Math.abs(ball.x - (bricks.coords[i][0] + bricks.width));
			var lb = Math.abs(ball.x - (bricks.coords[i][0]));
		} else continue;

		var k = Math.min(ub,db,rb,lb);
		
		if (k == ub) {
			yDir = 1;
		}  if (k == db){
			yDir = -1;
		}  if (k == rb) {
			theta *= -1;
		}  if(k == lb){
			theta *= -1;
		}
		changeColorv(bricks.colors[i]);
		return i;
	}
	return -1;
}

function checkVictory()
{
	if (bricks.coords.length == 0){
		console.log("VICTORY");
		field.playing = false;
	}
}


// collision with wall
function checkWallCollision(){
	var ret = false;

	//Upper wall
	if(ball.y >= 1 - ball.radius) {
		yDir = -1;
		ret = true;
	}

	//Bottom wall
	if(ball.y <= -1 + ball.radius) {
		yDir = 1;
		ret = true
		field.playing = false;
	}

	//Left wall
	if(ball.x <= -1 + ball.radius) {
		theta *= -1;
		ball.x += 0.001;
		ret = true;
	}

	//Right wall
	if(ball.x >= 1 - ball.radius) {
		theta *= -1;
		ball.x -= 0.001;
		ret = true;
	}

	return ret;
}

//collision with paddle

function checkPaddleCollision(){
	if (ball.y - ball.radius < paddle.y + paddle.halfheight) {

		if ((ball.x  > paddle.x - paddle.halfwidth) && 
			(ball.x  < paddle.x + paddle.halfwidth)) //COLLISION!
		{ 
			yDir = 1;
			ball.speed += 0.4/ball.speed;
			theta = ( paddle.x - ball.x )* 2 * Math.PI;
			return true;
		}
	}
	return false;
}

 /* ----=================---------------==================--------------------==========================================*/

 //************  HELPER FUNCTIONS  *****************

function resetBall(playerNum) {
	ball.x = 0;
	ball.y = 0;
	ball.speed = 1;
	ball.color = vec4(1.0, 1.0, 1.0, 1.0);
	theta = 0;
	transYBall = 0.01;
	yDir = -1;
}

/* changeColor(): update the ball with a random color after a paddle collision */
function changeColor() {
	ball.color = vec4(Math.random().toFixed(2),Math.random().toFixed(2),Math.random().toFixed(2),1.0);
}

function changeColorv(colorvect)
{
	ball.color = vec4(colorvect[0], colorvect[1], colorvect[2], 1.0);
}

/* updateScore(playerNum): updates the score of player #playerNum */
function displayScore(playerNum) {
		field.score1 += 2*ball.speed;
		document.getElementById('score1').innerHTML = Math.round(field.score1);
}

function displaySpeed(){
	field.score2 = Math.sqrt(ball.speed * 0.01 * theta*ball.speed * 0.01 * theta + transYBall * yDir * ball.speed*transYBall * yDir * ball.speed);
	document.getElementById('score2').innerHTML = field.score2;
}

// function to move the paddle to mouse coords
function onDocumentMouseMove( event ){

	mouseX = event.clientX - (document.body.clientWidth - canvas.width)/2;
	normalized = (mouseX-canvas.width/2) / canvas.width*2;

	if ( normalized > -1 + paddle.halfwidth && normalized < 1 - paddle.halfwidth){	
		transX1 = normalized;
		paddle.x = transX1;
	} else if (normalized > -1 + paddle.halfwidth) {
		transX1 = 1 - paddle.halfwidth;
		paddle.x = transX1;
	} else {
		transX1 = -1 + paddle.halfwidth;
		paddle.x = transX1;
	}
}

function onDocumentMouseClick( event )
{
	if (field.playing == false) {
		initObjects();
		field.playing = true;
	}
}


function playSound(sound){
	var snd = document.getElementById( "music" );
	snd.pause;
	snd = new Audio(sound);
	snd.volume = 0.2;
	snd.play();
	
}

function randomIntFromInterval(min,max)
{
    return Math.random()*(max-min)+min;
}