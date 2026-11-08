// Reads blocks/*.html, takes the first comment line as the title and description, writes blocks.json.
// Run with `node build.mjs` after adding or editing a block.
import { readdirSync, readFileSync, writeFileSync } from "node:fs";

const groups = {
	"ask-this-page": "Read", "summarize-page": "Read", "explain-selection": "Read", "translate-page": "Read",
	"faq-bot": "Chat", "draft-reply": "Write", "rewrite": "Write",
	"extract-json": "Extract", "smart-search": "Extract", "quiz": "Learn", "code-explain": "Learn",
	"describe-image": "See",
};
const order = ["Read", "Chat", "Write", "Extract", "See", "Learn"];

const blocks = readdirSync("blocks").filter((f) => f.endsWith(".html")).map((file) => {
	const source = readFileSync(`blocks/${file}`, "utf8");
	const m = source.match(/^<!--\s*([^:]+):\s*(.*?)\s*-->/);
	const id = file.replace(/\.html$/, "");
	return { id, file: `blocks/${file}`, title: m ? m[1].trim() : id, description: m ? m[2].trim().replace(/^./, (c) => c.toUpperCase()) : "", group: groups[id] || "Other", lines: source.split("\n").length };
});
blocks.sort((a, b) => order.indexOf(a.group) - order.indexOf(b.group) || a.title.localeCompare(b.title));
writeFileSync("blocks.json", JSON.stringify({ generated: new Date().toISOString().slice(0, 10), blocks }, null, 2) + "\n");
console.log(`${blocks.length} blocks → blocks.json`);
