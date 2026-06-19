const pptxgen = require("pptxgenjs");

function createSlide(pres, theme) {
  const slide = pres.addSlide();

  // Full dark background
  slide.background = { color: theme.bg };

  // Left accent bar
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0, y: 0, w: 0.12, h: 5.625,
    fill: { color: theme.accent }
  });

  // Decorative circle (top right)
  slide.addShape(pres.shapes.OVAL, {
    x: 7.8, y: -0.8, w: 3.5, h: 3.5,
    fill: { color: theme.light, transparency: 70 }
  });

  // Small accent circle
  slide.addShape(pres.shapes.OVAL, {
    x: 8.8, y: 3.8, w: 1.0, h: 1.0,
    fill: { color: theme.accent, transparency: 50 }
  });

  // Main title
  slide.addText("Artificial Intelligence", {
    x: 0.5, y: 1.5, w: 7.5, h: 1.2,
    fontSize: 52, fontFace: "Arial",
    color: theme.primary, bold: true,
    margin: 0
  });

  // Subtitle
  slide.addText("Shaping the Future", {
    x: 0.5, y: 2.7, w: 7.5, h: 0.7,
    fontSize: 28, fontFace: "Arial",
    color: theme.accent,
    margin: 0
  });

  // Thin divider line
  slide.addShape(pres.shapes.LINE, {
    x: 0.5, y: 3.55, w: 4.5, h: 0,
    line: { color: theme.secondary, width: 1 }
  });

  // Date
  slide.addText("2026", {
    x: 0.5, y: 3.7, w: 4.5, h: 0.4,
    fontSize: 14, fontFace: "Arial",
    color: theme.secondary,
    margin: 0
  });
}

module.exports = { createSlide };