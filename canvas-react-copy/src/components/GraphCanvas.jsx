import { useCanvas } from '../hooks/useCanvas.js';
import { GraphSystem } from '../lib/GraphSystem.js';

const GraphCanvas = ({ onGraphReady, ...props }) => {
  const { canvasRef, system } = useCanvas({
    onInit: (canvas, ctx) => {
      const graphSystem = new GraphSystem(canvas, ctx, {
        editable: false,
        buildable: false,
        fps: 60
      });
      
      if (onGraphReady) {
        onGraphReady(graphSystem);
      }
      
      return graphSystem;
    },
    
    onDraw: (ctx, canvas, graphSystem) => {
      graphSystem.draw(ctx);
    },
    
    onResize: (canvas, graphSystem) => {
      if (graphSystem) {
        graphSystem.resize(canvas);
      }
    }
  });

  return (
    <canvas 
      ref={canvasRef} 
      style={{ 
        display: 'block',
        width: '100vw',
        height: '100vh',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: -1,
        background: '#fff'
      }}
      {...props} 
    />
  );
};

export default GraphCanvas;
