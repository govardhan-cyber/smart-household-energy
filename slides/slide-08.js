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
  slide.addText("Risks, Ethics & Concerns", {
    x: 0.5, y: 0.7, w: 7, h: 0.8,
    fontSize: 32, fontFace: "Arial",
    color: theme.primary, bold: true,
    margin: 0
  });

  const challenges = [
    {
      title: "Bias & Fairness",
      desc: "AI systems inherit and amplify biases from training data, leading to unfair outcomes in hiring, lending, and criminal justice.",
      icon: "!",
    },
    {
      title: "Privacy & Surveillance",
      desc: "Facial recognition and data collection raise serious concerns about surveillance, consent, and personal freedom.",
      icon: "?",
    },
    {
      title: "Job Displacement",
      desc: "Automation threatens to eliminate roles in manufacturing, retail, and services, requiring massive workforce reskilling.",
      icon: "^",
    },
    {
      title: "Misinformation",
      desc: "Generative AI can create realistic fake content — deepfakes, synthetic text — making it harder to distinguish truth from fiction.",
      icon: "~",
    },
  ];

  const startY = 1.55;
  const cardH = 0.82;
  const cardW = 4.4;
  const gapX = 0.2;
  const gapY = 0.1;

  challenges.forEach((ch, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const cx = 0.5 + col * (cardW + gapX);
    const cy = startY + row * (cardH + gapY);

    // Card background
    slide.addShape(pres.shapes.RECTANGLE, {
      x: cx, y: cy, w: cardW, h: cardH,
      fill: { color: theme.light }
    });

    // Top accent
    slide.addShape(pres.shapes.RECTANGLE, {
      x: cx, y: cy, w: cardW, h: 0.06,
      fill: { color: theme.accent }
    });

    // Title
    slide.addText(ch.title, {
      x: cx + 0.15, y: cy + 0.1, w: cardW - 0.3, h: 0.3,
      fontSize: 13, fontFace: "Arial",
      color: theme.primary, bold: true,
      margin: 0
    });

    // Description
    slide.addText(ch.desc, {
      x: cx + 0.15, y: cy + 0.4, w: cardW - 0.3, h: 0.38,
      fontSize: 10, fontFace: "Arial",
      color: theme.secondary,
      margin: 0
    });
  });

  // Bottom note
  slide.addShape(pres.shapes.LINE, {
    x: 0.5, y: 3.85, w: 9, h: 0,
    line: { color: theme.light, width: 0.5 }
  });

  slide.addText("Addressing these risks requires thoughtful regulation, transparency, and inclusive AI development.", {
    x: 0.5, y: 4.0, w: 9, h: 0.5,
    fontSize: 12, fontFace: "Arial",
    color: theme.secondary, italic: true,
    margin: 0
  });

  // Page number
  slide.addText("8", {
    x: 9.3, y: 5.1, w: 0.5, h: 0.35,
    fontSize: 12, fontFace: "Arial",
    color: theme.secondary, align: "right",
    margin: 0
  });
}

module.exports = { createSlide };