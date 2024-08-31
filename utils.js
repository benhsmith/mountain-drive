// Utility code

function random_number(min, max) {
  var diff = max - min;
  return max - Math.round(Math.random() * diff);
}

// Resize an image to the specified height
function resize_image(an_image, height)
{
	var ratio = an_image.width / an_image.height;
	an_image.height = height;
	an_image.width = height * ratio;
}
