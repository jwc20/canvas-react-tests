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

// cube parameters
let cx = canvas.width / 2;
let cy = canvas.height / 2;
let cz = 0;
let size = canvas.height / 4; // radius of the cube


class POINT3D {
  constructor(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
  }
}

// 8 corners of the cube
let vertices = [
  new POINT3D(cx - size, cy - size, cz - size),
  new POINT3D(cx + size, cy - size, cz - size),
  new POINT3D(cx + size, cy + size, cz - size),
  new POINT3D(cx - size, cy + size, cz - size),
  new POINT3D(cx - size, cy - size, cz + size),
  new POINT3D(cx + size, cy - size, cz + size),
  new POINT3D(cx + size, cy + size, cz + size),
  new POINT3D(cx - size, cy + size, cz + size),
];

let edges = [
  [0, 1],[1,2],[2,3],[3,0], // back face
  [4,5],[5,6],[6,7],[7,4], // front face
  [0,4],[1,5],[2,6],[3,7] // connecting sides
]

function animate(timeNow) {
  // ctx.clearRect(0, 0, canvas.width, canvas.height);
  // effect.handleParticles(ctx);
  timeDelta = timeNow - timeLastFrame;
  timeLastFrame = timeNow;

  ctx.fillRect(0, 0, canvas.width, canvas.height);

  let angle = timeDelta * 0.001 * SPEED_Z * Math.PI * 2;

  for (let v of vertices) {
    let dx = v.x - cx;
    let dy = v.y - cy;
    let x = dx * Math.cos(angle) - dy * Math.sin(angle);
    let y = dx * Math.sin(angle) + dy * Math.cos(angle);
    v.x = x + cx;
    v.y = y + cy;
  }

  angle = timeDelta * 0.001 * SPEED_X * Math.PI * 2;
  for (let v of vertices) {
    let dy = v.y - cy;
    let dz = v.z - cz;
    let y = dy * Math.cos(angle) - dz * Math.sin(angle);
    let z = dy * Math.sin(angle) + dz * Math.cos(angle);
    v.y = y + cy;
    v.z = z + cz;
  }

  angle = timeDelta * 0.001 * SPEED_Y * Math.PI * 2;
  for (let v of vertices) {
    let dx = v.x - cx;
    let dz = v.z - cz;
    let x = dx * Math.cos(angle) - dz * Math.sin(angle);
    let z = dx * Math.sin(angle) + dz * Math.cos(angle);
    v.x = x + cx;
    v.z = z + cz;
  }
    
  // draw edges 
  for (let edge of edges) {
    ctx.beginPath();
    ctx.moveTo(vertices[edge[0]].x, vertices[edge[0]].y);
    ctx.lineTo(vertices[edge[1]].x, vertices[edge[1]].y);
    ctx.stroke();
  }
  requestAnimationFrame(animate);
}
animate(Date.now());
