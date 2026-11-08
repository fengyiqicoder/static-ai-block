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
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:wght@400;500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="../style.css?v=20261108">
<script src="../config.js"></script>
</head>
<body class="page">
<header class="page-top"><a class="brand" href="../"><span class="mark" aria-hidden="true"></span>Static AI Block</a><nav class="side-links"><a href="../#get-key">Get a free key</a><a href="https://github.com/fengyiqicoder/static-ai-block">GitHub</a></nav></header>
<main class="page-main">
<h1>${esc(b.title)}</h1>
<p class="lede">${esc(b.description)} ${b.lines} lines of plain HTML and JavaScript. Copy it, paste it into any static page, replace <code>YOUR_ONETAG_KEY</code> with a free key.</p>
<p><button class="primary" data-copy>Copy block</button> <a class="ghost" href="../#${b.id}">Try it live</a></p>
<pre class="block-code"><code>${esc(b.source)}</code></pre>
<h2>Get a free key</h2>
<p>Fill in your email at <a href="https://onetagai.com/?ref=static-ai-block">onetagai.com</a>, or run this and the key arrives in your inbox (one key per email, 1,000,000 free tokens):</p>
<pre><code>curl -X POST https://onetagai.com/api/signup -H "Content-Type: application/json" -d '{"email":"you@example.com"}'</code></pre>
<p class="note">All blocks: <a href="../">Static AI Block</a>. MIT. AI by <a href="https://onetagai.com/?ref=static-ai-block">OneTag AI</a>.</p>
</main>
<script>
  document.querySelector("[data-copy]").addEventListener("click", async (e) => {
    const code = document.querySelector(".block-code code").textContent;
    try { await navigator.clipboard.writeText(code); e.target.textContent = "Copied"; setTimeout(() => { e.target.textContent = "Copy block"; }, 1500); } catch {}
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
