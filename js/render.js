
// ************* RENDER FUNCTIONS *****************

/* render(): Main event loop, controls vertex/fragment rendering and fires
    collision detection/score update functions when necessary. */
    function render() 
    {
        if(!field.paused)
            gl.clear(gl.COLOR_BUFFER_BIT); // Clear the buffer
       
        if (field.playing){ // If game is ongoing...
            if(!field.paused){
                renderTrail();
                renderBall();
                renderPaddle();
                renderBricks();
                renderSparks();
                ballCollisionUpdate(); // Check ball collision
            }
        }
        requestAnimFrame(render); // Inform the browser we're ready to render another frame
    }
    
    /* renderSparks(): Renders collision sparks with bricks */
    function renderSparks()
    {
        gl.uniform4f(fragColorLoc, sparks.colors[0], sparks.colors[1], sparks.colors[2], 1.0);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(sparks.vertices), gl.STATIC_DRAW);
        
        for (var num=0; num < sparks.lcoords.length; num++){
            sparks.alive[num] -= 1;
            if(sparks.alive[num] < 0) {
                sparks.lcoords.splice(num,1);
                sparks.coords.splice(num,1);
                sparks.alive.splice(num,1);
                sparks.m_directions.splice(num,1);
                continue;
            }
            
            for (var i=0; i < sparks.coords.length; i++){
                sparks.coords[i][0] += sparks.m_directions[i][0]/4;
                sparks.coords[i][1] += sparks.m_directions[i][1]/4;
                
                gl.uniform2f(transLoc, sparks.coords[i][0], sparks.coords[i][1]);
                gl.drawArrays(gl.TRIANGLES, 0, sparks.vertices.length);
    
            }
        }
    }
    
    function renderPaddle() 
    {
        gl.bufferData(gl.ARRAY_BUFFER, flatten(paddle.vertices), gl.STATIC_DRAW);
        gl.uniform4f(fragColorLoc, 1.0, 1.0, 1.0, 1.0); // Ensure paddles get rendered as white, regardlesss of ball
        gl.uniform2f(transLoc, transX1, 0);
        gl.drawArrays(gl.TRIANGLE_FAN, 0, paddle.vertices.length);
    }
    
    function renderBall() 
    {
        gl.bufferData(gl.ARRAY_BUFFER, flatten(ball.vertices), gl.STATIC_DRAW);
        gl.uniform4f(fragColorLoc, ball.color[0], ball.color[1], ball.color[2], ball.color[3]);
        gl.uniform2f(transLoc, ball.x, ball.y);
        gl.drawArrays(gl.TRIANGLE_FAN, 0, ball.vertices.length);

        ball.x += ball.speed * xDir * 0.01 * Math.sin(theta) * Math.abs(Math.cos(theta))  ;
        ball.y += ball.speed * yDir * 0.01 * Math.cos(theta);
    
        trail.coords[trailIdx] = vec2(ball.x, ball.y);
        trailIdx = (trailIdx+1) % trailLen;
    }
    
    function renderTrail()
    {	
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
    