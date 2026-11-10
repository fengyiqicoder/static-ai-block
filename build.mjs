// Reads blocks/*.html, writes blocks.json, one static page per block under b/, sitemap.xml and llms.txt.
// Run with `node build.mjs` after adding or editing a block.
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";

const SITE = "https://aiblock.onetagai.com";
const groups = {
	"ask-this-page": "Read", "summarize-page": "Read", "explain-selection": "Read", "translate-page": "Read",
	"faq-bot": "Chat", "draft-reply": "Write", "rewrite": "Write",
	"extract-json": "Extract", "smart-search": "Extract", "quiz": "Learn", "code-explain": "Learn",
	"describe-image": "See",
	"chat": "Chat", "chat-launcher": "Chat", "autocomplete": "Write", "voice-input": "Write", "read-aloud": "Read", "page-actions": "Read",
};
const order = ["Read", "Chat", "Write", "Extract", "See", "Learn"];
// What a block is for. The gallery shows one use at a time; inside a use the most useful block comes first.
// `sample` is the hidden page that the page-reading previews answer from while that use is selected.
const SAMPLE = "Sample page: a note on sourdough. A starter is flour and water left to ferment; it leavens bread with wild yeast. Feed it daily at room temperature or weekly in the fridge. A loaf needs about 20% starter, a 12 to 18 hour cold proof and a 250 °C oven with steam for the first 20 minutes.";
const uses = [
	{ id: "docs", label: "Docs", blurb: "Readers ask in plain words and get the answer from the page they are on. Previews read a sample install guide.",
		sample: "Sample docs page: Installing the Tidepool CLI. Requires Node 20 or newer. Install with npm install -g tidepool, then run tidepool login and paste the token from your dashboard. Config lives in tidepool.toml at the project root; the only required field is project. Run tidepool deploy to publish; add --dry-run to see what would change. On Windows use PowerShell 7; WSL is supported, cmd.exe is not. To uninstall, run npm uninstall -g tidepool and delete ~/.tidepool.",
		blocks: ["ask-this-page", "page-actions", "code-explain", "explain-selection", "summarize-page", "translate-page", "chat-launcher", "faq-bot", "read-aloud", "quiz"] },
	{ id: "shop", label: "Shop", blurb: "Answer pre-sale questions from the product page and let shoppers search the catalogue in plain words. Previews read a sample product page.",
		sample: "Sample product page: Merino beanie, grey, $38. 100% merino wool, 190 gsm, made in Portugal. One size, fits heads 54 to 60 cm. Hand wash cold and dry flat; do not tumble dry. In stock. Ships in 2 to 4 business days in the EU, 5 to 8 elsewhere; shipping is free over $80, otherwise $9 flat. 30-day returns, unused, in the original packaging. Also available in navy and black.",
		blocks: ["ask-this-page", "chat-launcher", "smart-search", "faq-bot", "translate-page", "chat", "describe-image", "extract-json"] },
	{ id: "landing", label: "Landing page", blurb: "Answer visitors' questions from your own copy before they leave. Previews read a sample product landing page.",
		sample: "Sample landing page: Paperboat, invoicing for freelancers. Send an invoice in 30 seconds, get paid by card or bank transfer, and let automatic reminders chase late payers. Free for up to 3 clients; Pro is $9 a month with unlimited clients and recurring invoices. No contract; export everything as CSV at any time. Works in the EU, UK and US. Not built for teams of more than 5 people or for inventory tracking.",
		blocks: ["faq-bot", "chat-launcher", "ask-this-page", "chat", "translate-page", "extract-json"] },
	{ id: "blog", label: "Blog", blurb: "Posts that summarize, translate and explain themselves. Previews read a sample post.",
		sample: SAMPLE,
		blocks: ["summarize-page", "ask-this-page", "translate-page", "read-aloud", "page-actions", "explain-selection", "chat-launcher", "code-explain", "quiz", "describe-image"] },
	{ id: "tools", label: "Tools", blurb: "Single-purpose pages: type, paste or dictate something in, get something useful out.",
		sample: SAMPLE,
		blocks: ["chat", "rewrite", "draft-reply", "autocomplete", "voice-input", "extract-json", "describe-image"] },
];
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// Page-reading previews run on a sample page: its first sentence is the heading, the rest are short paragraphs.
// The page sits off-screen, except under the blocks that change it or point at it. app.js has the same function.
const READS_PAGE = ["ask-this-page", "summarize-page", "explain-selection", "translate-page", "quiz", "code-explain", "chat-launcher", "read-aloud", "page-actions"];
const SHOWS_PAGE = ["translate-page", "chat-launcher", "read-aloud", "page-actions"];
const pageOf = (sample, b) => {
	const [head, ...rest] = sample.replace(/\.\s+/g, ".\n").split("\n"), paras = [];
	for (let i = 0; i < rest.length; i += 2) paras.push(rest.slice(i, i + 2).join(" "));
	const box = b.showsPage ? "max-width:600px;box-sizing:border-box;margin:0 0 14px;padding:12px 14px;background:#fff;border:1px dashed #99a2b5" : "position:absolute;left:-9999px;top:0;width:600px";
	return `<main${b.id === "chat-launcher" ? ' style="min-height:560px"' : ""}><article style="${box}"><h1 style="margin:0 0 6px;font-size:17px;line-height:1.3">${head}</h1>${paras.map((p) => `<p style="margin:0 0 6px;font-size:14px">${p}</p>`).join("")}</article>`;
};
// What "Copy to AI" puts in front of the block's source.
const aiIntro = (b) => (b.needsKey ? `Add this AI block to my site. It uses OneTag AI; docs for the API are at https://onetagai.com/llms.txt

1. Insert the block below into the page where it fits. Keep its markup and script as they are; adapt colors or fonts only if my site has a design system.
2. If I do not have a OneTag AI key yet: ask me for my email, then run
   curl -X POST https://onetagai.com/api/signup -H "Content-Type: application/json" -d '{"email":"MY_EMAIL"}'
   The key arrives in my inbox (one key per email). Ask me to paste it, then replace YOUR_ONETAG_KEY in the block with it. This key is designed to be public: it ships in the HTML like an analytics ID.
3. Open the page and try the block once. The free allowance is 1,000,000 tokens per account.
` : `Add this block to my site. It is plain HTML and JavaScript and needs no key, no API and no backend.

Insert the block below into the page where it fits. Keep its markup and script as they are; adapt colors or fonts only if my site has a design system. Then open the page and try it once.
`) + `\n--- Block: ${b.title} (${b.description}) ---\n`;

