import { useCanvas } from "../hooks/useCanvas.js";
import { ParticleSystem } from "../lib/ParticleSystem.js";

const ParticleCanvas = (props) => {
  const { canvasRef } = useCanvas({
    onInit: (canvas, ctx) => {
      return new ParticleSystem(canvas, ctx, {
        numberOfParticles: 200,
        maxDistance: 100,
        mouseRadius: 150,
      });
    },

    onDraw: (ctx, canvas, particleSystem) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particleSystem.update();
      particleSystem.draw(ctx);
    },

    onResize: (canvas, particleSystem) => {
      if (particleSystem) {
        particleSystem.resize(canvas);
      }
    },
  });

  return (
    <canvas
      ref={canvasRef}
      style={{
        display: "block",
        width: "100vw",
        height: "100vh",
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: -1,
      }}
      {...props}
    />
  );
};

export default ParticleCanvas;
