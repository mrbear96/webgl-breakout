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
			return true;
		}
	}
	return false;
}

function resetBall(playerNum) {
	ball.x = 0;
	ball.y = 0;
	ball.speed = 2;
	ball.color = vec4(1.0, 1.0, 1.0, 1.0);
	theta = 0;
	transYBall = 0.01;
	yDir = -1;
}