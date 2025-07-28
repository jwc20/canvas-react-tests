class PriorityQueue {
  constructor() {
    this.items = {};
    this.queue = [];
    this.length = 0;
  }

  insert(item, value, lookupid = null) {
    if (lookupid !== null) {
      this.items[lookupid] = { item: item, value: value };
    }

    if (value == Infinity) {
      this.queue.push({ value: value, item: item, lookupid: lookupid });
      return;
    }
    if (value == -Infinity) {
      this.queue.unshift({ value: value, item: item, lookupid: lookupid });
    }
    if (this.queue.length === 0) {
      this.queue.push({ value: value, item: item, lookupid: lookupid });
      return;
    }
    let index = this._binarySearch(value);
    this.queue.splice(index, 0, { value: value, item: item, lookupid: lookupid });
    this.length += 1;
  }

  _binarySearch(ranking) {
    let start = 0;
    let end = this.queue.length;
    while (end - start > 1) {
      let checkIndex = Math.floor((start + end) / 2);
      if (ranking === this.queue[checkIndex].value) {
        if (checkIndex === 0) {
          return checkIndex;
        }
        while (checkIndex > 0 && this.queue[checkIndex - 1].value == ranking) {
          checkIndex -= 1;
        }
        return checkIndex;
      }
      if (this.queue[checkIndex].value > ranking) {
        end = checkIndex;
        continue;
      }
      if (this.queue[checkIndex].value < ranking) {
        start = checkIndex;
      }
    }
    if (ranking > this.queue[start].value) {
      return end;
    } else {
      return start;
    }
  }

  hasItem(lookupid) {
    if (this.items[lookupid] != undefined) {
      return true;
    }
    return false;
  }

  getItemByKey(lookupid) {
    return this.items[lookupid];
  }

  getItemByIndex(index) {
    return this.queue[index];
  }

  getIndex(lookupid) {
    let ranking = this.items[lookupid].value;
    let index = this._binarySearch(ranking);
    while (this.queue[index].value == ranking && index + 1 < this.queue.length) {
      if (this.queue[index].lookupid === lookupid) {
        return index;
      }
      index += 1;
    }
    return -1;
  }

  replace(newItem, newValue, lookupid) {
    this.delete(lookupid);
    this.insert(newItem, newValue, lookupid);
  }

  delete(lookupid) {
    if (this.hasItem(lookupid)) {
      let index = this.getIndex(lookupid);
      this.queue.splice(index, 1);
      delete this.items[lookupid];
      this.length -= 1;
    }
  }

  dequeue() {
    let output = this.queue.shift();
    if (this.items[output.lookupid]) {
      delete this.items[output.lookupid];
    }
    return output;
  }
}

class GraphNode {
  constructor(contextid, x = false, y = false, r = false, text = "") {
    this.type = "node";
    this.children = [];
    this.edges = {};
    this.contextid = contextid;
    this.root = true;
    this.active = false;
    this.value = null;
    this.func = null;
    this.args = [];
    let time = new Date().getTime().toString();
    this.id = Number(time + Object.keys(this.getContext().objs).length + Math.floor(Math.random() * 9999));
    this.activeColor = "#aaa";
    this.image = null;

    if (x && y && r) {
      this.create(x, y, r, text);
    }
  }

  getContext() {
    return GraphSystem.contexts[this.contextid];
  }

  delete() {
    let context = this.getContext();
    for (let edge of Object.values(context.edges)) {
      if (edge.startNodeid === this.id || edge.endNodeid === this.id) {
        delete context.edges[edge.id];
      }
    }

    context.active = null;
    let temp_id = this.id;
    delete context.objs[this.id];

    for (let n of Object.values(context.objs)) {
      let position = n.children.indexOf(temp_id);
      if (position !== -1) {
        n.children.splice(position, 1);
      }
    }
  }

  getEdges() {
    return this.edges;
  }

  setColor(newColor) {
    this.color = newColor;
  }

  setActiveColor(newColor) {
    this.activeColor = newColor;
  }

  setText(text) {
    this.text = text;
  }

