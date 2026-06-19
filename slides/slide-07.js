const pptxgen = require("pptxgenjs");

function createSlide(pres, theme) {
  const slide = pres.addSlide();
  slide.background = { color: theme.bg };

  // Section label
  slide.addText("04  AI IN PRACTICE", {
    x: 0.5, y: 0.35, w: 5, h: 0.4,
    fontSize: 12, fontFace: "Arial",
    color: theme.accent, bold: true,
    charSpacing: 2, margin: 0
  });

  // Slide title
  slide.addText("AI Transforming Industries", {
    x: 0.5, y: 0.7, w: 7, h: 0.8,
    fontSize: 32, fontFace: "Arial",
    color: theme.primary, bold: true,
    margin: 0
  });

  const industries = [
    {
      sector: "Healthcare",
      color: theme.accent,
      items: ["Medical imaging analysis", "Drug discovery acceleration", "Personalized treatment plans"],
    },
    {
      sector: "Finance",
      color: theme.secondary,
      items: ["Fraud detection in real time", "Algorithmic trading", "Credit risk assessment"],
    },
    {
      sector: "Transportation",
      color: theme.light,
      items: ["Autonomous vehicle navigation", "Traffic prediction models", "Fleet optimization"],
    },
    {
      sector: "Education",
      color: theme.accent,
      items: ["Adaptive learning platforms", "Automated grading systems", "Language translation tools"],
    },
  ];

  const startY = 1.55;
  const cardH = 0.78;
  const cardW = 4.4;
  const gapX = 0.2;
  const gapY = 0.1;

  industries.forEach((ind, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const cx = 0.5 + col * (cardW + gapX);
    const cy = startY + row * (cardH + gapY);

    // Card
    slide.addShape(pres.shapes.RECTANGLE, {
      x: cx, y: cy, w: cardW, h: cardH,
      fill: { color: theme.light }
    });

    // Left color accent
    slide.addShape(pres.shapes.RECTANGLE, {
      x: cx, y: cy, w: 0.08, h: cardH,
      fill: { color: ind.color }
    });

    // Sector name
    slide.addText(ind.sector, {
      x: cx + 0.2, y: cy + 0.06, w: cardW - 0.3, h: 0.3,
      fontSize: 14, fontFace: "Arial",
      color: theme.primary, bold: true,
      margin: 0
    });

    // Items as comma-separated
    slide.addText(ind.items.join("  |  "), {
      x: cx + 0.2, y: cy + 0.38, w: cardW - 0.35, h: 0.35,
      fontSize: 10, fontFace: "Arial",
      color: theme.secondary,
      margin: 0
    });
  });

  // Bottom insight
  slide.addShape(pres.shapes.LINE, {
    x: 0.5, y: 3.75, w: 9, h: 0,
    line: { color: theme.light, width: 0.5 }
  });

  slide.addText("AI is not replacing jobs en masse — it is augmenting human capabilities and creating entirely new categories of work.", {
    x: 0.5, y: 3.9, w: 9, h: 0.55,
    fontSize: 12, fontFace: "Arial",
    color: theme.secondary, italic: true,
    margin: 0
  });

  // Page number
  slide.addText("7", {
    x: 9.3, y: 5.1, w: 0.5, h: 0.35,
    fontSize: 12, fontFace: "Arial",
    color: theme.secondary, align: "right",
    margin: 0
  });
}

module.exports = { createSlide };