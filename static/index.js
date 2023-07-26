window.onload = function () {

  // Definitions
  var canvas = document.getElementById("paint-canvas");
  var context = canvas.getContext("2d");
  var boundings = canvas.getBoundingClientRect();

  // Specifications
  var mouseX = 0;
  var mouseY = 0;
  context.strokeStyle = 'black'; // initial brush color
  context.lineWidth = 48; // initial brush width
  var isDrawing = false;


  // Handle Colors
  var colors = document.getElementsByClassName('colors')[0];

  colors.addEventListener('click', function(event) {
    context.strokeStyle = event.target.value || 'black';
  });

  // Handle Brushes
  var brushes = document.getElementsByClassName('brushes')[0];

  brushes.addEventListener('click', function(event) {
    context.lineWidth = event.target.value || 1;
  });

  // Mouse Down Event
  canvas.addEventListener('mousedown', function(event) {
    setMouseCoordinates(event);
    isDrawing = true;

    // Start Drawing
    context.beginPath();
    context.moveTo(mouseX, mouseY);
  });

  // Mouse Move Event
  canvas.addEventListener('mousemove', function(event) {
    setMouseCoordinates(event);

    if(isDrawing){
      context.lineTo(mouseX, mouseY);
      context.stroke();
    }
  });

  // Mouse Up Event
  canvas.addEventListener('mouseup', function(event) {
    setMouseCoordinates(event);
    isDrawing = false;
  });

  // Handle Mouse Coordinates
  function setMouseCoordinates(event) {
    mouseX = event.clientX - boundings.left;
    mouseY = event.clientY - boundings.top;
  }

  // Handle Clear Button
  var clearButton = document.getElementById('clear');

  clearButton.addEventListener('click', function() {
    context.clearRect(0, 0, canvas.width, canvas.height);
  });	
	
  var canvas = document.getElementById('paint-canvas');
  var sendButton = document.getElementById('send');
  console.log("index.js is loaded");

  sendButton.addEventListener('click', function() {
    // Create a new canvas to draw the filled version
    var filledCanvas = document.createElement('canvas');
    filledCanvas.width = canvas.width;
    filledCanvas.height = canvas.height;
    var ctx = filledCanvas.getContext('2d');

    // Fill the new canvas with white background
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, filledCanvas.width, filledCanvas.height);

    // Draw the original canvas on top of the white background
    ctx.drawImage(canvas, 0, 0);

    // Get the data URL of the filled canvas
    var canvasDataURL = filledCanvas.toDataURL();

    console.log("sending to python");

    // Send the image data to Flask server using AJAX
    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/uploadImage', true);
    xhr.setRequestHeader('Content-Type', 'application/json');

    xhr.onreadystatechange = function() {
      if (xhr.readyState === XMLHttpRequest.DONE) {
        if (xhr.status === 200) {
          // Successfully sent the image to the server
          console.log(xhr.responseText);
        } else {
          // Failed to send the image to the server
          console.error('Error:', xhr.status);
        }
      }
    };

    var data = {
      'canvasDataUrl': canvasDataURL
    };

    xhr.send(JSON.stringify(data));
	
	xhr.onreadystatechange = function() {
	  if (xhr.readyState === XMLHttpRequest.DONE) {
		var responseMessageElement = document.getElementById('response-message');
		if (xhr.status === 200) {
		  // Successfully sent the image to the server
		  var response = JSON.parse(xhr.responseText);
		  responseMessageElement.innerHTML = "<p>Predicted number: " + response.predicted_label + "</p>";
		} else {
		  // Failed to send the image to the server
		  responseMessageElement.textContent = "<p>Error sending image to server.</p>";
		}
	  }
	};
  });
};