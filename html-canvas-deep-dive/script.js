let canvas;
let ctx;
let flowField;
let flowFieldAnimation;

window.onload = function () {
  canvas = document.getElementById("canvas1");
  ctx = canvas.getContext("2d");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  flowField = new FlowFieldEffect(ctx, canvas.width, canvas.height);
  flowField.animate(0);
};

window.addEventListener("resize", function () {
  this.cancelAnimationFrame(flowFieldAnimation);
  console.log("resizing window...");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  flowField = new FlowFieldEffect(ctx, canvas.width, canvas.height);
  flowField.animate(0);
});

const mouse = {
  x: 0,
  y: 0,
};

window.addEventListener("mousemove", function (e) {
  mouse.x = e.x; // mouse.x = e.clientX;
  mouse.y = e.y; // mouse.y = e.clientY;
});

class FlowFieldEffect {
  #ctx; // private class field
  #width;
  #height;
  constructor(ctx, width, height) {
    this.#ctx = ctx;
    this.#ctx.strokeStyle = "white";
    this.#width = width;
    this.#height = height;
    this.angle = 0;
    this.lastTime = 0;
    this.interval = 1000 / 60; // in milliseconds
    this.timer = 0;
    this.cellSize = 35;
  }

  // private class method
  #drawLine(x, y) {
    const length = 300;
    this.#ctx.beginPath();
    this.#ctx.moveTo(x, y);
    this.#ctx.lineTo(x, y + 30);
    this.#ctx.lineTo(x+30, y+30);
    this.#ctx.lineTo(x+30, y);
    this.#ctx.lineTo(x, y);
    this.#ctx.stroke();
  }

  // public class method
  animate(timeStamp) {
    const deltaTime = timeStamp - this.lastTime; // for smooth animation for older computers
    this.lastTime = timeStamp;
    if (this.timer > this.interval) {
      this.#ctx.clearRect(0, 0, this.#width, this.#height);

      // draw a grid
      for (let y = 0; y < this.#width; y += this.cellSize) {
        for (let x = 0; x < this.#height; x += this.cellSize) {
          // this.#draw(this.#width / 2, this.#height / 2);
          this.#drawLine(x,y)
        }
      }

      this.timer = 0;
    } else {
      this.timer += deltaTime;
    }
    flowFieldAnimation = requestAnimationFrame(this.animate.bind(this));
  }
}
