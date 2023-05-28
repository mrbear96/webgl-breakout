/************** COLLISION FUNCTIONS *************** */
 
/* ballCollisionUpdate(): Initial function for ball collision checks */
function ballCollisionUpdate() 
{
	//if all bricks = destroyed , endgame win
	checkVictory();

	// check collision with paddle
	if (checkPaddleCollision() == true){
		playSound("audio/anvil.mp3");
		generateSparks(sparksCnt);
		return true;
	}

	// Check to see if ball is touching wall
	var wallTouched = -1;
	if ((wallTouched = checkWallCollision()) > -1) {
		// if bottom wall touched end game
		if (wallTouched == 1){
			field.playing = false;
			enableOverlay();
		}
		return true;
	}

	//remove the brick if collision with ball
	var collidedWith = -1;
	if ( (collidedWith = checkBrickCollision()) >- 1){
		playSound("audio/anvil.mp3");
		displayScore();
		bricks.coords.splice(collidedWith,1);
		bricks.colors.splice(collidedWith,1);
		generateSparks(sparksCnt);
		return true;
	}
}

/* checkBrickCollision(): Determines wether ball hit a brick 
    and changes yDir and xDir corespondingly */
function checkBrickCollision()
{
	for (var i=0; i<bricks.coords.length; i++)
	{
        if (ball.x + ball.radius/2 >= bricks.coords[i][0] && 
            ball.x - ball.radius/2 <= bricks.coords[i][0] + bricks.width &&
            ball.y + ball.radius/2 >= bricks.coords[i][1] && 
            ball.y - ball.radius/2 <= bricks.coords[i][1] + bricks.height)
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
		enableOverlay();
	}
}

// collision with wall
function checkWallCollision()
{
	var ret = -1;

	//Upper wall
	if(ball.y >= 1 - ball.radius) {
		yDir = -1;
		ret = 0;
	}

	//Bottom wall
	if(ball.y <= -1 + ball.radius) {
		yDir = 1;
		ret = 1
	}

	//Left wall
	if(ball.x <= -1 + ball.radius) {
		theta *= -1;
		ball.x += 0.001;
		ret = 2;
	}

	//Right wall
	if(ball.x >= 1 - ball.radius) {
		theta *= -1;
		ball.x -= 0.001;
		ret = 3;
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
            ball.speed += ballSpeedGain/ball.speed;
            theta = ( paddle.x - ball.x )* 2 * Math.PI;
            dispBallSpeed(ball.speed);
			return true;
		}
	}
	return false;
}

function resetBall(playerNum) {
	ball.x = 0;
	ball.y = 0;
	ball.speed = 1;
	ball.color = vec4(1.0, 1.0, 1.0, 1.0);
	theta = 0;
	transYBall = 0.01;
	yDir = -1;
}

function generateSparks( num )
{
	for (var i=0; i<num; i++){
		sparks.lcoords.push(vec2(ball.x,ball.y));
		sparks.coords.push(vec2(ball.x,ball.y));
		sparks.m_directions.push(vec2(randomIntFromInterval(-0.005,0.005), randomIntFromInterval(-0.005,0.005)));
		sparks.alive.push(10);
	}
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
function displayScore() {
		field.score1 += (ball.speed+1)*(ball.speed+1);
		document.getElementById('score1').innerHTML = getScore();
}

function getScore() {
	return Math.round(field.score1 * 100 ) / 100;
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

function onDocumentMouseClick( event ){
	if (field.playing == false) {
		initObjects();
		field.playing = true;
		disableOverlay();
	}
}

function playSound(sound){
	var snd = document.getElementById( "music" );
	snd.pause;
	snd = new Audio(sound);
	snd.volume = 0.2;
	snd.play();
}

function randomIntFromInterval(min,max){
    return Math.random()*(max-min)+min;
}

function enableOverlay() {
	document.getElementById("_overlay").style.display = "block";

	if (field && user)
	{
		var button = document.createElement("BUTTON");
		button.setAttribute('id', 'upload-score-button');
		button.appendChild(document.createTextNode("UploadScore"));
		button.onclick = uploadScore;
		document.getElementById('uploadScore').appendChild(button);
	}
}

function uploadScore() {
	writeUserData(user.displayName, getScore(), getCurrentDate()); 
}

enableOverlay();

function disableOverlay() {
	document.getElementById("_overlay").style.display = "none";
	deleteElementById("upload-score-button");
	initObjects();
	field.playing = true;
}

function dispTrailLen( val ){ document.getElementById('htmlTrailLen').innerHTML = val; }

function onSetTrailLen() {
	var val = document.getElementById('trlength').value;

	for(var i= trailLen < val ? trailLen : 0; i<100; i++){
		trail.coords[i][0] = -2;
		trail.coords[i][1] = -2;
	}
	trailLen = val;
}

function pause(event) {
	if (field.playing && event.keyCode == 32)
	{
		field.paused = !field.paused;
		console.log("qwe");
	}
	
}
