// Reads blocks/*.html, writes blocks.json, one static page per block under b/, sitemap.xml and llms.txt.
// Run with `node build.mjs` after adding or editing a block.
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";

const SITE = "https://fengyiqicoder.github.io/static-ai-block";
const groups = {
	"ask-this-page": "Read", "summarize-page": "Read", "explain-selection": "Read", "translate-page": "Read",
	"faq-bot": "Chat", "draft-reply": "Write", "rewrite": "Write",
	"extract-json": "Extract", "smart-search": "Extract", "quiz": "Learn", "code-explain": "Learn",
	"describe-image": "See",
};
const order = ["Read", "Chat", "Write", "Extract", "See", "Learn"];
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const blocks = readdirSync("blocks").filter((f) => f.endsWith(".html")).map((file) => {
	const source = readFileSync(`blocks/${file}`, "utf8");
	const m = source.match(/^<!--\s*([^:]+):\s*(.*?)\s*-->/);
	const id = file.replace(/\.html$/, "");
	const description = m ? m[2].trim().replace(/^./, (c) => c.toUpperCase()) : "";
	return { id, file: `blocks/${file}`, page: `b/${id}.html`, title: m ? m[1].trim() : id, description, group: groups[id] || "Other", lines: source.split("\n").length, source };
});
blocks.sort((a, b) => order.indexOf(a.group) - order.indexOf(b.group) || a.title.localeCompare(b.title));

writeFileSync("blocks.json", JSON.stringify({ generated: new Date().toISOString().slice(0, 10), blocks: blocks.map(({ source, ...b }) => b) }, null, 2) + "\n");

// One page per block: the code is in the HTML source, so search engines and AI tools can read it.
mkdirSync("b", { recursive: true });
for (const b of blocks) {
	const title = `${b.title}: free AI block for any static website | Static AI Block`;
	writeFileSync(b.page, `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(b.description)} Copy the block, paste it into any static page, replace one key. Plain HTML and JavaScript, no backend.">
<link rel="canonical" href="${SITE}/${b.page}">
<link rel="icon" href="../favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="../style.css?v=20261108b">
<script src="../config.js"></script>
</head>
<body>
<header class="page-top"><a class="brand" href="../">Static AI Block</a><nav class="side-links"><a href="../#blocks">All blocks</a><a href="../#get-key">Get a free key</a><a href="https://github.com/fengyiqicoder/static-ai-block">GitHub</a></nav></header>
<main class="page-main">
<h1>${esc(b.title)}</h1>
<p class="lede">${esc(b.description)} ${b.lines} lines of plain HTML and JavaScript. Copy it, paste it into any static page, replace <code>YOUR_ONETAG_KEY</code> with a free key.</p>
<p class="actions"><button class="button" data-copy>Copy block</button> <button class="button secondary" data-ai>Copy to AI</button></p>
<div class="live"><iframe title="${esc(b.title)} (live)" sandbox="allow-scripts allow-same-origin allow-forms allow-modals"></iframe></div>
<h2>The code</h2>
<pre class="block-code"><code>${esc(b.source)}</code></pre>
<h2>Get a free key</h2>
<p>Fill in your email at <a href="https://onetagai.com/?ref=static-ai-block">onetagai.com</a>, or run this and the key arrives in your inbox (one key per email, 1,000,000 free tokens):</p>
<pre><code>curl -X POST https://onetagai.com/api/signup -H "Content-Type: application/json" -d '{"email":"you@example.com"}'</code></pre>
<p class="note">All blocks: <a href="../">Static AI Block</a>. MIT. AI by <a href="https://onetagai.com/?ref=static-ai-block">OneTag AI</a>.</p>
</main>
<script>
  const source = document.querySelector(".block-code code").textContent;
  const readsPage = ${JSON.stringify(["ask-this-page","summarize-page","explain-selection","translate-page","quiz","code-explain"].includes(b.id))};
  const key = window.AI_BLOCKS_PREVIEW_KEY || "YOUR_ONETAG_KEY";
  document.querySelector(".live iframe").srcdoc = \`<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{margin:0;padding:14px;background:#f5f7fb;font:15px/1.5 system-ui,sans-serif;color:#0b1020}</style></head><body><main>\` + (readsPage ? \`<p style="position:absolute;left:-9999px;top:0">Sample page: a note on sourdough. A starter is flour and water left to ferment; it leavens bread with wild yeast. Feed it daily at room temperature or weekly in the fridge. A loaf needs about 20% starter, a 12 to 18 hour cold proof and a 250 °C oven with steam for the first 20 minutes.</p>\` : "") + source.replace(/YOUR_ONETAG_KEY/g, key) + \`</main><script>new ResizeObserver(() => parent.postMessage({ sabHeight: document.documentElement.scrollHeight }, "*")).observe(document.body);<\/script></body></html>\`;
  window.addEventListener("message", (e) => { if (e.data && typeof e.data.sabHeight === "number") document.querySelector(".live iframe").style.height = Math.max(180, e.data.sabHeight + 4) + "px"; });
  const flash = (btn, text) => { const t = btn.textContent; btn.textContent = text; setTimeout(() => { btn.textContent = t; }, 1500); };
  document.querySelector("[data-copy]").addEventListener("click", async (e) => { try { await navigator.clipboard.writeText(source); flash(e.target, "Copied"); } catch {} });
  document.querySelector("[data-ai]").addEventListener("click", async (e) => {
    const text = \`Add this AI block to my site. It uses OneTag AI; docs for the API are at https://onetagai.com/llms.txt

1. Insert the block below into the page where it fits. Keep its markup and script as they are; adapt colors or fonts only if my site has a design system.
2. If I do not have a OneTag AI key yet: ask me for my email, then run
   curl -X POST https://onetagai.com/api/signup -H "Content-Type: application/json" -d '{"email":"MY_EMAIL"}'
   The key arrives in my inbox (one key per email). Ask me to paste it, then replace YOUR_ONETAG_KEY in the block with it.
3. Open the page and try the block once. The free allowance is 1,000,000 tokens per account.

--- Block: ${esc(b.title)} ---
\` + source;
    try { await navigator.clipboard.writeText(text); flash(e.target, "Copied for your agent"); } catch {}
  });
</script>
</body>
</html>
`);
}

writeFileSync("sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n<url><loc>${SITE}/</loc></url>\n${blocks.map((b) => `<url><loc>${SITE}/${b.page}</loc></url>`).join("\n")}\n</urlset>\n`);
writeFileSync("robots.txt", `User-agent: *\nAllow: /\nSitemap: ${SITE}/sitemap.xml\n`);
writeFileSync("llms.txt", `# Static AI Block\n\n> Free copy-paste AI blocks for any static website. Each block is plain HTML and JavaScript that calls OneTag AI (https://onetagai.com/llms.txt) from the browser: one script tag, no backend. Paste a block into a page and replace YOUR_ONETAG_KEY with a free key (POST {"email"} to https://onetagai.com/api/signup; the key arrives by email).\n\n## Blocks\n\n${blocks.map((b) => `- [${b.title}](${SITE}/${b.file}): ${b.description}`).join("\n")}\n`);
console.log(`${blocks.length} blocks → blocks.json, b/*.html, sitemap.xml, robots.txt, llms.txt`);
