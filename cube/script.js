const COLOR_BG = "black";
const COLOR_CUBE = "yellow";
const SPEED_X = 0.05;
const SPEED_Y = 0.15;
const SPEED_Z = 0.1;

const canvas = document.getElementById("canvas1");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

ctx.fillStyle = COLOR_BG;
ctx.strokeStyle = COLOR_CUBE;
ctx.lineWidth = canvas.width / 100;
ctx.lineCap = "round";

let timeDelta = 0;
let timeLastFrame = 0;

class POINT3D {
    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
}

// cube parameters
let cx = canvas.width / 2;
let cy = canvas.height / 2;
let cz = 0;
let size = canvas.height / 4; // radius of the cube

class Cube {
    constructor() {
        this.cx = cx;
        this.cy = cy;
        this.cz = cz;
        this.size = size;
        this.vertices = [];
        this.edges = [];
        // Initialize vertices and edges
        this.createVertices(this.cx, this.cy, this.cz, this.size);
        this.createEdges();
    }

    createVertices(cx, cy, cz, size) {
        // 8 corners of the cube
        this.vertices = [
            new POINT3D(cx - size, cy - size, cz - size),
            new POINT3D(cx + size, cy - size, cz - size),
            new POINT3D(cx + size, cy + size, cz - size),
            new POINT3D(cx - size, cy + size, cz - size),
            new POINT3D(cx - size, cy - size, cz + size),
            new POINT3D(cx + size, cy - size, cz + size),
            new POINT3D(cx + size, cy + size, cz + size),
            new POINT3D(cx - size, cy + size, cz + size),
        ];
    }

    createEdges() {
        this.edges = [
            [0, 1], [1, 2], [2, 3], [3, 0], // back face
            [4, 5], [5, 6], [6, 7], [7, 4], // front face
            [0, 4], [1, 5], [2, 6], [3, 7], // connecting sides
        ];
    }

    draw(context) {
        for (let edge of this.edges) {
            context.beginPath();
            context.moveTo(this.vertices[edge[0]].x, this.vertices[edge[0]].y);
            context.lineTo(this.vertices[edge[1]].x, this.vertices[edge[1]].y);
            context.stroke();
        }
    }
}

class Effect {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.width = canvas.width;
        this.height = canvas.height;
        this.cube = new Cube();
    }

    handleCube(timeNow) {
        timeDelta = timeNow - timeLastFrame;
        timeLastFrame = timeNow;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Rotate around Z axis
        let angle = timeDelta * 0.001 * SPEED_Z * Math.PI * 2;
        for (let v of this.cube.vertices) {
            let dx = v.x - cx;
            let dy = v.y - cy;
            let x = dx * Math.cos(angle) - dy * Math.sin(angle);
            let y = dx * Math.sin(angle) + dy * Math.cos(angle);
            v.x = x + cx;
            v.y = y + cy;
        }

        // Rotate around X axis
        angle = timeDelta * 0.001 * SPEED_X * Math.PI * 2;
        for (let v of this.cube.vertices) {
            let dy = v.y - cy;
            let dz = v.z - cz;
            let y = dy * Math.cos(angle) - dz * Math.sin(angle);
            let z = dy * Math.sin(angle) + dz * Math.cos(angle);
            v.y = y + cy;
            v.z = z + cz;
        }

        // Rotate around Y axis
        angle = timeDelta * 0.001 * SPEED_Y * Math.PI * 2;
        for (let v of this.cube.vertices) {
            let dx = v.x - cx;
            let dz = v.z - cz;
            let x = dz * Math.sin(angle) + dx * Math.cos(angle);
            let z = dz * Math.cos(angle) - dx * Math.sin(angle);
            v.x = x + cx;
            v.z = z + cz;
        }

        // Draw the cube
        this.cube.draw(this.ctx);
    }
}

const effect = new Effect(canvas, ctx);

function animate(timeNow) {
    effect.handleCube(timeNow);
    requestAnimationFrame(animate);
}

animate(Date.now());

window.addEventListener("resize", () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    cx = canvas.width / 2;
    cy = canvas.height / 2;
    ctx.strokeStyle = COLOR_CUBE;
    ctx.lineWidth = canvas.width / 100;
    ctx.lineCap = "round";
    effect.cube = new Cube();
});