  create(x, y, r, text) {
    this.x = x;
    this.y = y;
    this.r = r;
    this.color = "#000";
    this.text_color = "#000";
    this.text = text;
    this.active = false;
    let context = this.getContext();
    context.objs[this.id] = this;
    this.build();
  }

  update() {
    this.build();
  }

  async setImage(url) {
    function createImage(url) {
      return new Promise(function (resolve, reject) {
        let img = new Image();
        img.onload = () => { resolve(img); };
        img.onerror = () => { console.log("image load error"); reject(); };
        img.src = url;
      });
    }
    this.image = await createImage(url);
  }

  build() {
    let context = this.getContext();
    if (this.active) {
      context.ctx.lineWidth = 10;
    } else {
      context.ctx.linewidth = 1;
    }
    context.ctx.strokeStyle = this.color;

    if (context.active == this) {
      context.ctx.strokeStyle = "#aaa";
    }
    if (this.func !== null) {
      this.text_color = "#FF0000";
    }
    context.ctx.textAlign = "center";
    context.ctx.font = "15px Arial";
    context.ctx.beginPath();
    context.ctx.arc(this.x, this.y, this.r, 0, 2 * Math.PI);
    context.ctx.closePath();
    context.ctx.stroke();

    if (this.image) {
      context.ctx.save();
      context.ctx.beginPath();
      context.ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2, true);
      context.ctx.closePath();
      context.ctx.clip();
      context.ctx.drawImage(this.image, this.x - this.r, this.y - this.r, this.r * 2, this.r * 2);
      context.ctx.beginPath();
      context.ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2, true);
      context.ctx.clip();
      context.ctx.closePath();
      context.ctx.restore();
    }
    let temp = context.ctx.fillStyle;
    context.ctx.fillStyle = this.text_color;
    context.ctx.fillText(this.text, this.x, this.y);
    context.ctx.fillStyle = temp;
  }

  connect(n, text = "", directional = false) {
    let context = this.getContext();
    if (n.type !== "node") {
      return false;
    }
    this.children.push(n.id);
    if (directional === false) {
      n.children.push(this.id);
    }
    let edge = new GraphEdge(context.id, this.id, n.id, "#000", text, directional);
    context.edges[edge.id] = edge;
    n.kill_root();
    return edge;
  }

  biDirectional(n, text = "") {
    return this.connect(n, text);
  }

  directional(n, text = "") {
    return this.connect(n, text, true);
  }

  kill_root() {
    this.root = false;
  }

  arrow(x2, y2, text) {
    let context = this.getContext();
    let xflip = 1;
    let yflip = 1;
    if (this.x >= x2) {
      yflip = -1;
      xflip = -1;
    }

    let slope = (y2 - this.y) / (x2 - this.x);
    if (slope === Infinity) {
      yflip *= -1;
    }
    if (slope === -Infinity) {
      yflip *= -1;
    }

    let xstart = this.x + xflip * Math.cos(Math.atan(slope)) * this.r;
    let ystart = this.y + yflip * Math.sin(Math.atan(slope)) * this.r;
    context.drawArrow(xstart, ystart, x2, y2, text);
  }

  inside(x, y, yoffset, xoffset) {
    function distance(x1, x2, y1, y2) {
      return Math.sqrt(Math.pow((x2 - x1), 2) + Math.pow((y2 - y1), 2));
    }

    if (yoffset == null) {
      yoffset = 0;
    }
    if (xoffset == null) {
      xoffset = 0;
    }
    if (distance(this.x + xoffset, x, this.y, y + yoffset) < this.r) {
      return true;
    } else {
      return false;
    }
  }
}

class GraphEdge {
  constructor(contextid, startNodeid, endNodeid, color = "#000", text = "", directional = false) {
    this.type = "edge";
    this.contextid = contextid;
    this.startNodeid = startNodeid;
    this.endNodeid = endNodeid;
    let id_time = new Date().getTime();
    this.id = Number(id_time.toString() + (Object.values(this.getContext().edges).length).toString() + Math.random().toString());
    this.slope;
    this.color = color;
    this.altColor = "#aaa";
    this.selected = false;
    this.text = text;
    this.isSelfLoop = false;
    this.weight = parseFloat(text);
    if (isNaN(this.weight)) {
      this.weight = 0;
    }
    this.directional = directional;
    let start = this.getContext().getNodeById(startNodeid);
    start.edges[this.id] = this.endNodeid;
    if (!this.directional) {
      let end = this.getContext().getNodeById(endNodeid);
      end.edges[this.id] = this.startNodeid;
    }
  }

