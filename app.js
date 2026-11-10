(() => {
  "use strict";
  const grid = document.getElementById("blocks");
  const previewKey = window.AI_BLOCKS_PREVIEW_KEY || "YOUR_ONETAG_KEY";

  const usesNav = document.getElementById("uses"), blurb = document.getElementById("use-blurb");

  // Page-reading blocks answer from a hidden sample page; which page depends on the use that is selected.
  const page = (sample) => `<main><p style="position:absolute;left:-9999px;top:0">${sample}</p>`;

  // Each card is the block itself, running live inside a plain page with the demo key swapped in.
  const READS_PAGE = new Set(["ask-this-page","summarize-page","explain-selection","translate-page","quiz","code-explain"]);
  const shell = (html, b, sample) => `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>body{margin:0;padding:14px;background:#f5f7fb;font:15px/1.5 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;color:#0b1020}</style></head>
<body>${READS_PAGE.has(b.id) ? page(sample) : "<main>"}${html.replace(/YOUR_ONETAG_KEY/g, previewKey)}</main><script>new ResizeObserver(() => parent.postMessage({ sabHeight: Math.ceil(document.body.getBoundingClientRect().height) }, "*")).observe(document.body);</script></body></html>`;

  const toAI = (b, source) => `Add this AI block to my site. It uses OneTag AI; docs for the API are at https://onetagai.com/llms.txt

1. Insert the block below into the page where it fits. Keep its markup and script as they are; adapt colors or fonts only if my site has a design system.
2. If I do not have a OneTag AI key yet: ask me for my email, then run
   curl -X POST https://onetagai.com/api/signup -H "Content-Type: application/json" -d '{"email":"MY_EMAIL"}'
   The key arrives in my inbox (one key per email). Ask me to paste it, then replace YOUR_ONETAG_KEY (this key is designed to be public: it ships in the HTML like an analytics ID) in the block with it.
3. Open the page and try the block once. The free allowance is 1,000,000 tokens per account.

--- Block: ${b.title} (${b.description}) ---
${source}`;

  function card(b, sample) {
    const el = document.createElement("article");
    el.className = "card"; el.id = b.id;
    el.innerHTML = `<div class="card-inner">
      <div class="card-head"><h3>${b.title}</h3><span class="tag">${b.id}</span></div>
      <div class="card-live"><iframe loading="lazy" title="${b.title} (live)" sandbox="allow-scripts allow-same-origin allow-forms allow-modals"></iframe></div>
      <pre class="card-code" hidden><code></code></pre>
      <div class="card-bar">
        <span class="card-meta">${b.lines} lines · HTML + JS</span>
        <span class="card-actions">
          <button type="button" class="ghost" data-code aria-pressed="false">Code</button>
          <button type="button" class="ghost" data-copy>Copy block</button>
          <button type="button" class="button small" data-ai>Copy to AI</button>
          <a class="ghost" href="${b.page}">Page</a>
        </span>
      </div></div>`;
    const frame = el.querySelector("iframe"), code = el.querySelector(".card-code"), live = el.querySelector(".card-live");
    const codeBtn = el.querySelector("[data-code]"), copyBtn = el.querySelector("[data-copy]"), aiBtn = el.querySelector("[data-ai]");
    let source = "", shown = sample;
    fetch(b.file).then((r) => r.text()).then((src) => { source = src; frame.srcdoc = shell(src, b, shown); code.querySelector("code").textContent = src; });
    // Reload the preview only when the sample page under it actually changes.
    el.setSample = (next) => { if (next === shown || !READS_PAGE.has(b.id)) return; shown = next; if (source) frame.srcdoc = shell(source, b, shown); };
    codeBtn.addEventListener("click", () => {
      const show = code.hidden; code.hidden = !show; live.hidden = show; codeBtn.setAttribute("aria-pressed", String(show));
      fit(el);
    });
    const flash = (btn, text) => { const t = btn.textContent; btn.textContent = text; setTimeout(() => { btn.textContent = t; }, 1500); };
    copyBtn.addEventListener("click", async () => { try { await navigator.clipboard.writeText(source); flash(copyBtn, "Copied"); } catch { code.hidden = false; live.hidden = true; } });
    aiBtn.addEventListener("click", async () => { try { await navigator.clipboard.writeText(toAI(b, source)); flash(aiBtn, "Copied for your agent"); } catch { code.hidden = false; live.hidden = true; } });
    return el;
  }

  // Masonry: the grid has 12px rows; each card spans as many rows as its content needs,
  // so cards of different heights pack without gaps and keep their left-to-right order.
  const ROW = 12, GAP = 24;
  const fit = (card) => {
    const inner = card.querySelector(".card-inner");
    card.style.gridRowEnd = "span " + Math.ceil((inner.getBoundingClientRect().height + GAP) / ROW);
  };
  const fitAll = () => document.querySelectorAll(".card").forEach(fit);
  window.addEventListener("resize", fitAll);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitAll);

  // Each preview reports its content height; the card follows, then the masonry re-fits.
  window.addEventListener("message", (e) => {
    if (!e.data || typeof e.data.sabHeight !== "number") return;
    for (const f of document.querySelectorAll(".card iframe")) if (f.contentWindow === e.source) {
      f.style.height = Math.max(120, e.data.sabHeight + 2) + "px";
      fit(f.closest(".card"));
    }
  });
  fetch("blocks.json").then((r) => r.json()).then((data) => {
    const uses = data.uses || [];
    const params = new URLSearchParams(location.search);
    let current = uses.find((u) => u.id === params.get("use")) || null;
    const cards = data.blocks.map((b) => ({ b, el: card(b, current ? current.sample : data.sample) }));

    // One use at a time: its blocks show, most useful first; "All" shows every block, most used first.
    const show = (use) => {
      current = use;
      cards.forEach(({ b, el }, i) => {
        const at = use ? use.blocks.indexOf(b.id) : i;
        el.hidden = at < 0;
        el.style.order = at < 0 ? "" : at;
        el.setSample(use ? use.sample : data.sample);
      });
      for (const btn of usesNav.querySelectorAll("button")) btn.setAttribute("aria-pressed", String(btn.dataset.use === (use ? use.id : "")));
      blurb.textContent = use ? use.blurb : "Every block, most used first.";
      requestAnimationFrame(fitAll);
    };
    const chip = (id, label, count) => {
      const btn = document.createElement("button");
      btn.type = "button"; btn.dataset.use = id;
      btn.innerHTML = `${label} <span>${count}</span>`;
      btn.addEventListener("click", () => {
        const use = uses.find((u) => u.id === id) || null;
        const url = new URL(location.href);
        if (use) url.searchParams.set("use", use.id); else url.searchParams.delete("use");
        history.replaceState(null, "", url);
        show(use);
      });
      return btn;
    };
    usesNav.append(chip("", "All", data.blocks.length), ...uses.map((u) => chip(u.id, u.label, u.blocks.length)));
    for (const { el } of cards) grid.append(el);
    show(current);
  });

  // Live star count (public repos only; fails silently otherwise).
  fetch("https://api.github.com/repos/fengyiqicoder/static-ai-block").then((r) => r.ok ? r.json() : null).then((d) => {
    if (d && typeof d.stargazers_count === "number") document.getElementById("star-count").textContent = `★ ${d.stargazers_count.toLocaleString()}`;
  }).catch(() => {});
})();
