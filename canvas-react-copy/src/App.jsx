import "./App.css";
import ParticleCanvas from "./components/ParticleCanvas.jsx";
import GridCanvas from "./components/GridCanvas.jsx";
import GraphCanvas from "./components/GraphCanvas.jsx";
import { useRef } from "react";

function App() {
  const graphRef = useRef(null);

  const handleGraphReady = (graphSystem) => {
    graphRef.current = graphSystem;

    // graphSystem.node(startX, startY, radius, text)
    const nodeA = graphSystem.node(200, 150, 50, "A");
    const nodeB = graphSystem.node(400, 150, 40, "B");
    const nodeC = graphSystem.node(300, 300, 45, "C");
    const nodeD = graphSystem.node(500, 250, 35, "D");

    nodeA.connect(nodeB, "5");
    nodeA.connect(nodeC, "3");
    nodeB.connect(nodeD, "2");
    nodeC.connect(nodeD, "4");
    nodeB.connect(nodeC, "1");
  };

  return (
    <div className="App">
      <GraphCanvas onGraphReady={handleGraphReady} />

      <div
        style={{
          position: "fixed",
          top: "20px",
          left: "20px",
          zIndex: 1,
          background: "rgba(255,255,255,0.9)",
          padding: "1rem",
          borderRadius: "8px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
        }}
      ></div>
    </div>
  );
}

export default App;
