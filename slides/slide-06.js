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
  slide.addText("AI in Everyday Life", {
    x: 0.5, y: 0.7, w: 7, h: 0.8,
    fontSize: 32, fontFace: "Arial",
    color: theme.primary, bold: true,
    margin: 0
  });

  const leftApps = [
    { title: "Smart Assistants", desc: "Siri, Alexa, Google Assistant answer questions and control your home" },
    { title: "Streaming Recommendations", desc: "Netflix and Spotify personalize content based on your behavior" },
    { title: "Navigation Apps", desc: "Google Maps and Waze use AI to find the fastest routes in real time" },
  ];

  const rightApps = [
    { title: "Email Filters", desc: "AI blocks spam and categorizes your inbox with high accuracy" },
    { title: "Photo Recognition", desc: "Google Photos and iCloud auto-tag faces and places" },
    { title: "Healthcare Diagnostics", desc: "AI models detect diseases from X-rays and scans faster than humans" },
  ];

  const colW = 4.3;
  const startY = 1.6;
  const rowH = 0.85;

  // Left column header
  slide.addText("Consumer", {
    x: 0.5, y: startY, w: colW, h: 0.35,
    fontSize: 13, fontFace: "Arial",
    color: theme.accent, bold: true,
    margin: 0
  });

  // Right column header
  slide.addText("Enterprise & Society", {
    x: 5.2, y: startY, w: colW, h: 0.35,
    fontSize: 13, fontFace: "Arial",
    color: theme.accent, bold: true,
    margin: 0
  });

  const dividerY = startY + 0.38;
  slide.addShape(pres.shapes.LINE, {
    x: 0.5, y: dividerY, w: 9, h: 0,
    line: { color: theme.light, width: 0.5 }
  });

  const dataY = startY + 0.5;

  leftApps.forEach((app, i) => {
    const y = dataY + i * rowH;

    // Icon circle
    slide.addShape(pres.shapes.OVAL, {
      x: 0.5, y: y, w: 0.25, h: 0.25,
      fill: { color: theme.accent }
    });

    slide.addText(app.title, {
      x: 0.85, y: y - 0.05, w: 3.8, h: 0.3,
      fontSize: 13, fontFace: "Arial",
      color: theme.primary, bold: true,
      margin: 0
    });

    slide.addText(app.desc, {
      x: 0.85, y: y + 0.25, w: 3.8, h: 0.5,
      fontSize: 11, fontFace: "Arial",
      color: theme.secondary,
      margin: 0
    });
  });

  rightApps.forEach((app, i) => {
    const y = dataY + i * rowH;

    slide.addShape(pres.shapes.OVAL, {
      x: 5.2, y: y, w: 0.25, h: 0.25,
      fill: { color: theme.accent }
    });

    slide.addText(app.title, {
      x: 5.55, y: y - 0.05, w: 4.0, h: 0.3,
      fontSize: 13, fontFace: "Arial",
      color: theme.primary, bold: true,
      margin: 0
    });

    slide.addText(app.desc, {
      x: 5.55, y: y + 0.25, w: 4.0, h: 0.5,
      fontSize: 11, fontFace: "Arial",
      color: theme.secondary,
      margin: 0
    });
  });

  // Bottom stat bar
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0.5, y: 4.5, w: 9, h: 0.55,
    fill: { color: theme.light }
  });

  slide.addText("By 2030, AI is projected to contribute $15.7 trillion to the global economy", {
    x: 0.5, y: 4.55, w: 9, h: 0.45,
    fontSize: 13, fontFace: "Arial",
    color: theme.primary, italic: true,
    align: "center", valign: "middle",
    margin: 0
  });

  // Page number
  slide.addText("6", {
    x: 9.3, y: 5.1, w: 0.5, h: 0.35,
    fontSize: 12, fontFace: "Arial",
    color: theme.secondary, align: "right",
    margin: 0
  });
}

module.exports = { createSlide };