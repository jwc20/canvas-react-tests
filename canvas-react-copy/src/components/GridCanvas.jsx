import { useCanvas } from "../hooks/useCanvas.js";
import { GridSystem } from "../lib/GridSystem.js";

const GridCanvas = (props) => {
  const { canvasRef } = useCanvas({
    onInit: (canvas, ctx) => {
      return new GridSystem(canvas, ctx, {
        gridSize: 50,
      });
    },

    onDraw: (ctx, canvas, gridSystem) => {
      gridSystem.draw(ctx);
    },

    onResize: (canvas, gridSystem) => {
      if (gridSystem) {
        gridSystem.resize(canvas);
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
        background: "#000",
      }}
      {...props}
    />
  );
};

export default GridCanvas;
