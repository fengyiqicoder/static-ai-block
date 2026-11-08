# Static AI Block

[![Powered by OneTag AI](https://img.shields.io/badge/Powered%20by-OneTag%20AI-0b5fff)](https://onetagai.com/?ref=static-ai-block) [![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

**No install. Copy a block, paste it into any static page, replace one key. It works.**

Free AI blocks for static websites. Ask this page, summarize, explain a selection, translate, FAQ bot, draft a reply, rewrite, extract to JSON, smart search, alt text, quiz, explain code. Each block is plain HTML and vanilla JavaScript: copy it, paste it into any page, replace one key, it works. One script tag, no backend, no framework, no build step.

**Browse and try them:** https://fengyiqicoder.github.io/static-ai-block/

## How a block works

Every block loads the [OneTag AI](https://onetagai.com/?ref=static-ai-block) script and calls `onetag.ask(prompt, input, options)` from the browser. `input` can be a string, any element on the page (its text), a form, an image, or a plain object. Answers can stream in, or come back as parsed JSON with `json: true`.

```html
<script src="https://onetagai.com/v1.js" data-key="YOUR_ONETAG_KEY"></script>
<script type="module">
  const text = await onetag.ask("Summarize in 3 bullets", document.body);
</script>
```

## Get a key

Fill in your email at [onetagai.com](https://onetagai.com/?ref=static-ai-block), or run this; the key arrives in that inbox (one key per email):

```bash
curl -X POST https://onetagai.com/api/signup -H "Content-Type: application/json" -d '{"email":"you@example.com"}'
```

Every account gets 1,000,000 free tokens. The key is public by design, like an analytics ID: it can only spend that allowance. If an AI coding tool is adding a block for you, it can run that request with your email and ask you to paste the key.

## Blocks

| Block | What it does |
| --- | --- |
| Ask this page | A question box answered from the page's own content, with follow-ups |
| Summarize this page | Key points, one sentence, or a headline |
| Explain selection | Select text, an "Explain" button appears |
| Translate this page | Rewrites the main content in the visitor's browser language |
| FAQ bot | Answers only from the FAQ you wrote, says "I don't know" otherwise |
| Draft a reply | Paste a message, pick a tone, get a reply |
| Rewrite | Shorter, longer, formal, friendly |
| Extract to JSON | Messy text in, structured object out |
| Smart search | Describe what you want, matching items get highlighted |
| Describe an image | Alt text for a photo or any `<img>` |
| Quiz from content | Three multiple-choice questions from the page |
| Explain code | An "Explain" button on every code block |

## Add a block

Drop an `.html` file into `blocks/` whose first line is `<!-- Title: one-sentence description. -->`, keep the key comment and script tag at the top, run `node build.mjs`, and it appears in the gallery. Blocks should be self-contained: no dependencies, inline styles, under 60 lines.

## Powered by OneTag AI

Every block calls [OneTag AI](https://onetagai.com/?ref=static-ai-block) from the browser, so the site stays static: no server, no API key in the page, a free allowance of 1,000,000 tokens per account. The blocks are MIT; use them with OneTag or point them at your own compatible endpoint.

## License

MIT.