  getContext() {
    return GraphSystem.contexts[this.contextid];
  }

  isDirectional() {
    if (this.directional === true) {
      return true;
    }
    return false;
  }

  setText(text) {
    this.text = text;
    this.weight = parseFloat(text) || 0;
  }

  toggleSelected() {
    if (this.selected) {
      this.selected = false;
    } else {
      this.selected = true;
    }
  }

  isBiDirectional() {
    if (this.directional === false) {
      return true;
    }
    return false;
  }

  setDirectional() {
    this.directional = true;
  }

  setUndirectional() {
    this.directional = false;
  }

  setWeight(weight) {
    this.weight = weight;
  }

  delete() {
    let context = this.getContext();
    let start = context.getNodeById(this.startNodeid);
    let end = context.getNodeById(this.endNodeid);
    delete start.edges[this.id];
    delete end.edges[this.id];
    for (let i = 0; i < start.children.length; i++) {
      if (start.children[i] === this.endNodeid) {
        start.children.splice(i, 1);
        break;
      }
    }
    if (this.isBiDirectional()) {
      for (let i = 0; i < end.children.length; i++) {
        if (end.children[i] === this.startNodeid) {
          end.children.splice(i, 1);
          break;
        }
      }
    }
    delete context.edges[this.id];
  }

  setColor(color) {
    this.color = color;
  }

  getStartid() {
    return this.startNodeid;
  }

  getEndid() {
    return this.endNodeid;
  }

  _updateValues(slope = null) {
    let context = this.getContext();
    let start = context.getNodeById(this.startNodeid);
    let end = context.getNodeById(this.endNodeid);

    if (slope === null) {
      this.slope = (end.y - start.y) / (end.x - start.x);
    } else {
      this.slope = slope;
    }

    let xflip = 1;
    let yflip = 1;
    if (start.x >= end.x) {
      yflip = -1;
      xflip = -1;
    }

    if (this.slope === Infinity) {
      yflip *= -1;
    }
    if (this.slope === -Infinity) {
      yflip *= -1;
    }

    let angleOffset = 0.0;
    let oppositeEdge = context.getEdge(this.endNodeid, this.startNodeid);
    if (this.isDirectional() && oppositeEdge) {
      angleOffset = 2 * Math.PI / 16;
    }

    this.xstart = start.x + xflip * (Math.cos(angleOffset + Math.atan(this.slope)) * start.r);
    this.ystart = start.y + yflip * (Math.sin(angleOffset + Math.atan(this.slope)) * start.r);
    this.xend = end.x - xflip * (Math.cos(-angleOffset + Math.atan(this.slope)) * end.r);
    this.yend = end.y - yflip * (Math.sin(-angleOffset + Math.atan(this.slope)) * end.r);
    if (isNaN(parseFloat(this.text))) {
      this.setWeight(0);
    } else {
      this.weight = parseFloat(this.text);
    }
  }

  getSelfLoopBezierControlPointsX() {
    let context = this.getContext();
    let node = context.getNodeById(this.startNodeid);
    let x = node.x + node.r / Math.sqrt(2);
    return [x, x + node.r * 2, x, x];
  }

  getSelfLoopBezierControlPointsY() {
    let context = this.getContext();
    let node = context.getNodeById(this.startNodeid);
    let y = node.y - node.r / Math.sqrt(2);
    return [y, y, y - node.r * 2, y];
  }

