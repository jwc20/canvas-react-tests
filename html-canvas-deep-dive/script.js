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
    this.#width = width;
    this.#height = height;
    this.angle = 0;
    this.lastTime = 0;
    this.interval = 1000 / 60; // in milliseconds
    this.timer = 0;
    this.cellSize = 15;
    this.gridSize = 30;
    this.gradient;
    this.#createGradient();
    this.#ctx.strokeStyle = this.gradient;
    this.radius = 0;
    this.vr = 0.03; // velocity radius
  }

  #createGradient() {
    this.gradient = this.#ctx.createLinearGradient(0, 0, this.#width, this.#height);
    this.gradient.addColorStop(0.1, "#ff5c33");
    this.gradient.addColorStop(0.2, "#ff9933");
    this.gradient.addColorStop(0.3, "#ffff33");
    this.gradient.addColorStop(0.4, "#b3ff33");
    this.gradient.addColorStop(0.5, "#33ff99");
    this.gradient.addColorStop(0.6, "#33ffff");
    this.gradient.addColorStop(0.7, "#9933ff");
    this.gradient.addColorStop(0.8, "#ff33ff");
    this.gradient.addColorStop(0.9, "#ffff33");
  }

  // private class method
  #drawLine(angle, x, y) {
    let position = { x: x, y: y };
    let dx = mouse.x - position.x;
    let dy = mouse.y - position.y;
    let distance = dx * dx + dy * dy;

    if (distance > 300000) {
      distance = 300000
    }
    else if (distance < 50000) {
      distance = 50000
    }

    let length = distance / 10000;
    this.#ctx.beginPath();
    this.#ctx.moveTo(x, y);
    this.#ctx.lineTo(x + Math.cos(angle) * length, y + Math.sin(angle) * length);
    this.#ctx.lineWidth = 1;
    this.#ctx.stroke();
  }

  #drawGrid(x,y) {
    this.#ctx.beginPath();
    this.#ctx.moveTo(x, y);
    this.#ctx.lineTo(x, y + this.gridSize);
    this.#ctx.lineTo(x+this.gridSize, y+this.gridSize);
    this.#ctx.lineTo(x+this.gridSize, y);
    this.#ctx.lineTo(x, y);
    this.#ctx.lineWidth = 0.3;
    this.#ctx.stroke();
  }

  // public class method
  animate(timeStamp) {
    const deltaTime = timeStamp - this.lastTime; // for smooth animation for older computers
    this.lastTime = timeStamp;
    if (this.timer > this.interval) {
      this.#ctx.clearRect(0, 0, this.#width, this.#height);

      // draw a grid
      for (let y = 0; y < this.#width; y += this.gridSize) {
        for (let x = 0; x < this.#height; x += this.gridSize) {
          this.#drawGrid(x,y)
        }
      }

      this.radius += this.vr;
      if (this.radius > 5 || this.radius < -5) {
        this.vr *= -1;
      }
      for (let y = 0; y < this.#width; y += this.cellSize) {
        for (let x = 0; x < this.#height; x += this.cellSize) {
          const angle = (Math.cos(x * 0.01) + Math.sin(y * 0.01))* this.radius;
          this.#drawLine(angle, x,y)
        }
      }

      this.timer = 0;
    } else {
      this.timer += deltaTime;
    }
    flowFieldAnimation = requestAnimationFrame(this.animate.bind(this));
  }
}
