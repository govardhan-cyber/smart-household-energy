const pptxgen = require("pptxgenjs");

function createSlide(pres, theme) {
  const slide = pres.addSlide();

  // Dark background for closing impact
  slide.background = { color: theme.bg };

  // Decorative circles
  slide.addShape(pres.shapes.OVAL, {
    x: -1.0, y: 3.5, w: 3.0, h: 3.0,
    fill: { color: theme.light, transparency: 80 }
  });

  slide.addShape(pres.shapes.OVAL, {
    x: 8.0, y: -1.0, w: 3.5, h: 3.5,
    fill: { color: theme.accent, transparency: 85 }
  });

  // Left accent bar
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0, y: 0, w: 0.12, h: 5.625,
    fill: { color: theme.accent }
  });

  // Title
  slide.addText("Key Takeaways", {
    x: 0.5, y: 0.5, w: 9, h: 0.8,
    fontSize: 36, fontFace: "Arial",
    color: theme.primary, bold: true,
    margin: 0
  });

  // Divider
  slide.addShape(pres.shapes.LINE, {
    x: 0.5, y: 1.3, w: 2.5, h: 0,
    line: { color: theme.accent, width: 3 }
  });

  const takeaways = [
    "AI is not new -- it has been evolving since the 1950s and is now accelerating faster than ever",
    "Machine Learning, Deep Learning, and NLP are the three engines driving modern AI applications",
    "AI already touches every part of daily life — from your phone to hospitals to the financial system",
    "Critical challenges remain: bias, privacy, job displacement, and misinformation must be addressed",
    "The future belongs to those who understand and guide AI responsibly",
  ];

  const bulletItems = takeaways.map((t, i) => ({
    text: t,
    options: {
      bullet: true,
      breakLine: i < takeaways.length - 1,
      fontSize: 13,
      fontFace: "Arial",
      color: theme.primary,
      paraSpaceAfter: 10,
    },
  }));

  slide.addText(bulletItems, {
    x: 0.5, y: 1.5, w: 9, h: 2.8,
    valign: "top", margin: 0
  });

  // Closing line
  slide.addShape(pres.shapes.LINE, {
    x: 0.5, y: 4.4, w: 9, h: 0,
    line: { color: theme.light, width: 0.5 }
  });

  slide.addText("Artificial Intelligence is not just a technology — it is a defining force of our era.", {
    x: 0.5, y: 4.55, w: 9, h: 0.5,
    fontSize: 14, fontFace: "Arial",
    color: theme.accent, italic: true,
    margin: 0
  });

  // Page number
  slide.addText("10", {
    x: 9.3, y: 5.1, w: 0.5, h: 0.35,
    fontSize: 12, fontFace: "Arial",
    color: theme.secondary, align: "right",
    margin: 0
  });
}

module.exports = { createSlide };