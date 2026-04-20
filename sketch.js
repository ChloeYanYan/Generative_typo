let font;
let points = [];
let inputText = "Type Something...";
let currentLayer = 0;

function preload() {
  font = loadFont("fonts/Roboto-Regular.ttf");
}

function setup() {
  let canvas = createCanvas(800, 400);
  canvas.parent("canvas-container");

  stroke(color(0, 15, 255));
  noFill();

  // Text input
  document.getElementById("text-input").addEventListener("input", () => {
    inputText = document.getElementById("text-input").value;
    generatePoints();
  });

  // Sliders
  document.getElementById("slider-layers").addEventListener("input", () => {
    document.getElementById("val-layers").textContent =
      document.getElementById("slider-layers").value;
    triggerRegenerate();
  });

  document.getElementById("slider-r").addEventListener("input", () => {
    document.getElementById("val-r").textContent =
      document.getElementById("slider-r").value;
    triggerRegenerate();
  });

  document.getElementById("slider-threshold").addEventListener("input", () => {
    document.getElementById("val-threshold").textContent =
      document.getElementById("slider-threshold").value;
    triggerRegenerate();
  });

  document.getElementById("slider-fontsize").addEventListener("input", () => {
    document.getElementById("val-fontsize").textContent =
      document.getElementById("slider-fontsize").value;
    triggerRegenerate();
  });

  document.getElementById("slider-spacing").addEventListener("input", () => {
    document.getElementById("val-spacing").textContent =
      document.getElementById("slider-spacing").value;
    triggerRegenerate();
  });

  // Presets
  document
    .getElementById("preset-clean")
    .addEventListener("click", () => applyPreset("clean"));
  document
    .getElementById("preset-sketch")
    .addEventListener("click", () => applyPreset("sketch"));
  document
    .getElementById("preset-chaotic")
    .addEventListener("click", () => applyPreset("chaotic"));
  document
    .getElementById("preset-example")
    .addEventListener("click", loadExample);

  // Color pickers
  document
    .getElementById("color-text")
    .addEventListener("input", triggerRegenerate);
  document
    .getElementById("color-bg")
    .addEventListener("input", triggerRegenerate);

  // Actions
  document.getElementById("btn-randomize").addEventListener("click", randomize);
  document
    .getElementById("btn-export-png")
    .addEventListener("click", exportPNG);
  document
    .getElementById("btn-export-svg")
    .addEventListener("click", exportSVG);

  generatePoints();
}

function draw() {
  let layers = parseInt(document.getElementById("slider-layers").value);
  let rMax = parseInt(document.getElementById("slider-r").value);
  stroke(document.getElementById("color-text").value);

  if (currentLayer < layers) {
    for (let letterPoints of points) {
      beginShape();
      for (let pt of letterPoints) {
        let angle =
          noise(pt.x * 0.01 + currentLayer, pt.y * 0.01 + currentLayer) *
          TWO_PI *
          2;
        let r = random(1, rMax);
        let x = pt.x + cos(angle) * r;
        let y = pt.y + sin(angle) * r;
        curveVertex(x, y);
      }
      endShape();
    }
    currentLayer++;
  } else {
    noLoop();
  }
}

function triggerRegenerate() {
  generatePoints();
}

function generatePoints() {
  randomSeed(42);
  noiseSeed(42);
  currentLayer = 0;
  points = [];

  let lines = inputText.split("\n");
  let fontSize = parseInt(document.getElementById("slider-fontsize").value);
  let letterSpacing = parseInt(document.getElementById("slider-spacing").value);
  let topPadding = 20;
  let lineSpacing = fontSize * 1.4;
  let totalHeight = topPadding + lines.length * lineSpacing;

  let maxLineWidth = 0;
  for (let line of lines) {
    let x = 50;
    for (let i = 0; i < line.length; i++) {
      const bounds = font.textBounds(line[i], x, 0, fontSize);
      x += bounds.w + letterSpacing;
    }
    if (x > maxLineWidth) maxLineWidth = x;
  }

  const container = document.getElementById("canvas-container");
  const containerW = container.clientWidth;
  const containerH = container.clientHeight;
  resizeCanvas(
    max(maxLineWidth + 100, containerW),
    max(totalHeight, containerH),
  );
  background(document.getElementById("color-bg").value);

  let threshold = parseFloat(document.getElementById("slider-threshold").value);

  for (let j = 0; j < lines.length; j++) {
    let x = 50;
    let y = topPadding + fontSize + j * lineSpacing;
    for (let i = 0; i < lines[j].length; i++) {
      const letter = lines[j][i];
      const pts = font.textToPoints(letter, x, y, fontSize, {
        sampleFactor: 0.25,
        simplifyThreshold: threshold,
      });
      points.push(pts);
      const bounds = font.textBounds(letter, x, y, fontSize);
      x += bounds.w + letterSpacing;
    }
  }

  loop();
}