const blocks = readdirSync("blocks").filter((f) => f.endsWith(".html")).map((file) => {
	const source = readFileSync(`blocks/${file}`, "utf8");
	const m = source.match(/^<!--\s*([^:]+):\s*(.*?)\s*-->/);
	const id = file.replace(/\.html$/, "");
	const description = m ? m[2].trim().replace(/^./, (c) => c.toUpperCase()) : "";
	return { id, file: `blocks/${file}`, page: `b/${id}.html`, title: m ? m[1].trim() : id, description, group: groups[id] || "Other", uses: uses.filter((u) => u.blocks.includes(id)).map((u) => u.id), lines: source.split("\n").length, needsKey: source.includes("YOUR_ONETAG_KEY"), readsPage: READS_PAGE.includes(id), showsPage: SHOWS_PAGE.includes(id), source };
});
// Most-used first, per the 2026-11-03 survey of how AI is used on web pages (summarize, ask, chat, rewrite,
// translate, generate, extract) plus AI site search (the feature visitors meet most often).
const USAGE_ORDER = ["summarize-page", "ask-this-page", "chat", "faq-bot", "chat-launcher", "rewrite", "translate-page", "draft-reply", "autocomplete", "extract-json", "smart-search", "explain-selection", "page-actions", "read-aloud", "voice-input", "describe-image", "quiz", "code-explain"];
for (const b of blocks) if (!USAGE_ORDER.includes(b.id)) throw new Error(`${b.id} is missing from USAGE_ORDER`);
blocks.sort((a, b) => USAGE_ORDER.indexOf(a.id) - USAGE_ORDER.indexOf(b.id));
// Every block belongs to at least one use, and every use names only blocks that exist.
for (const b of blocks) if (!b.uses.length) throw new Error(`${b.id} has no use`);
for (const u of uses) for (const id of u.blocks) if (!blocks.some((b) => b.id === id)) throw new Error(`use ${u.id} names a missing block: ${id}`);
const usesOf = (b) => uses.filter((u) => b.uses.includes(u.id));
const titleOf = (id) => blocks.find((b) => b.id === id).title;