  draw() {
    this._updateValues();
    let context = this.getContext();
    let temp_color = context.ctx.strokeStyle;

    if (this.selected) {
      context.ctx.strokeStyle = this.altColor;
    } else {
      context.ctx.strokeStyle = this.color;
    }

    if (this.startNodeid == this.endNodeid) {
      let xs = this.getSelfLoopBezierControlPointsX();
      let ys = this.getSelfLoopBezierControlPointsY();
      context.drawLoop(xs, ys, this.text, this.directional);
    } else {
      context.drawArrow(this.xstart, this.ystart, this.xend, this.yend, this.text, this.directional);
    }
    context.ctx.strokeStyle = temp_color;
  }

  _pointDistance(x, y) {
    function sqr(x) { return x * x; }
    function dist2(v, w) { return sqr(v.x - w.x) + sqr(v.y - w.y); }
    function distToSegmentSquared(p, v, w) {
      var l2 = dist2(v, w);
      if (l2 == 0) return dist2(p, v);
      var t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
      t = Math.max(0, Math.min(1, t));
      return dist2(p, { x: v.x + t * (w.x - v.x), y: v.y + t * (w.y - v.y) });
    }
    function distToSegment(p, v, w) { return Math.sqrt(distToSegmentSquared(p, v, w)); }
    let p = { x: x, y: y };
    let v = { x: this.xstart, y: this.ystart };
    let w = { x: this.xend, y: this.yend };
    return distToSegment(p, v, w);
  }

  isOnSelfLoop(x, y) {
    function isBetween(x, a, b) {
      return a <= x && x <= b || b <= x && x <= a;
    }

    let xs = this.getSelfLoopBezierControlPointsX();
    let ys = this.getSelfLoopBezierControlPointsY();

    let midPointX = GraphSystem.calculateMidPointOfBezierCurve(xs);
    let midPointY = GraphSystem.calculateMidPointOfBezierCurve(ys);

    return isBetween(x, xs[0], midPointX) && isBetween(y, ys[0], midPointY);
  }

  inside(x, y, yoffset, xoffset, sensitivity = 3) {
    if (!yoffset) {
      yoffset = 0;
    }
    if (!xoffset) {
      xoffset = 0;
    }
    if (this.startNodeid == this.endNodeid) {
      if (this.isOnSelfLoop(x + xoffset, y + yoffset)) {
        return true;
      }
    } else {
      if (this._pointDistance(x + xoffset, y + yoffset) < sensitivity + 1) {
        return true;
      }
    }
    return false;
  }
}

export class GraphSystem {
  static contexts = {};

  constructor(canvas, ctx, options = {}) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.objs = {};
    this.edges = {};
    this.vars = {};
    let id_time = new Date().getTime().toString();
    let id_random = Math.round(Math.random() * 9999999).toString();
    this.id = Number(id_time + id_random);
    this.nodeCreatedCallback = () => { };
    this.connectionCreatedCallback = () => { };
    this.connectionSetupCallback = () => { };
    this.nodeSetupCallback = () => { };
    this.tickCallback = () => { };
    this.editable = options.editable !== false;
    this.fps = options.fps || 60;
    this.buildable = options.buildable !== false;
    this.connectionMode = "biDirectional";

    GraphSystem.contexts[this.id] = this;

    this.active = null;
    this.mouse = { x: 0, y: 0 };
    this.building = false;
    this.connecting = false;
    this.start = { x: null, y: null };

