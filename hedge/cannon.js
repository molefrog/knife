$(function() {
	// Creating a drawing context 
	// (using sketch.js helper library).
	var ctx = Sketch.create();	
	
	var t = 0;

	// Position and speed
	var x  = 0, y  = 0;
	var vx = 0, vy = 0;
	// Controlled acceleration
	var ax = 0, ay = 0; 

	// Target
	var targets = [{'x' : 0, 'y' : 0}];

	var Settings = function() {
	  this.K_1            = 2.0;
	  this.K_2     		  = 1.0;
	  this.l              = 200.0; 
	  this.mouse          = true;
	  this.field          = true;
	  this.field_factor	  = 0.2;
	  this.gravity        = 0.0;
	  this.field_interval = 20.0;
	};

	var settings = new Settings();
	window.onload = function() {
	  var gui = new dat.GUI();

	  gui.add(settings, 'K_1', 0.0, 4.0);
	  gui.add(settings, 'K_2', 0.0, 4.0);
	  gui.add(settings, 'l',   0.0, 500.0);
	  gui.add(settings, 'mouse');
	  gui.add(settings, 'gravity', -500.0, 500.0);


	  var field_folder = gui.addFolder('Field');
	  field_folder.add(settings, 'field');
	  field_folder.add(settings, 'field_interval', 10.0, 50.0).step(2);
	  field_folder.add(settings, 'field_factor', 0.0, 0.2);
	};


	var F = function(x_, y_) {
		var ax_ = 0, ay_ = 0;

		for(var i = 0; i < targets.length; ++i) {
			var r = sqrt(pow(targets[i].x - x_, 2) + pow(targets[i].y - y_, 2));
			if(r !== 0) {
				ax_ += settings.K_1 * (r - settings.l) * (targets[i].x - x_) / (r) + settings.K_2 * (-vx);
				ay_ += settings.K_1 * (r - settings.l) * (targets[i].y - y_) / (r) + settings.K_2 * (-vy);  
			}
		}

		ay_ += settings.gravity;
		return [ax_, ay_];
	};

	ctx.draw = function() {

		if(settings.field) {
			var factor = 0.5;
			for(var i = 0; i <= ctx.width + settings.field_interval; i += settings.field_interval) {
				for(var j = 0; j <= ctx.height + settings.field_interval; j += settings.field_interval) {
					var f = F(i, j);

					var x_ = f[0] * settings.field_factor;
					var y_ = f[1] * settings.field_factor;

					var r = sqrt(pow(x_, 2) + pow(y_, 2));
					x_ /= r;
					y_ /= r;

					var maxR = 0.9 * settings.field_interval;
					if(r > maxR) r = maxR;
					var c = 360 * (r / maxR);

					x_ *= r;
					y_ *= r;


					ctx.lineWidth   = 1;
					ctx.strokeStyle = 'hsl(' + c +', 100%, 50%)';

					ctx.beginPath();
					ctx.moveTo(i, j);
					ctx.lineTo(i + x_, j + y_);

					var p = 2;
					var m = 0.6;

					ctx.lineTo(i + m * x_ - p * y_ / r, j + m * y_ + p * x_ / r);
					ctx.moveTo(i + x_, j + y_);
					ctx.lineTo(i + m * x_ + p * y_ / r, j + m * y_ - p * x_ / r);
				

					ctx.stroke();
				}	
			}
		}


		for(var i = 0; i < targets.length; ++i) {
			ctx.lineWidth   = 2;
			ctx.strokeStyle = '#dddddd';
		    ctx.beginPath();
			ctx.moveTo(x, y);
			
			var saw_count = 15;
			var saw_length = 10;

			for(var k = 0; k < saw_count; ++k) {
			
				var nx = saw_length * pow(-1, k)   * (targets[i].y - y);
				var ny = saw_length * pow(-1, k+1) * (targets[i].x - x);
				
				var r = sqrt(pow(targets[i].x - x, 2) + pow(targets[i].y - y, 2));
				if(r !== 0) {
					nx /= r;
					ny /= r;
				}

				ctx.lineTo(x + (targets[i].x-x)*k/saw_count + nx, y + (targets[i].y-y)*k/saw_count + ny);
			}

			ctx.lineTo(targets[i].x, targets[i].y);  
			ctx.stroke();
		}

   		ctx.beginPath();
        ctx.arc( x, y, 30, 0, TWO_PI );
        ctx.fillStyle = '#3F2F82';
        ctx.fill();

		ctx.strokeStyle = '#9487C7';
        ctx.lineWidth   = 2;
        ctx.stroke();

        for(var i = 0; i < targets.length; ++i) {
	   		ctx.beginPath();
	        ctx.arc( targets[i].x, targets[i].y, 10, 0, TWO_PI );
	        ctx.fillStyle = '#FF0077';
	        ctx.fill();
    	}
	};


	ctx.update = function() {
		dt  = ctx.dt / 100;
		if(dt > 0.5) dt = 0.5;
		t  += dt;

		targets = ctx.touches.slice();

		if(!(settings.mouse)) {
			targets = [{
				'x' : ctx.width  * 0.5 + 0.2 * ctx.width * sin(0.7 * t), 
				'y' : ctx.height * 0.5
			}];
		}

		var f = F(x, y);
		ax = f[0];
		ay = f[1];
	
		vx += ax * dt;
		vy += ay * dt;
		x  += vx * dt;
		y  += vy * dt;
	};
});