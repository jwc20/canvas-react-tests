class Particle {
  constructor(effect) {
    this.effect = effect;
    this.radius = Math.floor(Math.random() * 10 + 1);
    this.x =
      this.radius + Math.random() * (this.effect.width - this.radius * 2);
    this.y =
      this.radius + Math.random() * (this.effect.height - this.radius * 2);
    this.vx = Math.random() * 1 - 0.5;
    this.vy = Math.random() * 1 - 0.5;
    this.pushX = 0;
    this.pushY = 0;
    this.friction = 0.95;
  }

  draw(context) {
    context.beginPath();
    context.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    context.fill();
  }

  update() {
    if (this.effect.mouse.pressed) {
      const dx = this.x - this.effect.mouse.x;
      const dy = this.y - this.effect.mouse.y;
      const distance = Math.hypot(dx, dy);
      const force = this.effect.mouse.radius / distance;
      if (distance < this.effect.mouse.radius) {
        const angle = Math.atan2(dy, dx);
        this.pushX += Math.cos(angle) * force;
        this.pushY += Math.sin(angle) * force;
      }
    }

    this.x += (this.pushX *= this.friction) + this.vx;
    this.y += (this.pushY *= this.friction) + this.vy;

    if (this.x < this.radius) {
      this.x = this.radius;
      this.vx *= -1;
    } else if (this.x > this.effect.width - this.radius) {
      this.x = this.effect.width - this.radius;
      this.vx *= -1;
    }
    if (this.y < this.radius) {
      this.y = this.radius;
      this.vy *= -1;
    } else if (this.y > this.effect.height - this.radius) {
      this.y = this.effect.height - this.radius;
      this.vy *= -1;
    }
  }

  reset() {
    this.x =
      this.radius + Math.random() * (this.effect.width - this.radius * 2);
    this.y =
      this.radius + Math.random() * (this.effect.height - this.radius * 2);
  }
}

export class ParticleSystem {
  constructor(canvas, context, options = {}) {
    this.canvas = canvas;
    this.context = context;
    this.width = canvas.width;
    this.height = canvas.height;
    this.particles = [];
    this.numberOfParticles = options.numberOfParticles || 200;
    this.maxDistance = options.maxDistance || 100;

    this.mouse = {
      x: 0,
      y: 0,
      pressed: false,
      radius: options.mouseRadius || 150,
    };

    this.createParticles();
    this.setupEventListeners();
    this.setupGradient();
  }

  setupGradient() {
    const gradient = this.context.createLinearGradient(
      0,
      0,
      this.width,
      this.height
    );
    gradient.addColorStop(0, "red");
    gradient.addColorStop(0.5, "white");
    gradient.addColorStop(1, "blue");
    this.context.fillStyle = gradient;
    this.context.strokeStyle = "white";
  }

  setupEventListeners() {
    this.handleMouseMove = (e) => {
      if (this.mouse.pressed) {
        this.mouse.x = e.clientX;
        this.mouse.y = e.clientY;
      }
    };

    this.handleMouseDown = (e) => {
      this.mouse.pressed = true;
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
    };

    this.handleMouseUp = () => {
      this.mouse.pressed = false;
    };

    window.addEventListener("mousemove", this.handleMouseMove);
    window.addEventListener("mousedown", this.handleMouseDown);
    window.addEventListener("mouseup", this.handleMouseUp);
  }

  createParticles() {
    this.particles = [];
    for (let i = 0; i < this.numberOfParticles; i++) {
      this.particles.push(new Particle(this));
    }
  }

  update() {
    this.particles.forEach((particle) => {
      particle.update();
    });
  }

  draw(context) {
    this.connectParticles(context);
    this.particles.forEach((particle) => {
      particle.draw(context);
    });
  }

  connectParticles(context) {
    for (let a = 0; a < this.particles.length; a++) {
      for (let b = a; b < this.particles.length; b++) {
        const dx = this.particles[a].x - this.particles[b].x;
        const dy = this.particles[a].y - this.particles[b].y;
        const distance = Math.hypot(dx, dy);

        if (distance < this.maxDistance) {
          context.save();
          const opacity = 1 - distance / this.maxDistance;
          context.globalAlpha = opacity;
          context.beginPath();
          context.moveTo(this.particles[a].x, this.particles[a].y);
          context.lineTo(this.particles[b].x, this.particles[b].y);
          context.stroke();
          context.restore();
        }
      }
    }
  }

  resize(canvas) {
    this.width = canvas.width;
    this.height = canvas.height;
    this.setupGradient();
    // this.particles.forEach(particle => particle.reset());
  }

  destroy() {
    window.removeEventListener("mousemove", this.handleMouseMove);
    window.removeEventListener("mousedown", this.handleMouseDown);
    window.removeEventListener("mouseup", this.handleMouseUp);
  }
}
