const pptxgen = require("pptxgenjs");

function createSlide(pres, theme) {
  const slide = pres.addSlide();
  slide.background = { color: theme.bg };

  // Page title
  slide.addText("Table of Contents", {
    x: 0.5, y: 0.4, w: 9, h: 0.7,
    fontSize: 36, fontFace: "Arial",
    color: theme.primary, bold: true,
    margin: 0
  });

  // Divider line under title
  slide.addShape(pres.shapes.LINE, {
    x: 0.5, y: 1.1, w: 2.5, h: 0,
    line: { color: theme.accent, width: 3 }
  });

  const sections = [
    { num: "01", title: "What Is AI?" },
    { num: "02", title: "A Brief History" },
    { num: "03", title: "Core Technologies" },
    { num: "04", title: "AI in Practice" },
    { num: "05", title: "Challenges & The Future" },
  ];

  const startY = 1.6;
  const rowH = 0.72;

  sections.forEach((s, i) => {
    const y = startY + i * rowH;

    // Number
    slide.addText(s.num, {
      x: 0.5, y: y, w: 0.8, h: 0.55,
      fontSize: 22, fontFace: "Arial",
      color: theme.accent, bold: true,
      margin: 0
    });

    // Section title
    slide.addText(s.title, {
      x: 1.35, y: y, w: 7, h: 0.55,
      fontSize: 20, fontFace: "Arial",
      color: theme.primary,
      margin: 0
    });

    // Subtle row line
    if (i < sections.length - 1) {
      slide.addShape(pres.shapes.LINE, {
        x: 0.5, y: y + 0.6, w: 8, h: 0,
        line: { color: theme.light, width: 0.5 }
      });
    }
  });

  // Page number
  slide.addText("2", {
    x: 9.3, y: 5.1, w: 0.5, h: 0.35,
    fontSize: 12, fontFace: "Arial",
    color: theme.secondary, align: "right",
    margin: 0
  });
}

module.exports = { createSlide };