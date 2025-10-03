const canvasSketch = require('canvas-sketch');
import { math } from 'canvas-sketch-util';
import { random } from 'canvas-sketch-util';
const eases = require('eases');

const settings = {
  dimensions: [1080, 1080],
  animate: true
};

let audio;
let audioContext, audioData, sourceNode, analyserNode;
let manager;
let minDb, maxDb;

const sketch = () => {
  const numCircles = 5;
  const numSlices = 9;
  const slice = Math.PI * 2 / numSlices;
  const radius = 200;

  const bins = [4, 12, 37];
  const lineWidths = [];

  let lineWidth, bin, mapped;

  for (let i = 0; i < numCircles * numSlices; i++) { 
    bin = random.rangeFloor(4, 64);
    if (random.value() < 0.5) bin = 0;
    bins.push(bin);
  }

  for (let i = 0; i < numCircles; i++) { 
    const t = i / (numCircles - 1);
    lineWidth = eases.quadIn(t) * 200 + 20;
    lineWidths.push(lineWidth);
  }

  return ({ context, width, height }) => {
    context.fillStyle = '#EEEAE0';
    context.fillRect(0, 0, width, height);

    if (!audioContext) return;

    analyserNode.getFloatFrequencyData(audioData);
    context.save();
    context.translate(width * 0.5, height * 0.5);

    let cradius = radius;

    for (let i = 0; i < numCircles; i++) { 
      context.save();

      for (let j = 0; j < numSlices; j++) { 
        context.rotate(slice);
        context.lineWidth = lineWidths[i];

        bin = bins[i * numSlices + j];
        if (!bin) continue;

        mapped = math.mapRange(audioData[bin], minDb, maxDb, 0, 1, true);

        lineWidth = lineWidths[i] * mapped;
        if (lineWidth < 1) continue;

        context.lineWidth = lineWidth;

        context.beginPath();
        context.arc(0, 0, cradius + context.lineWidth * 0.5, 0, slice);
        context.stroke();
      }

      cradius += lineWidths[i];

      context.restore();
    };

    context.restore();
  };
};

const addListeners = () => {
  window.addEventListener('mouseup', () => {
    if (!audioContext) createAudio();

    if (audio.paused) {
      audio.play();
      manager.play();
    }
    else {
      audio.pause();
      manager.pause();
    };
  })
};

const createAudio = () => {
  audio = document.createElement("audio");
  audio.src = "audio/Ikoliks - Big City Lights.mp3";

  audioContext = new AudioContext();

  sourceNode = audioContext.createMediaElementSource(audio);
  sourceNode.connect(audioContext.destination);

  analyserNode = audioContext.createAnalyser();
  analyserNode.fftSize = 512;
  analyserNode.smoothingTimeConstant = 0.9;
  sourceNode.connect(analyserNode);

  minDb = analyserNode.minDecibels;
  maxDb = analyserNode.maxDecibels;

  audioData = new Float32Array(analyserNode.frequencyBinCount);
};

const getValues = (data) => {
  let sum = 0;
  for (let i = 0; i < data.length; i++) {
    sum += data[i];
  }
  return sum / data.length;
};

const start = async () => {
  addListeners();
  manager = await canvasSketch(sketch, settings);
  manager.pause();
};

start();


// const canvasSketch = require('canvas-sketch');
// import { random } from 'canvas-sketch-util';
// import { math } from 'canvas-sketch-util';
// const eases = require('eases');
// const colormap = require('colormap');

// const settings = {
//   dimensions: [1080, 1080],
//   animate: true
// };

// const particles = [];
// const cursor = { x: 9999, y: 9999 };

// const colors = colormap({
//   colormap: 'viridis',
//   nshades: 20,
// });

// let elCanvas;
// let imgA;

// const sketch = ({ width, height, canvas }) => {
//   let x, y, particle, radius;
  
//   const imgACanvas = document.createElement('canvas');
//   const imgAContext = imgACanvas.getContext('2d');

//   imgACanvas.width = imgA.width;
//   imgACanvas.height = imgA.height;
//   imgAContext.drawImage(imgA, 0, 0);

//   const imgAData = imgAContext.getImageData(0, 0, imgACanvas.width, imgACanvas.height).data;

//   const numCircles = 30;
//   const gapCircle = 2;
//   let dotRadius = 12;
//   const gapDot = 2;
//   let cirRadius = 0;
//   const fitRadius = dotRadius;

//   elCanvas = canvas;
//   canvas.addEventListener('mousedown', onMouseDown);

//   for (let i = 0; i < numCircles; i++) { 
//     const circumference = Math.PI * 2 * cirRadius;
//     const numFit = i ? Math.floor(circumference / (fitRadius * 2 + gapDot)) : 1;
//     const fitSlice = Math.PI * 2 / numFit;
//     let ix, iy, idx, r, g, b, colA; 

