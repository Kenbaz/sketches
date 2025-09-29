import canvasSketch from "canvas-sketch";
import random from "canvas-sketch-util/random";
import math from "canvas-sketch-util/math";
import { GUI } from "dat.gui";

const settings = {
  dimensions: [1080, 1080],
  animate: true,
};

const params = {
  cols: 10,
  rows: 10,
  scaleMin: 1,
  scaleMax: 30,
  freq: 0.001,
  amp: 0.2,
  frame: 0,
  animate: true,
  lineCap: 'butt',
};

const sketch = () => {
  return ({ context, width, height, frame }) => {
    context.fillStyle = "white";
    context.fillRect(0, 0, width, height);

    const cols = params.cols;
    const rows = params.rows;
    const numCells = cols * rows;

    const gridW = width * 0.8;
    const gridH = height * 0.8;
    const cellw = gridW / cols;
    const cellh = gridH / rows;
    const marginX = (width - gridW) * 0.5;
    const marginY = (height - gridH) * 0.5;

    for (let i = 0; i < numCells; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);

      const x = col * cellw;
      const y = row * cellh;
      const w = cellw * 0.8;
      const h = cellh * 0.8;

      const f = params.animate ? frame : params.frame;

      // const n = random.noise2D(x + frame * 10, y, params.freq);
      const n = random.noise3D(x, y, f * 10, params.freq);
      const angle = n * Math.PI * params.amp;
      const scale = math.mapRange(n, -1, 1, params.scaleMin, params.scaleMax);

      context.save();
      context.translate(x, y);
      context.translate(marginX, marginY);
      context.translate(cellw * 0.5, cellh * 0.5);
      context.rotate(angle);

      context.lineWidth = scale;
      context.lineCap = params.lineCap;

      context.beginPath();
      context.moveTo(w * -0.5, 0);
      context.lineTo(w * 0.5, 0);
      context.stroke();

      context.restore();
    }
  };
};

const createPane = () => {
  const gui = new GUI();
  const folder = gui.addFolder("Grid");
  folder.add(params, "lineCap", ["butt", "round", "square"]).onChange(() => {
    context.lineCap = params.lineCap;
  });
  folder.add(params, "cols", 1, 30).step(1);
  folder.add(params, "rows", 1, 30).step(1);
  folder.add(params, "scaleMin", 1, 100);
  folder.add(params, "scaleMax", 1, 100);
  folder.open();

  const folder2 = gui.addFolder("Noise");
  folder2.add(params, "freq", -0.01, 0.01);
  folder2.add(params, "amp", 0, 1);
  folder2.add(params, "animate");
  folder2.add(params, "frame", 0, 999);
  folder2.open();
};

createPane();
canvasSketch(sketch, settings);
