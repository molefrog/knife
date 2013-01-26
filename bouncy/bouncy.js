$(function() {
	// Global parameters
	var BALL_RADIUS     = 40.0;
	var PIXELS_IN_METER = 50.0;
	var TICK_INTERVAL   = 16; // ~60 fps
	var FRICTION        = 0.9;

	function Ball() {
		this.x              = 10.0;
		this.velocity       = 0.0;
		this.acceleration   = -9.8;
		this.mass           = 1.0;
	}

	// Creating a ball instance
	var ball = new Ball();

	// Creating a drawing context 
	// (using sketch.js helper library).
	var ctx = Sketch.create();

	// This function will be called each time before redraw
	ctx.draw = function() {
		// Translating our coordinate system to center
		ctx.translate(ctx.width * 0.5, ctx.height - BALL_RADIUS);

		// Drawing a ball
		ctx.fillStyle = '#9CB5FC';
		ctx.beginPath();
		ctx.arc(0.0, -ball.x * PIXELS_IN_METER, BALL_RADIUS, 0, TWO_PI);
		ctx.fill();
	}

	// This function represents one iteration of calculations
	function physicsTick() {
		// dt must be in seconds!
		var dt = TICK_INTERVAL / 1000;

		// Using numerical differentiation to calculate new velocity
		ball.velocity = ball.velocity + ball.acceleration * dt;

		// Using this method again to recalculate position
		ball.x = ball.x  + ball.velocity * dt;

		// Collision detection
		if(ball.x < 0.0) {
			ball.x = 0.0;
			ball.velocity = -FRICTION * ball.velocity;
		}
	}


	var currentTimer = null;

	window.toggleSimulation = function toggleSimulation() {
		if(currentTimer) {
			clearInterval(currentTimer);
			currentTimer = null;
		} else {
			ball = new Ball();
			var i = 0;
			currentTimer = setInterval(physicsTick, TICK_INTERVAL);
		}
	}
});