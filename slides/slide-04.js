const pptxgen = require("pptxgenjs");

function createSlide(pres, theme) {
  const slide = pres.addSlide();
  slide.background = { color: theme.bg };

  // Section label
  slide.addText("02  A BRIEF HISTORY", {
    x: 0.5, y: 0.35, w: 5, h: 0.4,
    fontSize: 12, fontFace: "Arial",
    color: theme.accent, bold: true,
    charSpacing: 2, margin: 0
  });

  // Slide title
  slide.addText("The Evolution of AI", {
    x: 0.5, y: 0.7, w: 6, h: 0.8,
    fontSize: 32, fontFace: "Arial",
    color: theme.primary, bold: true,
    margin: 0
  });

  const milestones = [
    { year: "1950", title: "Turing Test", desc: "Alan Turing asks if machines can think" },
    { year: "1956", title: "AI Coined", desc: "Dartmouth conference marks birth of AI as a field" },
    { year: "1980s", title: "ML Revival", desc: "Machine learning gains traction with new algorithms" },
    { year: "1997", title: "Deep Blue", desc: "IBM computer defeats world chess champion Kasparov" },
    { year: "2012", title: "Deep Learning", desc: "CNNs spark breakthrough in image recognition" },
    { year: "2020s", title: "Gen AI Era", desc: "Large language models redefine what AI can do" },
  ];

  const startY = 1.6;
  const rowH = 0.6;
  const dotX = 1.0;
  const lineX = 1.08;

  // Vertical timeline line
  slide.addShape(pres.shapes.LINE, {
    x: lineX, y: startY + 0.08, w: 0, h: (milestones.length - 1) * rowH + 0.1,
    line: { color: theme.accent, width: 1.5 }
  });

  milestones.forEach((m, i) => {
    const y = startY + i * rowH;

    // Dot on timeline
    slide.addShape(pres.shapes.OVAL, {
      x: dotX - 0.08, y: y, w: 0.16, h: 0.16,
      fill: { color: theme.accent }
    });

    // Year
    slide.addText(m.year, {
      x: 1.4, y: y - 0.04, w: 0.9, h: 0.3,
      fontSize: 13, fontFace: "Arial",
      color: theme.accent, bold: true,
      margin: 0
    });

    // Title
    slide.addText(m.title, {
      x: 2.35, y: y - 0.04, w: 1.6, h: 0.3,
      fontSize: 13, fontFace: "Arial",
      color: theme.primary, bold: true,
      margin: 0
    });

    // Description
    slide.addText(m.desc, {
      x: 4.0, y: y - 0.04, w: 5.5, h: 0.3,
      fontSize: 12, fontFace: "Arial",
      color: theme.secondary,
      margin: 0
    });
  });

  // Page number
  slide.addText("4", {
    x: 9.3, y: 5.1, w: 0.5, h: 0.35,
    fontSize: 12, fontFace: "Arial",
    color: theme.secondary, align: "right",
    margin: 0
  });
}

module.exports = { createSlide };