writeFileSync("blocks.json", JSON.stringify({ generated: new Date().toISOString().slice(0, 10), sample: SAMPLE, uses, blocks: blocks.map(({ source, ...b }) => b) }, null, 2) + "\n");

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
<meta name="description" content="${esc(b.description)} ${b.needsKey ? "Copy the block, paste it into any static page, replace one key." : "Copy the block and paste it into any static page; it needs no key."} Plain HTML and JavaScript, no backend.">
<link rel="canonical" href="${SITE}/${b.page}">
<link rel="icon" href="../favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="../style.css?v=20261110">
<script src="../config.js"></script>
</head>
<body>
<header class="page-top"><a class="brand" href="../">Static AI Block</a><nav class="side-links"><a href="../#blocks">All blocks</a><a href="../#get-key">Get a free key</a><a href="https://github.com/fengyiqicoder/static-ai-block">GitHub</a><a href="https://onetagai.com/?ref=static-ai-block">OneTag AI</a></nav></header>
<main class="page-main">
<h1>${esc(b.title)}</h1>
<p class="lede">${esc(b.description)} ${b.lines} lines of plain HTML and JavaScript. ${b.needsKey ? "Copy it, paste it into any static page, replace <code>YOUR_ONETAG_KEY</code> with a free key." : "Copy it and paste it into any static page. It needs no key."}</p>
<p class="note">Good for: ${usesOf(b).map((u) => `<a href="../?use=${u.id}#blocks">${esc(u.label)}</a>`).join(", ")}.</p>
<p class="actions"><button class="button" data-copy>Copy block</button> <button class="button secondary" data-ai>Copy to AI</button></p>
<div class="live"><iframe title="${esc(b.title)} (live)" sandbox="allow-scripts allow-same-origin allow-forms allow-modals allow-popups allow-popups-to-escape-sandbox" allow="microphone; clipboard-write"></iframe></div>
<h2>The code</h2>
<pre class="block-code"><code>${esc(b.source)}</code></pre>
${b.needsKey ? `<h2>Get a free key</h2>
<p>Fill in your email at <a href="https://onetagai.com/?ref=static-ai-block">onetagai.com</a>, or run this and the key arrives in your inbox (one key per email, 1,000,000 free tokens):</p>
<pre><code>curl -X POST https://onetagai.com/api/signup -H "Content-Type: application/json" -d '{"email":"you@example.com"}'</code></pre>` : ""}
<p class="note">All blocks: <a href="../">Static AI Block</a>. MIT. AI by <a href="https://onetagai.com/?ref=static-ai-block">OneTag AI</a>.</p>
</main>
<script>
  const source = document.querySelector(".block-code code").textContent;
  const pageHtml = ${JSON.stringify(b.readsPage ? pageOf(SAMPLE, b) : "<main>")};
  const key = window.AI_BLOCKS_PREVIEW_KEY || "YOUR_ONETAG_KEY";
  document.querySelector(".live iframe").srcdoc = \`<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{margin:0;padding:14px;background:#f5f7fb;font:15px/1.5 system-ui,sans-serif;color:#0b1020}</style></head><body>\` + pageHtml + source.replace(/YOUR_ONETAG_KEY/g, key) + \`</main><script>new ResizeObserver(() => parent.postMessage({ sabHeight: Math.ceil(document.body.getBoundingClientRect().height) }, "*")).observe(document.body);<\\/script></body></html>\`;
  window.addEventListener("message", (e) => { if (e.data && typeof e.data.sabHeight === "number") document.querySelector(".live iframe").style.height = Math.max(120, e.data.sabHeight + 2) + "px"; });
  const flash = (btn, text) => { const t = btn.textContent; btn.textContent = text; setTimeout(() => { btn.textContent = t; }, 1500); };
  document.querySelector("[data-copy]").addEventListener("click", async (e) => { try { await navigator.clipboard.writeText(source); flash(e.target, "Copied"); } catch {} });
  document.querySelector("[data-ai]").addEventListener("click", async (e) => {
    const text = ${JSON.stringify(aiIntro(b))} + source;
    try { await navigator.clipboard.writeText(text); flash(e.target, "Copied for your agent"); } catch {}
  });
</script>
</body>
</html>
`);
}

writeFileSync("sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n<url><loc>${SITE}/</loc></url>\n${blocks.map((b) => `<url><loc>${SITE}/${b.page}</loc></url>`).join("\n")}\n</urlset>\n`);
writeFileSync("robots.txt", `User-agent: *\nAllow: /\nSitemap: ${SITE}/sitemap.xml\n`);
writeFileSync("llms.txt", `# Static AI Block\n\n> Free copy-paste AI blocks for any static website. Each block is plain HTML and JavaScript that calls OneTag AI (https://onetagai.com/llms.txt) from the browser: one script tag, no backend. Paste a block into a page and replace YOUR_ONETAG_KEY with a free key (POST {"email"} to https://onetagai.com/api/signup; the key arrives by email). This key is designed to be public: it ships in the HTML like an analytics ID.\n\n## Blocks\n\n${blocks.map((b) => `- [${b.title}](${SITE}/${b.file}): ${b.description}`).join("\n")}\n\n## By use\n\n${uses.map((u) => `- ${u.label}: ${u.blocks.map(titleOf).join(", ")}`).join("\n")}\n`);
console.log(`${blocks.length} blocks → blocks.json, b/*.html, sitemap.xml, robots.txt, llms.txt`);
