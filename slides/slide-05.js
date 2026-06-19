const pptxgen = require("pptxgenjs");

function createSlide(pres, theme) {
  const slide = pres.addSlide();
  slide.background = { color: theme.bg };

  // Section label
  slide.addText("03  CORE TECHNOLOGIES", {
    x: 0.5, y: 0.35, w: 5, h: 0.4,
    fontSize: 12, fontFace: "Arial",
    color: theme.accent, bold: true,
    charSpacing: 2, margin: 0
  });

  // Slide title
  slide.addText("Three Pillars of Modern AI", {
    x: 0.5, y: 0.7, w: 7, h: 0.8,
    fontSize: 32, fontFace: "Arial",
    color: theme.primary, bold: true,
    margin: 0
  });

  const cards = [
    {
      title: "Machine Learning",
      icon: "ML",
      points: [
        "Algorithms that learn patterns from data",
        "Supervised, unsupervised, and reinforcement learning",
        "Used for predictions, recommendations, and anomaly detection",
      ],
    },
    {
      title: "Deep Learning",
      icon: "DL",
      points: [
        "Neural networks with many layers",
        "Powers image recognition, speech, and autonomous systems",
        "Requires massive datasets and compute power",
      ],
    },
    {
      title: "Natural Language Processing",
      icon: "NLP",
      points: [
        "Enables machines to read, write, and converse",
        "Underpins chatbots, translation, and sentiment analysis",
        "Recent advances driven by transformer models like GPT",
      ],
    },
  ];

  const cardW = 2.9;
  const cardH = 3.2;
  const startX = 0.5;
  const cardY = 1.55;
  const gap = 0.15;

  cards.forEach((card, i) => {
    const cx = startX + i * (cardW + gap);

    // Card background
    slide.addShape(pres.shapes.RECTANGLE, {
      x: cx, y: cardY, w: cardW, h: cardH,
      fill: { color: theme.light }
    });

    // Top accent strip
    slide.addShape(pres.shapes.RECTANGLE, {
      x: cx, y: cardY, w: cardW, h: 0.08,
      fill: { color: theme.accent }
    });

    // Icon circle
    slide.addShape(pres.shapes.OVAL, {
      x: cx + 0.15, y: cardY + 0.2, w: 0.55, h: 0.55,
      fill: { color: theme.accent }
    });

    slide.addText(card.icon, {
      x: cx + 0.15, y: cardY + 0.28, w: 0.55, h: 0.4,
      fontSize: 11, fontFace: "Arial",
      color: "FFFFFF", bold: true,
      align: "center", margin: 0
    });

    // Card title
    slide.addText(card.title, {
      x: cx + 0.15, y: cardY + 0.85, w: cardW - 0.3, h: 0.45,
      fontSize: 14, fontFace: "Arial",
      color: theme.primary, bold: true,
      margin: 0
    });

    // Bullet points
    const bulletItems = card.points.map((pt, idx) => ({
      text: pt,
      options: {
        bullet: true,
        breakLine: idx < card.points.length - 1,
        fontSize: 10,
        fontFace: "Arial",
        color: theme.secondary,
        paraSpaceAfter: 6,
      },
    }));

    slide.addText(bulletItems, {
      x: cx + 0.15, y: cardY + 1.35, w: cardW - 0.3, h: 1.7,
      valign: "top", margin: 0
    });
  });

  // Page number
  slide.addText("5", {
    x: 9.3, y: 5.1, w: 0.5, h: 0.35,
    fontSize: 12, fontFace: "Arial",
    color: theme.secondary, align: "right",
    margin: 0
  });
}

module.exports = { createSlide };