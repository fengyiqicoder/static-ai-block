(() => {
  "use strict";
  const thumbs = document.getElementById("thumbs");
  const title = document.getElementById("b-title"), desc = document.getElementById("b-desc"), note = document.getElementById("note");
  const frame = document.getElementById("preview"), frameWrap = document.querySelector(".frame-wrap"), code = document.getElementById("code"), codeText = document.getElementById("code-text");
  const toggleCode = document.getElementById("toggle-code"), toggleDark = document.getElementById("toggle-dark");
  const copyBtn = document.getElementById("copy"), openLink = document.getElementById("open");
  const previewKey = window.AI_BLOCKS_PREVIEW_KEY || "YOUR_ONETAG_KEY";
  let blocks = [], current = null, source = "", dark = false;

  const SAMPLE = `<main><h2>Sample page</h2><p>This preview is a small page about sourdough. A starter is flour and water left to ferment; it leavens bread with wild yeast and bacteria instead of commercial yeast. Feed it daily at room temperature or weekly in the fridge. A loaf needs about 20% starter, a long cold proof of 12 to 18 hours, and a very hot oven, 250 °C, with steam for the first 20 minutes.</p>`;

  // The preview is the block inside a plain sample page, with the demo key swapped in.
  const shell = (html, isDark) => `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>body{margin:0;padding:24px;font:16px/1.5 "IBM Plex Sans",system-ui,sans-serif;color:${isDark ? "#e8eef7" : "#111"};background:${isDark ? "#111827" : "#fff"}}main h2{margin-top:0}${isDark ? "input,textarea,select{background:#1f2937;color:#e8eef7;border-color:#374151!important}pre{background:#1f2937!important}" : ""}</style></head>
<body>${SAMPLE}${html.replace(/YOUR_ONETAG_KEY/g, previewKey)}</main></body></html>`;

  // Thumbnails are the block's own markup, scripts stripped, scaled down. No API calls.
  const thumb = (html, b) => `<!doctype html><html><head><meta charset="utf-8"><style>body{margin:0;padding:16px;width:560px;font:16px/1.5 "IBM Plex Sans",system-ui,sans-serif;color:#111;background:#fff;overflow:hidden}.cap{margin:10px 0 0;color:#94a3b8;font-size:15px}</style></head><body>${html.replace(/<script[\s\S]*?<\/script>/g, "").replace(/<!--[\s\S]*?-->/g, "")}<p class="cap">${b.description}</p></body></html>`;

  async function renderThumbs() {
    const groups = [...new Set(blocks.map((b) => b.group))];
    for (const g of groups) {
      const h = document.createElement("h2"); h.textContent = g; thumbs.append(h);
      for (const b of blocks.filter((x) => x.group === g)) {
        const a = document.createElement("a");
        a.href = "#" + b.id; a.dataset.id = b.id; a.className = "thumb"; a.title = b.title;
        a.innerHTML = `<span class="thumb-frame"><iframe loading="lazy" tabindex="-1" aria-hidden="true" sandbox=""></iframe></span><span class="thumb-label">${b.title}</span>`;
        thumbs.append(a);
        fetch(b.file).then((r) => r.text()).then((src) => { b.source = src; a.querySelector("iframe").srcdoc = thumb(src, b); });
      }
    }
  }

  async function show(id) {
    const b = blocks.find((x) => x.id === id) || blocks[0];
    if (!b) return;
    current = b;
    for (const a of thumbs.querySelectorAll("a")) a.classList.toggle("on", a.dataset.id === b.id);
    thumbs.querySelector(`a[data-id="${b.id}"]`)?.scrollIntoView({ block: "nearest" });
    title.textContent = b.title; desc.textContent = b.description;
    note.textContent = `${b.lines} lines · plain HTML + JS · paste anywhere`;
    source = b.source || await (await fetch(b.file)).text();
    b.source = source;
    codeText.textContent = source;
    frame.srcdoc = shell(source, dark);
    openLink.href = `preview.html#${b.id}`;
  }

  toggleCode.addEventListener("click", () => {
    const show = code.hidden;
    code.hidden = !show; frameWrap.hidden = show;
    toggleCode.setAttribute("aria-pressed", String(show));
  });
  for (const btn of document.querySelectorAll(".seg [data-width]")) {
    btn.addEventListener("click", () => {
      for (const o of document.querySelectorAll(".seg [data-width]")) o.setAttribute("aria-pressed", String(o === btn));
      frame.style.width = btn.dataset.width;
    });
  }
  toggleDark.addEventListener("click", () => {
    dark = !dark; toggleDark.setAttribute("aria-pressed", String(dark));
    if (current) frame.srcdoc = shell(source, dark);
  });
  copyBtn.addEventListener("click", async () => {
    try { await navigator.clipboard.writeText(source); copyBtn.textContent = "Copied"; setTimeout(() => { copyBtn.textContent = "Copy block"; }, 1500); }
    catch { code.hidden = false; frameWrap.hidden = true; toggleCode.setAttribute("aria-pressed", "true"); }
  });
  window.addEventListener("hashchange", () => show(location.hash.slice(1)));

  fetch("blocks.json").then((r) => r.json()).then(async (data) => {
    blocks = data.blocks; await renderThumbs(); show(location.hash.slice(1) || blocks[0].id);
  });
})();
