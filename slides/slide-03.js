const pptxgen = require("pptxgenjs");

function createSlide(pres, theme) {
  const slide = pres.addSlide();
  slide.background = { color: theme.bg };

  // Section label
  slide.addText("01  WHAT IS AI?", {
    x: 0.5, y: 0.35, w: 5, h: 0.4,
    fontSize: 12, fontFace: "Arial",
    color: theme.accent, bold: true,
    charSpacing: 2, margin: 0
  });

  // Slide title
  slide.addText("Defining Artificial Intelligence", {
    x: 0.5, y: 0.7, w: 5.5, h: 0.8,
    fontSize: 32, fontFace: "Arial",
    color: theme.primary, bold: true,
    margin: 0
  });

  // Definition card
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0.5, y: 1.65, w: 5.5, h: 1.4,
    fill: { color: theme.light },
    line: { color: theme.accent, width: 0 }
  });

  // Left accent bar on card
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0.5, y: 1.65, w: 0.08, h: 1.4,
    fill: { color: theme.accent }
  });

  slide.addText("Artificial Intelligence (AI) is the simulation of human intelligence by machines, enabling them to learn, reason, and make decisions.", {
    x: 0.72, y: 1.75, w: 5.1, h: 1.2,
    fontSize: 14, fontFace: "Arial",
    color: theme.primary,
    valign: "middle", margin: 0
  });

  // Right side: 4 AI pillars
  const pillars = [
    { label: "Learning", desc: "Acquiring data and improving from experience" },
    { label: "Reasoning", desc: "Drawing logical conclusions from facts" },
    { label: "Perception", desc: "Interpreting sensory inputs like vision and speech" },
    { label: "Language", desc: "Understanding and generating human language" },
  ];

  const colX = [5.8, 8.0];
  const colY = [1.3, 2.6];

  pillars.forEach((p, i) => {
    const cx = colX[i % 2];
    const cy = colY[Math.floor(i / 2)];

    slide.addShape(pres.shapes.OVAL, {
      x: cx, y: cy, w: 0.28, h: 0.28,
      fill: { color: theme.accent }
    });

    slide.addText(p.label, {
      x: cx + 0.38, y: cy - 0.04, w: 1.4, h: 0.35,
      fontSize: 13, fontFace: "Arial",
      color: theme.primary, bold: true,
      margin: 0
    });

    slide.addText(p.desc, {
      x: cx + 0.38, y: cy + 0.28, w: 1.55, h: 0.6,
      fontSize: 10, fontFace: "Arial",
      color: theme.secondary,
      margin: 0
    });
  });

  // Bottom note
  slide.addShape(pres.shapes.LINE, {
    x: 0.5, y: 3.55, w: 9, h: 0,
    line: { color: theme.light, width: 0.5 }
  });

  slide.addText("AI powers everything from your phone's voice assistant to complex medical diagnoses.", {
    x: 0.5, y: 3.7, w: 9, h: 0.5,
    fontSize: 13, fontFace: "Arial",
    color: theme.secondary, italic: true,
    margin: 0
  });

  // Bottom visual: brain icon placeholder (circle + lines)
  slide.addShape(pres.shapes.OVAL, {
    x: 1.5, y: 4.3, w: 1.0, h: 1.0,
    fill: { color: theme.accent, transparency: 80 },
    line: { color: theme.accent, width: 1.5 }
  });
  slide.addShape(pres.shapes.OVAL, {
    x: 2.8, y: 4.5, w: 0.7, h: 0.7,
    fill: { color: theme.light, transparency: 60 },
    line: { color: theme.accent, width: 1 }
  });
  slide.addShape(pres.shapes.OVAL, {
    x: 3.7, y: 4.2, w: 0.85, h: 0.85,
    fill: { color: theme.accent, transparency: 75 },
    line: { color: theme.accent, width: 1 }
  });

  // Page number
  slide.addText("3", {
    x: 9.3, y: 5.1, w: 0.5, h: 0.35,
    fontSize: 12, fontFace: "Arial",
    color: theme.secondary, align: "right",
    margin: 0
  });
}

module.exports = { createSlide };