import { parse } from "./musje";

var score, svg;
const form = document.getElementById("sheet-inputs");
const formElements = form.elements;
const container = document.getElementById("sheet");
const modal = document.getElementById("help-modal");
const fontFaceStyle = Array.prototype.filter.call(
  document.getElementsByTagName("style"),
  el => el.innerText.includes("Cadence")
)[0];

function updateSheet() {
  if (score) score.stop();
  if (svg) container.removeChild(svg);

  var head = `
title: ${formElements.title.value}
subtitle: ${formElements.subtitle.value}
composer: ${formElements.composer.value}
arranger: Yuqi Wang
lyricist: ${formElements.lyricist.value}
`;
  var properties =
    addSlash(formElements.tempo.value) +
    `${formElements.beats_1.value}/${formElements.beats_2.value}` +
    addSlash(formElements.strength.value);
  var body = `
${formElements.notations.value}
lyrics1:
${formElements.lyrics1.value}
lyrics2:
${formElements.lyrics2.value}
`;
  try {
    score = parse(head + properties + body);
    score.addStyle(`
      score {
        width: 800px
      }
    `);
    svg = score.render();
  } catch (e) {
    svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", "800");
    svg.setAttribute("height", "300");
    var rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    rect.setAttribute("width", "100%");
    rect.setAttribute("height", "100%");
    rect.setAttribute(
      "style",
      "stroke-width: 0.8;stroke: gray;stroke-dasharray: 2 1;stroke-opacity: 0.8;fill: none"
    );
    svg.appendChild(rect);
    var title = document.createElementNS("http://www.w3.org/2000/svg", "text");
    title.setAttribute("x", "50%");
    title.setAttribute("y", "50%");
    title.setAttribute("text-anchor", "middle");
    title.setAttribute("dominant-baseline", "middle");
    title.setAttribute("font-size", "30");
    title.innerHTML = "简谱格式有误";
    svg.appendChild(title);
    // multiple lines, mono-spaced font
    e.message.split('\n').map((line, i) => {
      var text = document.createElementNS("http://www.w3.org/2000/svg", "text");
      text.setAttribute("x", "50%");
      text.setAttribute("y", "60%");
      text.setAttribute("text-anchor", "middle");
      text.setAttribute("dominant-baseline", "middle");
      text.setAttribute("font-size", "14");
      text.setAttribute("font-family", "monospace");
      text.setAttribute("dy", `${(i + 1) * 1.2}em`);
      text.innerHTML = line;
      svg.appendChild(text);
    });
  }

  var defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
  var style = document.createElementNS("http://www.w3.org/2000/svg", "style");
  style.innerHTML = fontFaceStyle.innerText;
  defs.appendChild(style);
  svg.insertBefore(defs, svg.firstChild);

  container.appendChild(svg);
}
function downloadImage() {
  var svgString = new XMLSerializer().serializeToString(svg);
  const svgBlob = new Blob([svgString], {
    type: "image/svg+xml;charset=utf-8",
  });
  const dataUrl = URL.createObjectURL(svgBlob);

  const img = new Image();
  img.onload = function () {
    var canvas = document.createElement("canvas");
    canvas.width = img.width * 2;
    canvas.height = img.height * 2;

    var ctx = canvas.getContext("2d");
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, img.width * 2, img.height * 2);
    ctx.drawImage(img, 0, 0, img.width * 2, img.height * 2);
    URL.revokeObjectURL(dataUrl);
    var png = canvas.toDataURL("image/png");

    var link = document.createElement("a");
    link.download = "image.png";
    link.href = png;
    link.click();
  };
  img.src = dataUrl;
}
function loadPreset() {
  formElements.title.value = "Ode an die Freude";
  formElements.subtitle.value = "欢乐颂";
  formElements.composer.value = "Beethoven";
  formElements.lyricist.value = "Schiller";
  formElements.tempo.value = "Presto";
  formElements.beats_1.value = "4";
  formElements.beats_2.value = "4";
  formElements.strength.value = "mf";
  formElements.notations.value = `3 3 4 5| 5 4 3 2| 1 1 2 3| 3. 2_ 2-|
3 3 4 5| 5 4 3 2| 1 1 2 3| 2. 1_ 1-|
2 2 3 1|2 (3_4_)3 1| 2 (3_4_) 3 2| 1 2 5 (3|
3) 3 4 5|(5 4) (3 4_2_)| 1 1 2 3| 2.1_ 1-|]`;
  formElements.lyrics1.value = `Joy +1 bril-liant spark of rhe gods daugh-ter of E-ly+1 sium, 
heaven-ly being, we enter your sanc-wary in-to-xica-ted
with +1 fine your spells reuhile that which was strict-ly
di-vi-ded by con-ven-tion all men be-come  bro-thers where your gen-tle wing rests`;
  formElements.lyrics2.value = `欢乐女神 圣洁美丽 灿烂光芒照大地
我们心中充满热情 来到你的圣殿里
你的力量能使人们 消除一切分+1歧
在你光辉照-1耀下-1面 人们团结成-1兄弟`;
  updateSheet();
}

function addSlash(value) {
  return value ? "/" + value : "";
}

document.getElementById("btn-play").addEventListener("click", function () {
  score.play();
});
document.getElementById("btn-stop").addEventListener("click", function () {
  score.stop();
});
document.getElementById("btn-clear").addEventListener("click", function () {
  form.reset();
  updateSheet();
});
document.getElementById("btn-export").addEventListener("click", downloadImage);
document.getElementById("btn-preset").addEventListener("click", loadPreset);

updateSheet();
Array.prototype.forEach.call(form, el => {
  if (el.tagName == "SELECT") el.addEventListener("change", updateSheet);
  else el.addEventListener("input", updateSheet);
});

document.getElementById("btn-help").addEventListener("click", function () {
  modal.style.display = "flex";
});
modal.addEventListener("click", function () {
  modal.style.display = "none";
});

