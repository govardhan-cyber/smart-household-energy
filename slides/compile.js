const pptxgen = require("pptxgenjs");
const path = require("path");

const pres = new pptxgen();
pres.layout = "LAYOUT_16x9";
pres.title = "Artificial Intelligence: Shaping the Future";
pres.author = "Mavis";

const theme = {
  primary: "03045e",
  secondary: "0077b6",
  accent: "00b4d8",
  light: "90e0ef",
  bg: "caf0f8",
};

const slideCount = 10;
for (let i = 1; i <= slideCount; i++) {
  const n = String(i).padStart(2, "0");
  const mod = require("./slide-" + n + ".js");
  mod.createSlide(pres, theme);
}

const outPath = path.join(__dirname, "output", "artificial-intelligence.pptx");
pres.writeFile({ fileName: outPath })
  .then(() => console.log("Written: " + outPath))
  .catch(err => { console.error(err); process.exit(1); });