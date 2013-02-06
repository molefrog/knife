$(function() {
	// Global parameters
	var FRICTION        = 0.3;
	var WORLD_FACTOR	= 40.0;

	// Creating a drawing context 
	// (using sketch.js helper library).
	var ctx = Sketch.create();

	function Ball() {
		this.color 			= 100;

		this.mass 			= 1.0;
		this.radius         = 1.0;

		this.x              = 0.0;
		this.y 				= 0.0;

		this.velocity_x     = 0.0;
		this.velocity_y 	= 0.0;

		this.acceleration_x = 0.0;
		this.acceleration_y = 0.0;

		this.force_x 		= 0.0;
		this.force_y 		= 0.0;
	};

	Ball.prototype.move = function(dt) {
		this.acceleration_x = this.force_x / this.mass;
		this.acceleration_y = this.force_y / this.mass;

		// Using numerical differentiation to calculate new velocity
		this.velocity_x += this.acceleration_x * dt;
		this.velocity_y += this.acceleration_y * dt;

		// Using this method again to recalculate position
		this.x += this.velocity_x * dt;
		this.y += this.velocity_y * dt;

		if(this.y < this.radius) {
			this.y = this.radius;
			this.velocity_x = FRICTION * this.velocity_x;
			this.velocity_y = -FRICTION * this.velocity_y;
		}

		if(this.y > ctx.height / WORLD_FACTOR - this.radius) {
			this.y = ctx.height / WORLD_FACTOR - this.radius
			this.velocity_x = FRICTION * this.velocity_x;
			this.velocity_y = -FRICTION * this.velocity_y;
		}

		if(this.x < this.radius) {
			this.x = this.radius;
			this.velocity_x = -FRICTION * this.velocity_x;
			this.velocity_y = FRICTION * this.velocity_y;
		}

		if(this.x > ctx.width / WORLD_FACTOR - this.radius) {
			this.x = ctx.width / WORLD_FACTOR - this.radius
			this.velocity_x = -FRICTION * this.velocity_x;
			this.velocity_y = FRICTION * this.velocity_y;
		}
	};

	Ball.prototype.draw = function(context) {
		context.save();

		context.fillStyle = 'hsl(' + this.color + ',70%,60%)';
		context.translate(this.x, this.y);

		var v_x = this.velocity_x;
		var v_y = this.velocity_y;

		var factor = 1.0 - 0.5 * atan(sqrt(v_x*v_x + v_y*v_y) / 40.0) / HALF_PI;

		ctx.rotate(atan2(v_y, v_x));
		ctx.scale(1.0, factor);


		context.beginPath();
		context.arc(0.0, 0.0, this.radius, 0, TWO_PI);
		context.fill();

		context.restore();
	};

	var balls = [];

	for(var i = 0; i < 100; ++i) {
		var b = new Ball();

		b.x = random(1, ctx.width/WORLD_FACTOR);
		b.y = random(1, ctx.height/WORLD_FACTOR);
		b.color = random(1, 360);
		b.radius = 0.3 + random(1, 50)/100;

		balls.push(b);
	}


	ctx.draw = function() {
		ctx.scale(WORLD_FACTOR, WORLD_FACTOR);

		for(var i = 0; i < balls.length; ++i) {
			balls[i].draw(ctx);
		}
	};

	ctx.update = function() {
		for(var i = 0; i < balls.length; ++i) {
			var ball = balls[i];

			var f_x = ctx.mouse.x / WORLD_FACTOR;
			var f_y = ctx.mouse.y / WORLD_FACTOR;

			var r = sqrt((ball.x - f_x)*(ball.x - f_x) + (ball.y - f_y)*(ball.y - f_y));

			if(r > 0.1) {
				ball.force_x = 40*(f_x - ball.x) / (r*r);
				ball.force_y = 40*(f_y - ball.y) / (r*r);	
			} else {
				ball.force_x = 0.0;
				ball.force_y = 0.0;
			}
 
			ball.move(0.02);
		}
	};
});