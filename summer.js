var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");

var car_image = new Image();
car_image.src = "small_car.png";

var dq_image = new Image();
dq_image.src = "Dairy_Queen_logo.svg";

var moose_image = new Image();
moose_image.src = "moose.png";


var car_x = 0;
var car_y = 0;
var car_speed = 0;
var car_moving_ticks = 0;
var car_crashed = false;
var car_jump_height = 11;
var car_jump = 0;
var car_jumping = false;
var car_jump_speed = 15;

var moose_x = 0;
var moose_time;

var spedometer = document.getElementById("speed");
var points_box = document.getElementById("points");
var points = 0;

// Tree images
var tree_images = make_tree_images()

var road_end_y = canvas.height - 10;
var frame_road = []
var frame_road_y;

function new_screen()
{
	car_x = 0;
	frame_road = [];
	frame_road_y = road_end_y;
	//5 seconds
	moose_time = 50;
	points_box.textContent = points;
}

function resize_image(an_image, height)
{
	var ratio = an_image.width / an_image.height;
	an_image.height = height;
	an_image.width = height * ratio;
}

function draw_car(x, y)
{
	ctx.drawImage(car_image, x, y - car_image.height, car_image.width, car_image.height);
}

function draw_dq(x, y)
{
	ctx.drawImage(dq_image, x, y - 50, 50, 25);
}

function draw_moose(x, y)
{
	if (moose_time > 0)
	{
		ctx.drawImage(moose_image, x, y - moose_image.height, moose_image.width, moose_image.height);
		moose_time--;
	}
}

function random_number(min, max) {
  var diff = max - min;
  return max - Math.round(Math.random() * diff);
}

function make_tree_images()
{
	var tree_files = ["tree1.png", "tree2.png", "tree3.png", null]
	tree_images = []
	for (let i=0;i < tree_files.length; i++)
	{
		if (tree_files[i])
		{
			tree_image = new Image();
			tree_image.src = tree_files[i];
			tree_images[i] = tree_image;
		}
	}
	
	return tree_images;
}

function animate()
{	
	// Clear the canvas
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	
	if (frame_road.length == 0)
	{
		frame_road = make_road()
	}

	var road_segments = []

	var road_x = 0;
	var road_y = frame_road_y;
	var car_road_y = 0;
	
	for (let i=0; i < frame_road.length; i++)
	{
		[road_x, road_y] = draw_road(road_x, road_y, frame_road[i]);

		// check if car is on this road segment
		if (car_road_y == 0 && car_x < road_x)
		{
			if (!car_jumping)
			{
				car_y = road_y;
			}
			// the y coord of the road under the car
			car_road_y = road_y;
		}
	}
	
	road_end_y = road_y;
	
	move_car(car_road_y);

	draw_car(car_x, car_y);
}

function make_road()
{
	var road = []

	for (let road_x = 0; road_x < canvas.width;) {
		next_segment = next_road_segment();
		road_x += next_segment[0];
		road.push(next_segment);
	}

	var moose_index = random_number(7, road.length);
	road[moose_index][3] = true;
	
	return road;
}

var climbing = true;
function next_road_segment()
{	
	var height;
	if (climbing && frame_road_y < canvas.height / 3)
	{
		climbing = false;
	}
	else if (!climbing && frame_road_y > canvas.height * 3/4)
	{
		climbing = true;
	}
		
	if (climbing)
	{
		height = random_number(2,-10);
	}
	else
	{
		height = random_number(10,-2);
	}
	
	return [50, height, tree_images[random_number(0,tree_images.length)], false];
}

function move_car(road_y)
{	
	if (car_crashed)
	{
		return;
	}

	if (car_jump > 0) //&& car_jump - car_jump_start < car_jump_height
	{
		car_y -= car_jump_speed;
		car_jump--;
	}
	else if (car_y < road_y)
	{
		car_y += car_jump_speed;
	}
	else
	{
		car_jumping = false;
	}
	
	if (car_speed != 0)
	{
		car_moving_ticks++;

		car_x += Math.floor(car_speed / 2);
		if (moose_time > 0 && 
			car_x + car_image.width > moose_x
			&& car_x < moose_x + moose_image.width
			&& car_y > (road_y + 5) - moose_image.height)
		{			
			car_crashed = true;
			//car_image.width /= 2;
			car_image.src = "explosion.png";
			car_image.height = 100;
			car_image.width = 100;
			//car_x = moose_x - car_image.width;
			return;
		}

		if (car_moving_ticks > 2 && !car_jumping)
		{
			car_speed -= 2;
			car_moving_ticks = 0;
			if (car_speed < 0)
			{
				car_speed = 0;
			}
		}

		if (car_x > canvas.width)
		{
			points += 100;
			new_screen();
		}
	}	
}

function draw_road(x, y, road_segment)
{
	var x_end = x + road_segment[0];
	var y_end = y + road_segment[1];
	
	if (road_segment[2])
	{
		// Draw tree
		ctx.drawImage(road_segment[2], x, y - 160, 70, 150);
	}
	
	ctx.beginPath();

	//ctx.lineWidth = 2;
	//ctx.strokeStyle = "rgb(211,211,211)";
	//ctx.fillStyle = "rgb(211,211,211)";
	ctx.moveTo(x, y+5);
	ctx.lineTo(x_end, y_end+5);
	ctx.lineTo(x_end, y_end-5);	
	ctx.lineTo(x, y-5);	
	//ctx.stroke();
	ctx.fill();

	ctx.closePath();
	
	for (let i=0; i <= 4; i++) {
		ctx.beginPath();
		ctx.lineWidth = 2;
		ctx.strokeStyle = "rgb(255,255,255)";
		ctx.moveTo(x + (length / 4) * i, y);
		ctx.lineTo(x + (length / 4) * i + 10, y);
		ctx.stroke();
		ctx.closePath();
	}	
	
	if (road_segment[3])
	{
		moose_x = x;
		
		draw_moose(moose_x, y + 5);		
	}
	
	return [x_end, y_end];
}

var lastKeyDown = new Date().getTime();

function keyDownHandler(e) {
	// Handle a key event once per second
	if (car_crashed || new Date().getTime() - lastKeyDown < 1000)
	{
		return;
	}
	
	if(e.key == "Right" || e.key == "ArrowRight") 
	{ 
		if (car_speed < 90)
		{
			car_speed += .75;		
			spedometer.textContent = Math.ceil(car_speed);
		}
	}
	else if(e.key == "Left" || e.key == "ArrowLeft") 
	{
		if (car_speed > 0 && !car_jumping)
		{
			car_speed -= 4;
		}
	}
	else if(e.key == "Up" || e.key == "ArrowUp") 
	{
		if (!car_jumping)
		{
			car_jumping = true;
			car_jump = car_jump_height;
		}
	}
	else if(e.key == "Down" || e.key == "ArrowDown") 
	{
	}
}

document.addEventListener("keydown", keyDownHandler, false);
window.addEventListener("load", (event) => {
	resize_image(moose_image, 80);
	canvas.width = window.innerWidth - 1;
	canvas.height = window.innerHeight - 10;
	road_end_y = canvas.height - 10;	
	new_screen();
});

setInterval(animate, 100);


