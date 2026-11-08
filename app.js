(() => {
  "use strict";
  const side = document.getElementById("side");
  const title = document.getElementById("b-title"), desc = document.getElementById("b-desc"), note = document.getElementById("note");
  const frame = document.getElementById("preview"), code = document.getElementById("code"), codeText = document.getElementById("code-text");
  const tabPreview = document.getElementById("tab-preview"), tabCode = document.getElementById("tab-code");
  const copyBtn = document.getElementById("copy"), openLink = document.getElementById("open");
  const previewKey = window.AI_BLOCKS_PREVIEW_KEY || "YOUR_ONETAG_KEY";
  let blocks = [], current = null, source = "";

  // The preview is the block itself inside a plain page, with the demo key swapped in.
  const shell = (html) => `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>body{margin:0;padding:24px;font:16px/1.5 "IBM Plex Sans",system-ui,sans-serif;color:#111}main h2{margin-top:0}</style></head>
<body><main><h2>Sample page</h2><p>This preview is a small page about sourdough. A starter is flour and water left to ferment; it leavens bread with wild yeast and bacteria instead of commercial yeast. Feed it daily at room temperature or weekly in the fridge. A loaf needs about 20% starter, a long cold proof of 12 to 18 hours, and a very hot oven, 250 °C, with steam for the first 20 minutes.</p>
${html.replace(/YOUR_ONETAG_KEY/g, previewKey)}</main></body></html>`;

  function renderSide() {
    const groups = [...new Set(blocks.map((b) => b.group))];
    side.innerHTML = groups.map((g) => `<h2>${g}</h2><ul>${blocks.filter((b) => b.group === g).map((b) => `<li><a href="#${b.id}" data-id="${b.id}">${b.title}</a></li>`).join("")}</ul>`).join("");
    const mobile = document.createElement("select");
    mobile.className = "mobile-select";
    mobile.setAttribute("aria-label", "Choose a block");
    mobile.innerHTML = blocks.map((b) => `<option value="${b.id}">${b.group}: ${b.title}</option>`).join("");
    mobile.addEventListener("change", () => { location.hash = mobile.value; });
    side.prepend(mobile);
  }

  async function show(id) {
    const b = blocks.find((x) => x.id === id) || blocks[0];
    if (!b) return;
    current = b;
    for (const a of side.querySelectorAll("a")) a.classList.toggle("on", a.dataset.id === b.id);
    const sel = side.querySelector("select"); if (sel) sel.value = b.id;
    title.textContent = b.title; desc.textContent = b.description;
    note.textContent = `${b.lines} lines · plain HTML + JS · paste anywhere`;
    source = await (await fetch(b.file)).text();
    codeText.textContent = source;
    frame.srcdoc = shell(source);
    openLink.href = `preview.html#${b.id}`;
  }

  function tab(which) {
    const isCode = which === "code";
    code.hidden = !isCode; frame.hidden = isCode;
    tabPreview.setAttribute("aria-selected", String(!isCode)); tabCode.setAttribute("aria-selected", String(isCode));
  }
  tabPreview.addEventListener("click", () => tab("preview"));
  tabCode.addEventListener("click", () => tab("code"));
  copyBtn.addEventListener("click", async () => {
    try { await navigator.clipboard.writeText(source); copyBtn.textContent = "Copied"; setTimeout(() => { copyBtn.textContent = "Copy block"; }, 1500); }
    catch { tab("code"); }
  });
  window.addEventListener("hashchange", () => show(location.hash.slice(1)));

  fetch("blocks.json").then((r) => r.json()).then((data) => {
    blocks = data.blocks; renderSide(); show(location.hash.slice(1) || blocks[0].id);
  });
})();
