$(function() {
	var max_balls = 300;

	var Settings = function() {
		this.friction 		= 0.1;
		this.restitution 	= 0.9;
		this.universal  	= 2000;
		this.time_speed 	= 4.0;
		this.balls_count	= 150;

		this.leap_enabled 	= false;

		this.color0 = "#f20072";
		this.color1 = "#d1d953";
	};

 	var settings = new Settings();

	window.onload = function() {
		var gui = new dat.GUI();

		gui.add(settings, 'balls_count', 0, max_balls); 
		gui.add(settings, 'friction', 0.0, 0.5);
		gui.add(settings, 'universal', 0.0, 2500.0);
		gui.add(settings, 'time_speed', -5.0, 5.0);

		gui.addColor(settings, 'color0');
		gui.addColor(settings, 'color1');

		gui.close();
	};

	// Creating a drawing context 
	// (using sketch.js helper library).
	var ctx = Sketch.create();
	
	var balls = [];

	var target_x = 0.0;
	var target_y = 0.0;

	function Ball() {
		this.m   = 1.0;
		this.r   = 1.0;

		this.x   = 0.0;
		this.y 	 = 0.0;
 
		this.v_x = 0.0;
		this.v_y = 0.0;

		this.a_x = 0.0;
		this.a_y = 0.0;
	}


	for(var i = 0; i < max_balls; ++i) {
		var ball = new Ball();

		ball.x = random(0, ctx.width);
		ball.y = random(0, ctx.height);

		ball.r = random(20, 40); 
		ball.m = 0.001 * PI * pow(ball.r, 1.5);

		balls.push(ball);
	}


	ctx.update = function() {
		// TODO: fix this, so that simulation speed wouldn't depend
		// on a performance of the machine
		var dt = ctx.dt;
		if(dt > 0.05) dt = 0.05;

		dt *= settings.time_speed;

		if(!(settings.leap_enabled)) {
			target_x = ctx.mouse.x;
			target_y = ctx.mouse.y;
		}


		for(var i = 0; i < settings.balls_count; ++i) {
			var ball = balls[i];

			var force_x = 0.0;	
			var force_y = 0.0;

			force_x += -settings.friction * ball.v_x;
			force_y += -settings.friction * ball.v_y;

			var r = sqrt(pow(ball.x - target_x, 2) + pow(ball.y - target_y, 2));

			if( r > 15.0 ) {
				force_x += settings.universal * (target_x - ball.x) / (r*r);
				force_y += settings.universal * (target_y - ball.y) / (r*r);	
			}

			ball.a_x = force_x / ball.m;
			ball.a_y = force_y / ball.m;

			// Using numerical differentiation to calculate new velocity
			ball.v_x += ball.a_x * dt;
			ball.v_y += ball.a_y * dt;

			// Using this method again to recalculate position
			ball.x += ball.v_x * dt;
			ball.y += ball.v_y * dt;

			// Borders collision
			if(ball.y < ball.r) {
				ball.y = ball.r;
				ball.v_x = ball.v_x;
				ball.v_y = -settings.restitution * ball.v_y;
			}

			if(ball.y > ctx.height - ball.r) {
				ball.y = ctx.height - ball.r
				ball.v_x = ball.v_x;
				ball.v_y = -settings.restitution * ball.v_y;
			}

			if(ball.x < ball.r) {
				ball.x = ball.r;
				ball.v_x = -settings.restitution * ball.v_x;
				ball.v_y = ball.v_y;
			}

			if(ball.x > ctx.width - ball.r) {
				ball.x = ctx.width - ball.r
				ball.v_x = -settings.restitution * ball.v_x;
				ball.v_y = ball.v_y;
			}
		}
	};

	ctx.draw = function() {
		for(var i = 0; i < settings.balls_count; ++i) {
			var ball = balls[i];

			ctx.save();

			var v_r = sqrt(ball.v_x * ball.v_x + ball.v_y * ball.v_y);	
			
			var scale = chroma.scale( [settings.color0, settings.color1]);			
			ctx.fillStyle = scale(v_r / 100).hex();

			ctx.translate(ball.x, ball.y);

			var factor = 1.0 - 0.3 * atan(sqrt(v_r / 20.0)) / HALF_PI;

			ctx.rotate(atan2(ball.v_y, ball.v_x));
			ctx.scale(1.0, factor);

			ctx.beginPath();
			ctx.arc(0.0, 0.0, ball.r, 0, TWO_PI);
			ctx.fill();
			ctx.lineWidth = 0.02;
			ctx.strokeStyle = 'white';
			ctx.stroke();

			ctx.restore();
		}
			
	};



	/* Leap Motion stuff */
	var controller = new Leap.Controller({enableGestures: true});
    var region = new Leap.UI.Region(
    	[-100, 100, -100], 
    	[100, 300, 100]
    );

    controller.addStep(new Leap.UI.Cursor())
    controller.addStep(region.listener({nearThreshold:50}))

    controller.loop(function(frame, done) { 
      if (frame.cursorPosition) {
      	settings.leap_enabled = true;

        var leapPosition = region.mapToXY(
        	frame.cursorPosition, ctx.width, ctx.height);

        target_x = leapPosition[0];
        target_y = leapPosition[1];
      }
      done();
    });

    controller.connection.on('disconnect', function() {
    	settings.leap_enabled = false;
    });

});