//     for (let j = 0; j < numFit; j++) { 
//       const theta = fitSlice * j;

//       x = Math.cos(theta) * cirRadius;
//       y = Math.sin(theta) * cirRadius;

//       x += width * 0.5;
//       y += height * 0.5;

//       ix = Math.floor(x / width * imgA.width);
//       iy = Math.floor(y / height * imgA.height);
//       idx = (iy * imgA.width + ix) * 4;

//       r = imgAData[idx + 0];
//       g = imgAData[idx + 1];
//       b = imgAData[idx + 2];

//       colA = `rgb(${r}, ${g}, ${b})`;

//       // radius = dotRadius;
//       radius = math.mapRange(r, 0, 255, 1, 12);

//       particle = new Particles({ x, y, radius, colA });
//       particles.push(particle);
//     }
//     cirRadius += fitRadius * 2 + gapCircle;
//     dotRadius = (1 - eases.quadOut(i / numCircles)) * fitRadius;
//   }

//   return ({ context, width, height }) => {
//     context.fillStyle = 'black';
//     context.fillRect(0, 0, width, height);

//     context.drawImage(imgACanvas, 0, 0);

//     particles.sort((a, b) => a.scale - b.scale);

//     particles.forEach(p => {
//       p.update();
//       p.draw(context);
//     });
//   };
// };

// const onMouseDown = (e) => {
//   window.addEventListener('mousemove', onMouseMove);
//   window.addEventListener('mouseup', onMouseUp);

//   onMouseMove(e);
// };

// const onMouseMove = (e) => {
//   const x = (e.offsetX / elCanvas.offsetWidth) * elCanvas.width;
//   const y = (e.offsetY / elCanvas.offsetHeight) * elCanvas.height;

//   cursor.x = x;
//   cursor.y = y;
// };

// const onMouseUp = (e) => {
//   window.removeEventListener("mousemove", onMouseMove);
//   window.removeEventListener("mouseup", onMouseUp);

//   cursor.x = 9999;
//   cursor.y = 9999;
// };

// const loadImage = async (url) => {
//   return new Promise((resolve, reject) => {
//     const img = new Image();
//     img.onload = () => resolve(img);
//     img.onerror = () => reject();
//     img.src = url;
//   });
// };

// const start = async () => {
//   imgA = await loadImage("images/AI-img.JPG");
//   canvasSketch(sketch, settings);
// };

// start();

// class Particles {
//   constructor({ x, y, radius = 10, colA }) {
//     //position
//     this.x = x;
//     this.y = y;

//     //acceleration
//     this.ax = 0;
//     this.ay = 0;

//     //velocity
//     this.vx = 0;
//     this.vy = 0;

//     //initial position
//     this.ix = x;
//     this.iy = y;

//     this.radius = radius;
//     this.scale = 1;
//     this.color = colA;

//     this.minDist = random.range(100, 200);
//     this.pushFactor = random.range(0.01, 0.02);
//     this.pullFactor = random.range(0.002, 0.006);
//     this.dampFactor = random.range(0.90, 0.95);
//   }

//   update() {
//     let dx, dy, dd, distDelta;
//     let idxColor;

//     //pull force
//     dx = this.ix - this.x;
//     dy = this.iy - this.y;
//     dd = Math.sqrt(dx * dx + dy * dy);

//     this.ax = dx * this.pullFactor;
//     this.ay = dy * this.pullFactor;

//     this.scale = math.mapRange(dd, 0, 200, 1, 5);

//     // idxColor = Math.floor(math.mapRange(dd, 0, 200, 0, colors.length - 1, true));
//     // this.color = colors[idxColor];

//     //push force
//     dx = this.x - cursor.x;
//     dy = this.y - cursor.y;
//     dd = Math.sqrt(dx * dx + dy * dy);

//     distDelta = this.minDist - dd;
    
//     if (dd < this.minDist) { 
//       this.ax += (dx / dd) * distDelta + this.pushFactor;
//       this.ay += (dy / dd) * distDelta + this.pushFactor;
//     }

//     this.vx += this.ax;
//     this.vy += this.ay;

//     this.vx *= this.dampFactor;
//     this.vy *= this.dampFactor;

//     this.x += this.vx;
//     this.y += this.vy;
//   }

//   draw(context) { 
//     context.save();

//     context.translate(this.x, this.y);
//     context.fillStyle = this.color;

//     context.beginPath();
//     context.arc(0, 0, this.radius * this.scale, 0, Math.PI * 2);
//     context.fill();

//     context.restore();
//   }
// }