// ── Presets ──────────────────────────────────────────────────────────────────

function applyPreset(name) {
  const presets = {
    clean: { layers: 2, r: 1, threshold: 0 },
    sketch: { layers: 15, r: 5, threshold: 0.5 },
    chaotic: { layers: 40, r: 15, threshold: 1.5 },
  };
  const p = presets[name];
  setSlider("slider-layers", "val-layers", p.layers);
  setSlider("slider-r", "val-r", p.r);
  setSlider("slider-threshold", "val-threshold", p.threshold);
  triggerRegenerate();
}

function loadExample() {
  const poem = `Your Best
Into this world I came,
A soul tenderly ablaze.
You wrapped your arms around me,
And sheltered me from rain.

Through all the love, fights, and tears,
You were a constant through the years.
You were called away today,
Time to take your rest.

I just wanted to say to you:
I love you,
I'll always be
Your Best.`;
  document.getElementById("text-input").value = poem;
  inputText = poem;
  generatePoints();
}

function setSlider(sliderId, valId, value) {
  document.getElementById(sliderId).value = value;
  document.getElementById(valId).textContent = value;
}

// ── Randomize ─────────────────────────────────────────────────────────────────

function randomize() {
  setSlider("slider-layers", "val-layers", Math.floor(Math.random() * 50) + 1);
  setSlider("slider-r", "val-r", Math.floor(Math.random() * 20) + 1);
  setSlider(
    "slider-threshold",
    "val-threshold",
    (Math.random() * 1.5).toFixed(1),
  );
  triggerRegenerate();
}

// ── Export PNG ────────────────────────────────────────────────────────────────

function exportPNG() {
  saveCanvas("generative-type", "png");
}

// ── Export SVG ────────────────────────────────────────────────────────────────

function exportSVG() {
  const layers = parseInt(document.getElementById("slider-layers").value);
  const rMax = parseInt(document.getElementById("slider-r").value);
  const cvs = document.querySelector("#canvas-container canvas");
  const w = cvs.width;
  const h = cvs.height;

  // Use same seeds so SVG matches canvas output
  randomSeed(42);
  noiseSeed(42);

  let paths = [];

  for (let layer = 0; layer < layers; layer++) {
    for (let letterPoints of points) {
      if (letterPoints.length === 0) continue;
      let d = "";
      let first = true;
      for (let pt of letterPoints) {
        let angle =
          noise(pt.x * 0.01 + layer, pt.y * 0.01 + layer) * TWO_PI * 2;
        let r = random(1, rMax);
        let x = (pt.x + cos(angle) * r).toFixed(2);
        let y = (pt.y + sin(angle) * r).toFixed(2);
        d += first ? `M ${x} ${y}` : ` L ${x} ${y}`;
        first = false;
      }
      paths.push(
        `<path d="${d} Z" stroke="${textColor}" fill="none" stroke-width="1"/>`,
      );
    }
  }

  const textColor = document.getElementById("color-text").value;
  const bgColor = document.getElementById("color-bg").value;

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <rect width="${w}" height="${h}" fill="${bgColor}"/>
  ${paths.join("\n  ")}
</svg>`;

  const blob = new Blob([svg], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "generative-type.svg";
  a.click();
  URL.revokeObjectURL(url);
}
