var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");

var car_image = new Image();
car_image.src = "small_car.png";

var dq_image = new Image();
dq_image.src = "Dairy_Queen_logo.svg";

var moose_image = new Image();
moose_image.src = "moose.png";

var tree_images = make_tree_images()

var car_x = 0;
var car_y = 0;
var car_speed = 0;
var car_moving_ticks = 0;
var car_jump_height = 11;
var car_jump = 0;
var car_jumping = false;
var car_jump_speed = 15;
var car_crashed = false;

// true - landscape is moving higher
// false - landscape is moving lower
var ascending = true;

var moose_x = 0;
var moose_time;

var spedometer = document.getElementById("speed");
var points_box = document.getElementById("points");
var points = 0;


var road_end_y;

// Frame's road
var frame_road = []

// y position of road beginning and end in current frame
var road_begin_y;
var road_end_y;

// Create the various tree Image objects
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

// Initialize variables for a new frame.
// Every time the car leaves the right side of the screen
// a new frame is generated and the car wraps around to
// re-enter from the left.
function new_frame()
{
	// Switch road direction if too high
	if (ascending && road_end_y < canvas.height / 3)
	{
		ascending = false;
	}
	else if (!ascending && road_end_y > canvas.height * 3/4)
	{
		ascending = true;
	}

	// Generate a new road
	frame_road = make_road()
	
	// Move the car to the left side of the screen
	car_x = 0;
	
	// Set the new road's beginning y to the old road's ending y
	road_begin_y = road_end_y;
	
	// How long until the moose disappears in ticks: 5 seconds
	moose_time = 50;
	points_box.textContent = points;
}

// Draw the car
function draw_car(x, y)
{
	ctx.drawImage(car_image, x, y - car_image.height, car_image.width, car_image.height);
}

// Draw DQ
function draw_dq(x, y)
{
	ctx.drawImage(dq_image, x, y - 50, 50, 25);
}

// Draw the moose
function draw_moose(x, y)
{
	if (moose_time > 0)
	{
		ctx.drawImage(moose_image, x, y - moose_image.height, moose_image.width, moose_image.height);
		moose_time--;
	}
}

// Draw a road segment
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

	ctx.moveTo(x, y+5);
	ctx.lineTo(x_end, y_end+5);
	ctx.lineTo(x_end, y_end-5);	
	ctx.lineTo(x, y-5);	
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

// Update entities positions and render the screen
function animate()
{	
	// Clear the canvas
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	
	var road_segments = []

	var road_x = 0;
	var road_y = road_begin_y;
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

// Generate all the road segments for a frame
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

// Generate a road segment
function next_road_segment()
{	
	var height;
		
	if (ascending)
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
			new_frame();
		}
	}	
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
	new_frame();
});

setInterval(animate, 100);


