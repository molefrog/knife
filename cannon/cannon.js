$(function() {
	// Global parameters
	var BALL_RADIUS     = 40.0;
	var PIXELS_IN_METER = 50.0;
	var TICK_INTERVAL   = 15; // ~60 fps
	var FRICTION        = 0.9;

	function Ball() {
		this.x              = 0.0;
		this.y 				= 0.0;

		this.velocity_x     = 20.0;
		this.velocity_y 	= 20.0;

		this.acceleration_x = 0.0;
		this.acceleration_y = -9.8;
	}

	// Creating a ball instance
	var ball = new Ball();

	// Creating a drawing context 
	// (using sketch.js helper library).
	var ctx = Sketch.create();

	// This function will be called each time before redraw
	ctx.draw = function() {
		// Translating our coordinate system to center
		ctx.translate(BALL_RADIUS, ctx.height - BALL_RADIUS);

		// Drawing a ball
		ctx.fillStyle = 'hsl(300,70%,40%)';
		ctx.beginPath();
		ctx.arc(ball.x * PIXELS_IN_METER, -ball.y * PIXELS_IN_METER, BALL_RADIUS, 0, TWO_PI);
		ctx.fill();
	}

	// This function represents one iteration of calculations
	function physicsTick() {
		// dt must be in seconds!
		var dt = TICK_INTERVAL / 500;

		// Using numerical differentiation to calculate new velocity
		ball.velocity_x += ball.acceleration_x * dt;
		ball.velocity_y += ball.acceleration_y * dt;

		// Using this method again to recalculate position
		ball.x += ball.velocity_x * dt;
		ball.y += ball.velocity_y * dt;

		// Collision detection
		var rightWall = (ctx.width - 2*BALL_RADIUS)  / PIXELS_IN_METER;
		var upWall    = (ctx.height - 2*BALL_RADIUS) / PIXELS_IN_METER;

		if(ball.y < 0.0) {
			ball.y = 0.0;
			ball.velocity_x = FRICTION * ball.velocity_x;
			ball.velocity_y = -FRICTION * ball.velocity_y;
		}

		if(ball.y > upWall) {
			ball.y = upWall;
			ball.velocity_x = FRICTION * ball.velocity_x;
			ball.velocity_y = -FRICTION * ball.velocity_y;
		}

		if(ball.x < 0.0) {
			ball.x = 0.0;
			ball.velocity_x = -FRICTION * ball.velocity_x;
			ball.velocity_y = FRICTION * ball.velocity_y;
		}

		if(ball.x > rightWall) {
			ball.x = rightWall;
			ball.velocity_x = -FRICTION * ball.velocity_x;
			ball.velocity_y = FRICTION * ball.velocity_y;
		}
	}


	var currentTimer = null;

	window.toggleSimulation = function toggleSimulation() {
		if(currentTimer) {
			clearInterval(currentTimer);
			currentTimer = null;
		}
			ball = new Ball();
			var i = 0;
			currentTimer = setInterval(physicsTick, TICK_INTERVAL);
		
	}
});