    this.setupEventListeners();
  }

  static calculateMidPointOfBezierCurve(controlPoints) {
    return controlPoints[0] * 1 / 8 + controlPoints[1] * 3 / 8 + controlPoints[2] * 3 / 8 + controlPoints[3] * 1 / 8;
  }

  setupEventListeners() {
    this.handleMouseMove = (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
      this.checkMouse(e.clientX, e.clientY);
    };

    this.handleMouseDown = (e) => {
      if (this.buildable) {
        this.clickDown(e);
      }
      if (this.editable) {
        this.startDragging(e);
      }
    };

    this.handleMouseUp = (e) => {
      if (this.buildable) {
        this.releaseClick(e);
      }
      if (this.editable) {
        this.endDragging(e);
      }
    };

    this.handleKeyDown = (e) => {
      if (this.buildable) {
        this.capture(e);
      }
    };

    this.handleContextMenu = (e) => {
      e.preventDefault();
    };

    window.addEventListener("mousemove", this.handleMouseMove);
    window.addEventListener("mousedown", this.handleMouseDown);
    window.addEventListener("mouseup", this.handleMouseUp);
    window.addEventListener("keydown", this.handleKeyDown);
    this.canvas.addEventListener("contextmenu", this.handleContextMenu);

    this.dragging = false;
    this.xdist = null;
    this.ydist = null;
    this.main_node = null;
  }

  checkMouse(x, y) {
    let rect = this.canvas.getBoundingClientRect();
    let mousex = x - rect.left;
    let mousey = y - rect.top;

    let nodes = Object.values(this.objs);
    for (let i = 0; i < nodes.length; i++) {
      if (nodes[i].inside(mousex, mousey)) {
        document.body.style.cursor = "pointer";
        this.active = nodes[i];
        return;
      }
    }

    for (let edge of Object.values(this.edges)) {
      if (edge.inside(mousex, mousey)) {
        document.body.style.cursor = "pointer";
        this.active = edge;
        edge.selected = true;
        return;
      } else {
        if (edge.selected) {
          edge.selected = false;
        }
      }
    }

    document.body.style.cursor = "default";
    this.active = null;
  }

  clickDown(e) {
    let rect = this.canvas.getBoundingClientRect();
    let mousex = e.clientX - rect.left;
    let mousey = e.clientY - rect.top;

    if (e.which == 2) {
      return "";
    }
    if (e.which == 1) {
      if (this.active == null) {
        this.building = true;
        this.building_start = [mousex, mousey];
      }
    }
    if (e.which == 3) {
      this.start = { x: null, y: null };
      this.start = { x: mousex, y: mousey, active: this.active };

      if (this.active != null && this.active.type === "node") {
        this.connecting = false;
        this.start.action = "connect";
        this.start.start_node = this.active;
        this.connecting = true;
      } else {
        this.connecting = false;
      }
    }
  }

  releaseClick(e) {
    let rect = this.canvas.getBoundingClientRect();
    let mousex = e.clientX - rect.left;
    let mousey = e.clientY - rect.top;

    if (e.which == 2) {
      return "";
    }
    if (e.which == 1) {
      if (this.building) {
        let x_dist = Math.pow(((mousex) - this.building_start[0]), 2);
        let y_dist = Math.pow(((mousey) - this.building_start[1]), 2);
        let dist = Math.sqrt(x_dist + y_dist);
        let newNode = this.node(this.building_start[0], this.building_start[1], dist, "");
        this.nodeCreatedCallback(newNode);
        this.building = false;
      }
    }
    if (e.which == 3) {
      if (this.active != null && this.start.start_node) {
        let existingEdge = this.getEdge(this.start.start_node.id, this.active.id);
        if (!existingEdge) {
          let newEdge = null;
          if (this.connectionMode === "biDirectional") {
            newEdge = this.start.start_node.connect(this.active);
          } else if (this.connectionMode === "directional") {
            newEdge = this.start.start_node.connect(this.active, "", true);
          }
          if (newEdge) {
            this.connectionCreatedCallback(newEdge);
          }
        }
      }
      this.connecting = false;
      this.start = { x: null, y: null };
    }
  }

  capture(e) {
    let letters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890!@#$%^&*()_+~\\/?<>'\".,;:~`[]{}|-= ";
    if (this.active != null) {
      if (letters.indexOf(e.key) > -1) {
        e.output = e.key;
      }
      if (e.key == "Delete") {
        this.active.delete();
      }
      if (e.key === " ") {
        e.preventDefault();
      }
      if (e.key == "Backspace") {
        e.preventDefault();
        this.active.setText(this.active.text.substring(0, this.active.text.length - 1));
        e.output = "";
      }
      if (e.output) {
        this.active.text += e.output;
      }
    }
  }

  startDragging(e) {
    if (e.which == 2 || e.which == 3) {
      return "";
    }
    if (this.active) {
      let rect = this.canvas.getBoundingClientRect();
      let mousex = e.clientX - rect.left;
      let mousey = e.clientY - rect.top;
      this.xdist = this.active.x - mousex;
      this.ydist = this.active.y - mousey;
      this.main_node = this.active;
      this.dragging = true;
    }
  }

  endDragging(e) {
    if (e.which == 2 || e.which == 3) {
      return "";
    }
    this.dragging = false;
  }

  setNodeCreatedCallback(func) {
    this.nodeCreatedCallback = func;
  }

  setConnectionCreatedCallback(func) {
    this.connectionCreatedCallback = func;
  }

  setTickCallback(func) {
    this.tickCallback = func;
  }

  setNodeSetupCallback(func) {
    this.nodeSetupCallback = func;
  }

  setConnectionSetupCallback(func) {
    this.connectionSetupCallback = func;
  }

  getChildrenByText(text) {
    return Object.values(this.objs).filter((node) => node.text === text);
  }

  getEdge(parentid, childid) {
    for (let edge of Object.values(this.edges)) {
      if (edge.startNodeid === parentid && edge.endNodeid === childid) {
        return this.edges[edge.id];
      }
      if (edge.isBiDirectional()) {
        if (edge.endNodeid === parentid && edge.startNodeid === childid) {
          return this.edges[edge.id];
        }
      }
    }
    return false;
  }

  drawLoop(bezierControlPointsX, bezierControlPointsY, text = "", directional = false) {
    this.ctx.beginPath();
    this.addBezierCurveToPath(bezierControlPointsX, bezierControlPointsY);
    this.ctx.closePath();
    this.ctx.stroke();

    if (text !== null && text !== "") {
      let midPointX = GraphSystem.calculateMidPointOfBezierCurve(bezierControlPointsX);
      let midPointY = GraphSystem.calculateMidPointOfBezierCurve(bezierControlPointsY);
      this.addTextOverClearBox(midPointX, midPointY, text);
    }
  }

  addTextOverClearBox(centerX, centerY, text) {
    let textLength = this.ctx.measureText(text).width;
    let textHeight = this.ctx.measureText("M").width;
    this.ctx.clearRect(centerX - (textLength / 2) - 4, centerY - (textHeight / 2) - 8, (textLength) + 4, (textHeight) + 8);
    this.ctx.fillText(text, centerX - 2, centerY + 4);
  }

  addBezierCurveToPath(xs, ys) {
    this.ctx.moveTo(xs[0], ys[0]);
    this.ctx.bezierCurveTo(xs[1], ys[1], xs[2], ys[2], xs[3], ys[3]);
  }

  drawArrow(x1, y1, x2, y2, text = "", directional = false) {
    let headlen = 0;
    if (directional) {
      headlen = 10;
    }

    let angle = Math.atan2(y2 - y1, x2 - x1);

    if (text === null || text === "") {
      this.ctx.beginPath();
      this.ctx.moveTo(x1, y1);
      this.ctx.lineTo(x2, y2);
      this.ctx.lineTo(x2 - headlen * Math.cos(angle - Math.PI / 6), y2 - headlen * Math.sin(angle - Math.PI / 6));
      this.ctx.moveTo(x2, y2);
      this.ctx.lineTo(x2 - headlen * Math.cos(angle + Math.PI / 6), y2 - headlen * Math.sin(angle + Math.PI / 6));
      this.ctx.closePath();
      this.ctx.stroke();
    } else {
      let midPointX = (x1 + x2) / 2;
      let midPointY = (y1 + y2) / 2;
      this.ctx.beginPath();
      this.ctx.moveTo(x1, y1);
      this.ctx.lineTo(midPointX, midPointY);
      this.ctx.moveTo(midPointX, midPointY);
      this.ctx.lineTo(x2, y2);
      this.ctx.lineTo(x2 - headlen * Math.cos(angle - Math.PI / 6), y2 - headlen * Math.sin(angle - Math.PI / 6));
      this.ctx.moveTo(x2, y2);
      this.ctx.lineTo(x2 - headlen * Math.cos(angle + Math.PI / 6), y2 - headlen * Math.sin(angle + Math.PI / 6));
      this.ctx.closePath();
      this.ctx.stroke();
      this.addTextOverClearBox(midPointX, midPointY, text);
    }
  }

  getConnectionMode() {
    return this.connectionMode;
  }

  setDirectional() {
    this.connectionMode = "directional";
  }

  setBiDirectional() {
    this.connectionMode = "biDirectional";
  }

  update() {
    if (this.dragging && this.main_node) {
      let rect = this.canvas.getBoundingClientRect();
      let mousex = this.mouse.x - rect.left;
      let mousey = this.mouse.y - rect.top;
      this.main_node.x = mousex + this.xdist;
      this.main_node.y = mousey + this.ydist;
    }

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    let nodes = Object.values(this.objs);
    nodes.map(node => node.update());
    this.drawEdges();

    if (this.connecting && this.start.start_node) {
      let rect = this.canvas.getBoundingClientRect();
      let mousex = this.mouse.x - rect.left;
      let mousey = this.mouse.y - rect.top;
      this.start.start_node.arrow(mousex, mousey);
    }

    if (this.building) {
      this.ctx.strokeStyle = "#000";
      this.ctx.beginPath();
      let rect = this.canvas.getBoundingClientRect();
      let mousex = this.mouse.x - rect.left;
      let mousey = this.mouse.y - rect.top;
      let x_dist = Math.pow((mousex - this.building_start[0]), 2);
      let y_dist = Math.pow((mousey - this.building_start[1]), 2);
      let dist = Math.sqrt(x_dist + y_dist);
      this.ctx.arc(this.building_start[0], this.building_start[1], dist, 0, 2 * Math.PI);
      this.ctx.closePath();
      this.ctx.stroke();
    }

    this.tickCallback(this);
  }

  draw(ctx) {
    this.update();
  }

  getNodeById(id) {
    return this.objs[id];
  }

  getEdgeById(id) {
    return this.edges[id];
  }

  drawEdges() {
    for (let edge of Object.values(this.edges)) {
      this.ctx.strokeStyle = this.color;
      edge.draw();
    }
  }

  getDistance(startNodeId, endNodeId) {
    let start = this.getNodeById(startNodeId);
    let end = this.getNodeById(endNodeId);
    return Math.sqrt(Math.pow(end.y - start.y, 2) + Math.pow(end.x - start.x, 2));
  }

  node(x = false, y = false, r = false, text = "") {
    let node = new GraphNode(this.id, x, y, r, text);
    this.nodeSetupCallback(node);
    return node;
  }

  async breadthFirstSearch(startid, endid, draw_path = true, delay = 0) {
    let start = this.getNodeById(startid);
    let end = this.getNodeById(endid);
    let discovered = [{ node: startid, parent: startid }];
    let visited = {};

    const getPath = (nodeobj, draw_path = true) => {
      let path = [];
      while (nodeobj.node !== nodeobj.parent) {
        if (draw_path) {
          this.getEdge(nodeobj.parent, nodeobj.node).setColor("red");
        }
        path.unshift(nodeobj.node);
        nodeobj = visited[nodeobj.parent];
      }
      return path;
    };

    for (let i = 0; i < discovered.length; i++) {
      if (visited.hasOwnProperty(discovered[i].node)) {
        continue;
      }
      if (discovered[i].node === endid) {
        return getPath(discovered[i], draw_path);
      } else {
        let currentNode = this.getNodeById(discovered[i].node);
        let childrenObjs = currentNode.children.map((nodeid) => {
          return { node: nodeid, parent: discovered[i].node };
        });
        discovered.push(...childrenObjs);
        visited[discovered[i].node] = discovered[i];
      }
    }
  }

  async Astar(startid, endid, draw_path = true, delay = 0) {
    let start = this.getNodeById(startid);
    let end = this.getNodeById(endid);
    let visited = {};
    let discovered = new PriorityQueue();

    function dataCard(nodeid, viaid, cost, distance) {
      this.nodeid = nodeid;
      this.cost = cost;
      this.viaid = viaid;
      this.distance = distance;
    }

    const evaluateNode = (nodeid, cost) => {
      if (visited[nodeid] !== undefined) {
        return;
      }
      let root = this.getNodeById(nodeid);
      for (let i = 0; i < root.children.length; i++) {
        let node = this.getNodeById(root.children[i]);
        if (visited[node.id] !== undefined) {
          continue;
        }
        let edge = this.getEdge(root.id, node.id);
        let weight = edge.weight;
        let card = new dataCard(node.id, root.id, cost + weight, Math.floor(this.getDistance(root.id, end.id)) - 1);
        let key = node.id;

        if (discovered.hasItem(key)) {
          let oldItem = discovered.getItemByKey(key);
          if (oldItem.item.cost > card.cost) {
            discovered.replace(card, card.cost, key);
          }
        } else {
          discovered.insert(card, card.cost + card.distance, key);
        }
      }
    };

    discovered.insert(new dataCard(startid, startid, 0), 0);

    while (discovered.queue.length > 0) {
      let current_node = discovered.dequeue();
      if (current_node.item.nodeid === endid) {
        let output = { cost: current_node.item.cost, path: [] };
        output.path.unshift(current_node.item.nodeid);
        while (current_node.item.nodeid !== startid) {
          current_node = visited[current_node.item.viaid];
          output.path.unshift(current_node.item.nodeid);
        }
        if (draw_path) {
          for (let i = 0; i < output.path.length - 1; i++) {
            this.getEdge(output.path[i], output.path[i + 1]).setColor("red");
          }
        }
        return output;
      }
      let nodeid = current_node.item.nodeid;
      evaluateNode(current_node.item.nodeid, current_node.item.cost);
      visited[nodeid] = current_node;
    }
  }

  async dijkstra(startid, endid, draw_path = true) {
    let start = this.getNodeById(startid);
    let end = this.getNodeById(endid);
    let visited = {};
    let discovered = new PriorityQueue();

    function dataCard(nodeid, viaid, cost) {
      this.nodeid = nodeid;
      this.cost = cost;
      this.viaid = viaid;
    }

    const evaluateNode = (nodeid, cost) => {
      if (visited[nodeid] !== undefined) {
        return;
      }
      let root = this.getNodeById(nodeid);
      for (let i = 0; i < root.children.length; i++) {
        let node = this.getNodeById(root.children[i]);
        if (visited[node.id] !== undefined) {
          continue;
        }
        let edge = this.getEdge(root.id, node.id);
        let weight = edge.weight;
        let card = new dataCard(node.id, root.id, cost + weight);
        let key = node.id;

        if (discovered.hasItem(key)) {
          let oldItem = discovered.getItemByKey(key);
          if (oldItem.item.cost > card.cost) {
            discovered.replace(card, card.cost, key);
          }
        } else {
          discovered.insert(card, card.cost, key);
        }
      }
    };

    discovered.insert(new dataCard(startid, startid, 0), 0);

    while (discovered.queue.length > 0) {
      let current_node = discovered.dequeue();
      if (current_node.item.nodeid === endid) {
        let output = { cost: current_node.item.cost, path: [] };
        output.path.unshift(current_node.item.nodeid);
        while (current_node.item.nodeid !== startid) {
          current_node = visited[current_node.item.viaid];
          output.path.unshift(current_node.item.nodeid);
        }
        if (draw_path) {
          for (let i = 0; i < output.path.length - 1; i++) {
            this.getEdge(output.path[i], output.path[i + 1]).setColor("red");
          }
        }
        return output;
      }
      let nodeid = current_node.item.nodeid;
      evaluateNode(current_node.item.nodeid, current_node.item.cost);
      visited[nodeid] = current_node;
    }
  }

  resize(canvas) {
    this.canvas = canvas;
  }

  destroy() {
    window.removeEventListener("mousemove", this.handleMouseMove);
    window.removeEventListener("mousedown", this.handleMouseDown);
    window.removeEventListener("mouseup", this.handleMouseUp);
    window.removeEventListener("keydown", this.handleKeyDown);
    this.canvas.removeEventListener("contextmenu", this.handleContextMenu);
    delete GraphSystem.contexts[this.id];
  }
}
