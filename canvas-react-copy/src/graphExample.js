const handleGraphReady = (graphSystem) => {
  
  const node1 = graphSystem.node(100, 100, 30, "Start");
  const node2 = graphSystem.node(300, 100, 25, "Middle");
  const node3 = graphSystem.node(500, 100, 35, "End");
  
  node1.connect(node2, "10");
  node2.connect(node3, "5");
};

const createBinaryTree = (graphSystem) => {
  const root = graphSystem.node(400, 50, 30, "Root");
  const left = graphSystem.node(250, 150, 25, "L");
  const right = graphSystem.node(550, 150, 25, "R");
  const ll = graphSystem.node(150, 250, 20, "LL");
  const lr = graphSystem.node(350, 250, 20, "LR");
  const rl = graphSystem.node(450, 250, 20, "RL");
  const rr = graphSystem.node(650, 250, 20, "RR");
  
  root.connect(left);
  root.connect(right);
  left.connect(ll);
  left.connect(lr);
  right.connect(rl);
  right.connect(rr);
};

const createWeightedGraph = (graphSystem) => {
  const nodes = [];
  const positions = [
    [100, 100], [300, 80], [500, 120],
    [150, 250], [350, 280], [480, 260]
  ];
  
  positions.forEach((pos, i) => {
    const node = graphSystem.node(pos[0], pos[1], 25, `N${i + 1}`);
    nodes.push(node);
  });
  
  const connections = [
    [0, 1, "5"], [0, 3, "10"], [1, 2, "3"],
    [1, 4, "7"], [2, 5, "2"], [3, 4, "4"],
    [4, 5, "6"]
  ];
  
  connections.forEach(([from, to, weight]) => {
    nodes[from].connect(nodes[to], weight);
  });
};

const createDirectionalGraph = (graphSystem) => {
  const a = graphSystem.node(200, 100, 30, "A");
  const b = graphSystem.node(400, 100, 30, "B");
  const c = graphSystem.node(300, 250, 30, "C");
  
  a.directional(b, "directed");
  b.biDirectional(c, "bidirectional");
  c.directional(a, "cycle");
};

const addNodesFromData = (graphSystem, data) => {
  const nodeMap = {};
  
  data.nodes.forEach(nodeData => {
    const node = graphSystem.node(
      nodeData.x, 
      nodeData.y, 
      nodeData.radius || 25, 
      nodeData.label
    );
    if (nodeData.color) {
      node.setColor(nodeData.color);
    }
    nodeMap[nodeData.id] = node;
  });
  
  data.edges.forEach(edgeData => {
    const fromNode = nodeMap[edgeData.from];
    const toNode = nodeMap[edgeData.to];
    if (fromNode && toNode) {
      if (edgeData.directional) {
        fromNode.directional(toNode, edgeData.weight || "");
      } else {
        fromNode.connect(toNode, edgeData.weight || "");
      }
    }
  });
};

const exampleData = {
  nodes: [
    { id: "a", x: 100, y: 100, radius: 30, label: "A", color: "#ff6b6b" },
    { id: "b", x: 250, y: 80, radius: 25, label: "B", color: "#4ecdc4" },
    { id: "c", x: 400, y: 120, radius: 35, label: "C", color: "#45b7d1" },
    { id: "d", x: 300, y: 250, radius: 28, label: "D", color: "#96ceb4" }
  ],
  edges: [
    { from: "a", to: "b", weight: "5", directional: false },
    { from: "b", to: "c", weight: "3", directional: true },
    { from: "c", to: "d", weight: "7", directional: false },
    { from: "d", to: "a", weight: "2", directional: true }
  ]
};

const handleGraphReady = (graphSystem) => {
  addNodesFromData(graphSystem, exampleData);
  
  graphSystem.setTickCallback((graph) => {
    
  });
  
  graphSystem.setNodeCreatedCallback((node) => {
    console.log("Node created:", node.text);
  });
  
  graphSystem.setConnectionCreatedCallback((edge) => {
    console.log("Connection created:", edge.text);
  });
};

const performAlgorithms = (graphSystem) => {
  const nodes = Object.values(graphSystem.objs);
  if (nodes.length >= 2) {
    const start = nodes[0];
    const end = nodes[nodes.length - 1];
    
    setTimeout(async () => {
      console.log("Running BFS...");
      const bfsPath = await graphSystem.breadthFirstSearch(start.id, end.id, true);
      console.log("BFS Path:", bfsPath);
    }, 1000);
    
    setTimeout(async () => {
      console.log("Running Dijkstra...");
      const dijkstraResult = await graphSystem.dijkstra(start.id, end.id, true);
      console.log("Dijkstra Result:", dijkstraResult);
    }, 3000);
    
    setTimeout(async () => {
      console.log("Running A*...");
      const astarResult = await graphSystem.Astar(start.id, end.id, true);
      console.log("A* Result:", astarResult);
    }, 5000);
  }
};

const dynamicGraphCreation = (graphSystem) => {
  let nodeCount = 0;
  
  const addNode = () => {
    nodeCount++;
    const angle = (nodeCount * 2 * Math.PI) / 8;
    const centerX = 400;
    const centerY = 300;
    const radius = 150;
    
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;
    
    const node = graphSystem.node(x, y, 25, `N${nodeCount}`);
    
    const existingNodes = Object.values(graphSystem.objs);
    if (existingNodes.length > 1) {
      const previousNode = existingNodes[existingNodes.length - 2];
      previousNode.connect(node, Math.floor(Math.random() * 10) + 1);
    }
    
    if (nodeCount < 8) {
      setTimeout(addNode, 1000);
    }
  };
  
  addNode();
};
