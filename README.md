# Static AI Block

[![Demo: the Summarize block answering](assets/demo.gif)](https://aiblock.onetagai.com/)

**Twelve copy-paste AI blocks for any static website. Plain HTML and JavaScript, one script tag, no backend.**

Try every block live: **https://aiblock.onetagai.com/**

```html
<script src="https://onetagai.com/v1.js" data-key="YOUR_ONETAG_KEY"></script>
```

Using an AI coding tool? Paste this to it: *"Add a block from https://aiblock.onetagai.com/llms.txt to my site, sign me up for a OneTag AI key with my email, and wire it in."*

## Blocks

| Block | What it does |
| --- | --- |
| [Summarize this page](https://aiblock.onetagai.com/b/summarize-page.html) | Summarize this page in one click. |
| [Ask this page](https://aiblock.onetagai.com/b/ask-this-page.html) | Ask anything about this page and get an answer from it. |
| [FAQ bot](https://aiblock.onetagai.com/b/faq-bot.html) | Answers only from your FAQ, says "I don't know" otherwise. |
| [Rewrite](https://aiblock.onetagai.com/b/rewrite.html) | Make any text shorter, longer, formal or friendly. |
| [Translate this page](https://aiblock.onetagai.com/b/translate-page.html) | Translate the whole page into another language. |
| [Draft a reply](https://aiblock.onetagai.com/b/draft-reply.html) | Paste a message, get a reply in the tone you pick. |
| [Extract to JSON](https://aiblock.onetagai.com/b/extract-json.html) | Turn messy text into structured fields. |
| [Smart search](https://aiblock.onetagai.com/b/smart-search.html) | Search a list in plain words; matches light up. |
| [Explain any selection](https://aiblock.onetagai.com/b/explain-selection.html) | Select any text on the page to get it explained. |
| [Describe an image](https://aiblock.onetagai.com/b/describe-image.html) | Get alt text for any image. |
| [Quiz from this page](https://aiblock.onetagai.com/b/quiz.html) | Turn this page into a three-question quiz. |
| [Explain code](https://aiblock.onetagai.com/b/code-explain.html) | Adds an Explain button to every code block. |

Pick by what your site is; the gallery filters the same way.

| Your site | Blocks that fit |
| --- | --- |
| [Docs](https://aiblock.onetagai.com/?use=docs) | Ask this page, Explain code, Explain any selection, Summarize this page, Translate this page, FAQ bot, Quiz from this page |
| [Shop](https://aiblock.onetagai.com/?use=shop) | Ask this page, Smart search, FAQ bot, Translate this page, Describe an image, Extract to JSON |
| [Landing page](https://aiblock.onetagai.com/?use=landing) | FAQ bot, Ask this page, Translate this page, Extract to JSON |
| [Blog](https://aiblock.onetagai.com/?use=blog) | Summarize this page, Ask this page, Translate this page, Explain any selection, Explain code, Quiz from this page, Describe an image |
| [Tools](https://aiblock.onetagai.com/?use=tools) | Rewrite, Draft a reply, Extract to JSON, Describe an image |

Each block is one HTML file in [`blocks/`](blocks/): copy it, paste it into any page, replace `YOUR_ONETAG_KEY`. The gallery's **Copy block** button copies the file; **Copy to AI** copies it together with the setup steps for Cursor, Claude Code or any coding agent.

## Get a free key

Fill in your email at [onetagai.com](https://onetagai.com/?ref=static-ai-block), or run this; the key arrives in that inbox (one key per email):

```bash
curl -X POST https://onetagai.com/api/signup -H "Content-Type: application/json" -d '{"email":"you@example.com"}'
```

Every account gets 1,000,000 free tokens. This key is designed to be public, like an analytics ID: it can only spend that allowance.

## How a block works

Every block loads the OneTag AI script and calls `onetag.ask(prompt, input, options)` from the browser. `input` can be a string, any element on the page (its text), a form, an image, or a plain object. Answers can stream in, or come back as parsed JSON with `json: true`. Nothing runs on your server; the site stays static.

## Add a block

Drop an `.html` file into `blocks/` whose first line is `<!-- Title: one-sentence description. -->`, keep the key comment and script tag at the top, run `node build.mjs`, and it appears in the gallery with its own page. Blocks should be self-contained: no dependencies, inline styles, under 60 lines.

## Powered by OneTag AI

The blocks call [OneTag AI](https://onetagai.com/?ref=static-ai-block) from the browser, so the site stays static: no server, no API key in the page, a free allowance of 1,000,000 tokens per account. The blocks are MIT; point them at any compatible endpoint if you run your own.

## See also

- [Astro AI Docs](https://github.com/fengyiqicoder/astro-ai-docs): a free Astro docs template whose pages answer questions about themselves.
- [Astro AI Landing Page](https://github.com/fengyiqicoder/astro-ai-landing): a free Astro + Tailwind landing page template with a fit check and an ask-the-page box.
- [starlight-onetag](https://github.com/fengyiqicoder/starlight-onetag): Ask AI for existing Starlight docs sites.

## License

MIT.
