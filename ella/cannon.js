$(function() {
	// Global parameters
	var BALL_RADIUS     = 40.0;
	var PIXELS_IN_METER = 50.0;
	var TICK_INTERVAL   = 15; // ~60 fps
	var FRICTION        = 0.9;

	function Ball() {
		this.x              = 0.0;
		this.y 				= 0.0;

		this.velocity_x     = 0.0;
		this.velocity_y 	= 0.0;

		this.acceleration_x = 0.0;
		this.acceleration_y = 0.0;
	}

	var _touches = [];

	// Creating a ball instance
	var ball = new Ball();

	// Creating a drawing context 
	// (using sketch.js helper library).
	var ctx = Sketch.create();

	// This function will be called each time before redraw
	ctx.draw = function() {

		for(var i = 0; i < _touches.length; ++i) {
			var t = _touches[i];
			
			ctx.fillStyle = 'hsl(190,70%,40%)';
			ctx.strokeStyle = 'hsl(190,70%,40%)';
			ctx.beginPath();
			ctx.arc(t.x, t.y, 20.0, 0, TWO_PI);
			ctx.fill();

			var next_t = _touches[(i+1) % _touches.length];

			ctx.beginPath();
			ctx.moveTo(t.x, t.y);
			ctx.quadraticCurveTo((next_t.x + t.x)*(0.5 + random(1, 100)*0.0005), (next_t.y + t.y)*(0.5 + random(1, 100)*0.0005), next_t.x, next_t.y);
   			ctx.stroke();
		}

		// Translating our coordinate system to center
		
		//ctx.scale(1.0, 0.5);
		ctx.translate(BALL_RADIUS, ctx.height - BALL_RADIUS);
		
		var t_x = ball.velocity_x;
		var t_y = ball.velocity_y;

		var angle =  -atan2(t_y, t_x); 
		var factor = Math.sqrt(t_x*t_x + t_y*t_y)/80.0;


		// Drawing a ball
		ctx.fillStyle = 'hsl(300,70%,40%)';
		ctx.beginPath();
		ctx.translate(ball.x * PIXELS_IN_METER, -ball.y * PIXELS_IN_METER);
		ctx.rotate(angle);
		ctx.scale(1.0, 1.0-factor);
		ctx.arc(0.0, 0.0, BALL_RADIUS, 0, TWO_PI);
		ctx.fill();
	}

	 ctx.mousemove = function() {
	 	_touches.splice(0, _touches.length);

	 	for(var i = 0; i < ctx.touches.length; ++i) {
	 		_touches.push({
	 			x : ctx.touches[i].x,
	 			y : ctx.touches[i].y });
	 	}
	 };

	// This function represents one iteration of calculations
	function physicsTick() {
		// dt must be in seconds!
		var dt = TICK_INTERVAL / 500;


		ball.acceleration_x = 0.0;
		ball.acceleration_y = 0.0;

		var touches = _touches;
		for(var i = 0; i < touches.length; ++i) {
			var t = touches[i];

			var m_x = (t.x - BALL_RADIUS ) / PIXELS_IN_METER;
			var m_y = (ctx.height - t.y - BALL_RADIUS) / PIXELS_IN_METER;

			var r = (ball.x - m_x)*(ball.x - m_x) + (ball.y - m_y)*(ball.y - m_y);

			var _x = 0.0;
			var _y = 0.0;

			if(r > 0.1) {
				var _x = 80.0*(m_x - ball.x) / r; 
				var _y = 80.0*(m_y - ball.y) / r;
			}

			ball.acceleration_x += _x;
			ball.acceleration_y += _y;
		}


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
		currentTimer = setInterval(physicsTick, TICK_INTERVAL);
	}

	toggleSimulation();
});