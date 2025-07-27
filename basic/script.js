const canvas = document.getElementById("my-canvas");
const ctx = canvas.getContext("2d");

// draw lines
ctx.beginPath();
ctx.lineWidth = 10;
ctx.strokeStyle = "blue";
ctx.moveTo(0, 0);
ctx.lineTo(500, 500);
ctx.lineTo(500, 250);
ctx.lineTo(0, 250);
ctx.lineTo(0, 0);
ctx.stroke();
ctx.closePath();


ctx.beginPath();
ctx.strokeStyle = "green";
ctx.moveTo(100, 0);
ctx.lineTo(500, 500);
ctx.lineTo(500, 250);
ctx.lineTo(0, 250);
ctx.lineTo(0, 0);
ctx.stroke();
ctx.closePath();

ctx.clearRect(0,0,canvas.width, canvas.height);


// text
ctx.beginPath();

ctx.font = "30px Arial"
ctx.fillText("Hello", 200,250);

ctx.closePath();
