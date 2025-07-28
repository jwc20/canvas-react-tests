export class GridSystem {
  #ctx;
  #width;
  #height;

  constructor(canvas, ctx, options = {}) {
    this.#ctx = ctx;
    this.#width = canvas.width;
    this.#height = canvas.height;
    this.canvas = canvas;
    this.gridSize = options.gridSize || 30;
    this.#ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
  }

  #drawGrid(x, y) {
    this.#ctx.beginPath();
    this.#ctx.moveTo(x, y);
    this.#ctx.lineTo(x, y + this.gridSize);
    this.#ctx.lineTo(x + this.gridSize, y + this.gridSize);
    this.#ctx.lineTo(x + this.gridSize, y);
    this.#ctx.lineTo(x, y);
    this.#ctx.lineWidth = 0.3;
    this.#ctx.stroke();
  }

  update() {
    return true;
  }

  draw(ctx) {
    ctx.clearRect(0, 0, this.#width, this.#height);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";

    for (let y = 0; y < this.#height; y += this.gridSize) {
      for (let x = 0; x < this.#width; x += this.gridSize) {
        this.#drawGrid(x, y);
      }
    }
  }

  resize(canvas) {
    this.#width = canvas.width;
    this.#height = canvas.height;
  }

  destroy() {}
}
