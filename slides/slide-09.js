const pptxgen = require("pptxgenjs");

function createSlide(pres, theme) {
  const slide = pres.addSlide();
  slide.background = { color: theme.bg };

  // Section label
  slide.addText("05  CHALLENGES & THE FUTURE", {
    x: 0.5, y: 0.35, w: 6, h: 0.4,
    fontSize: 12, fontFace: "Arial",
    color: theme.accent, bold: true,
    charSpacing: 2, margin: 0
  });

  // Slide title
  slide.addText("The Road Ahead", {
    x: 0.5, y: 0.7, w: 7, h: 0.8,
    fontSize: 32, fontFace: "Arial",
    color: theme.primary, bold: true,
    margin: 0
  });

  const trends = [
    {
      title: "Multimodal AI",
      desc: "Systems that seamlessly combine text, images, audio, and video -- going beyond single-mode interaction",
    },
    {
      title: "AI Agents",
      desc: "Autonomous agents that plan, use tools, and complete complex multi-step tasks with minimal human input",
    },
    {
      title: "AI Regulation",
      desc: "Governments worldwide are crafting policies to ensure safety, accountability, and ethical deployment",
    },
    {
      title: "Edge AI",
      desc: "Running AI models directly on devices like smartphones and sensors — faster, more private, offline-capable",
    },
  ];

  const startY = 1.55;
  const cardH = 0.82;
  const cardW = 4.4;
  const gapX = 0.2;
  const gapY = 0.1;

  trends.forEach((t, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const cx = 0.5 + col * (cardW + gapX);
    const cy = startY + row * (cardH + gapY);

    // Card background
    slide.addShape(pres.shapes.RECTANGLE, {
      x: cx, y: cy, w: cardW, h: cardH,
      fill: { color: theme.light }
    });

    // Left accent bar
    slide.addShape(pres.shapes.RECTANGLE, {
      x: cx, y: cy, w: 0.08, h: cardH,
      fill: { color: theme.accent }
    });

    // Number badge
    slide.addShape(pres.shapes.OVAL, {
      x: cx + 0.2, y: cy + 0.12, w: 0.32, h: 0.32,
      fill: { color: theme.accent }
    });

    slide.addText(String(i + 1), {
      x: cx + 0.2, y: cy + 0.16, w: 0.32, h: 0.26,
      fontSize: 11, fontFace: "Arial",
      color: "FFFFFF", bold: true,
      align: "center", margin: 0
    });

    // Title
    slide.addText(t.title, {
      x: cx + 0.62, y: cy + 0.1, w: cardW - 0.8, h: 0.3,
      fontSize: 13, fontFace: "Arial",
      color: theme.primary, bold: true,
      margin: 0
    });

    // Description
    slide.addText(t.desc, {
      x: cx + 0.62, y: cy + 0.42, w: cardW - 0.8, h: 0.36,
      fontSize: 10, fontFace: "Arial",
      color: theme.secondary,
      margin: 0
    });
  });

  // Bottom takeaway
  slide.addShape(pres.shapes.LINE, {
    x: 0.5, y: 3.85, w: 9, h: 0,
    line: { color: theme.light, width: 0.5 }
  });

  slide.addText("The next decade of AI will be defined by how responsibly we harness its transformative power.", {
    x: 0.5, y: 4.0, w: 9, h: 0.5,
    fontSize: 12, fontFace: "Arial",
    color: theme.secondary, italic: true,
    margin: 0
  });

  // Page number
  slide.addText("9", {
    x: 9.3, y: 5.1, w: 0.5, h: 0.35,
    fontSize: 12, fontFace: "Arial",
    color: theme.secondary, align: "right",
    margin: 0
  });
}

module.exports = { createSlide };