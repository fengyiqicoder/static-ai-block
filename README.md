# Static AI Block

[![Demo: the Summarize block answering](assets/demo.gif)](https://aiblock.onetagai.com/)

**Eighteen copy-paste AI blocks for any static website. Plain HTML and JavaScript, one script tag, no backend.**

Try every block live: **https://aiblock.onetagai.com/**

```html
<script src="https://onetagai.com/v1.js" data-key="YOUR_ONETAG_KEY"></script>
```

Using an AI coding tool? Paste this to it: *"Add a block from https://aiblock.onetagai.com/llms.txt to my site, sign me up for a OneTag AI key with my email, and wire it in."*

## Blocks

| Block | What it does |
| --- | --- |
| [Summarize this page](https://aiblock.onetagai.com/b/summarize-page.html) | Summarize this page in one click. |
| [Ask this page](https://aiblock.onetagai.com/b/ask-this-page.html) | Ask anything about this page and get an answer that cites its sources. |
| [Chat](https://aiblock.onetagai.com/b/chat.html) | A full AI chat with streaming Markdown, code blocks, saved conversations, retry, stop, voice input and feedback. |
| [FAQ bot](https://aiblock.onetagai.com/b/faq-bot.html) | Answers only from your FAQ, says "I don't know" otherwise. |
| [Chat launcher](https://aiblock.onetagai.com/b/chat-launcher.html) | A floating chat button in the corner that answers visitors from the page they are on. |
| [Rewrite](https://aiblock.onetagai.com/b/rewrite.html) | Improve, fix or restyle any text, then review the changes before you accept them. |
| [Translate this page](https://aiblock.onetagai.com/b/translate-page.html) | Translate the whole page in place, or show the translation under the original. |
| [Draft a reply](https://aiblock.onetagai.com/b/draft-reply.html) | Paste a message, get a reply in the tone you pick. |
| [Autocomplete](https://aiblock.onetagai.com/b/autocomplete.html) | Ghost-text suggestions while you type; press Tab to accept. |
| [Extract to JSON](https://aiblock.onetagai.com/b/extract-json.html) | Turn messy text into structured fields. |
| [Smart search](https://aiblock.onetagai.com/b/smart-search.html) | Search a list in plain words; matches light up. |
| [Explain any selection](https://aiblock.onetagai.com/b/explain-selection.html) | Select any text on the page to explain, simplify or translate it. |
| [Page actions](https://aiblock.onetagai.com/b/page-actions.html) | Copy this page as Markdown, or open it in ChatGPT or Claude. Uses no key and no tokens. |
| [Read aloud](https://aiblock.onetagai.com/b/read-aloud.html) | Listen to the page, or to a short AI summary of it. |
| [Voice input](https://aiblock.onetagai.com/b/voice-input.html) | Dictate with the microphone, then let AI tidy the transcript. |
| [Describe an image](https://aiblock.onetagai.com/b/describe-image.html) | Get alt text for any image. |
| [Quiz from this page](https://aiblock.onetagai.com/b/quiz.html) | Turn this page into a three-question quiz. |
| [Explain code](https://aiblock.onetagai.com/b/code-explain.html) | Adds an Explain button to every code block. |

Pick by what your site is; the gallery filters the same way.

| Your site | Blocks that fit |
| --- | --- |
| [Docs](https://aiblock.onetagai.com/?use=docs) | Ask this page, Page actions, Explain code, Explain any selection, Summarize this page, Translate this page, Chat launcher, FAQ bot, Read aloud, Quiz from this page |
| [Shop](https://aiblock.onetagai.com/?use=shop) | Ask this page, Chat launcher, Smart search, FAQ bot, Translate this page, Chat, Describe an image, Extract to JSON |
| [Landing page](https://aiblock.onetagai.com/?use=landing) | FAQ bot, Chat launcher, Ask this page, Chat, Translate this page, Extract to JSON |
| [Blog](https://aiblock.onetagai.com/?use=blog) | Summarize this page, Ask this page, Translate this page, Read aloud, Page actions, Explain any selection, Chat launcher, Explain code, Quiz from this page, Describe an image |
| [Tools](https://aiblock.onetagai.com/?use=tools) | Chat, Rewrite, Draft a reply, Autocomplete, Voice input, Extract to JSON, Describe an image |

Each block is one HTML file in [`blocks/`](blocks/): copy it, paste it into any page, replace `YOUR_ONETAG_KEY`. Page actions uses no AI, so it has no key to replace. The gallery's **Copy block** button copies the file; **Copy to AI** copies it together with the setup steps for Cursor, Claude Code or any coding agent.

## Get a free key

Fill in your email at [onetagai.com](https://onetagai.com/?ref=static-ai-block), or run this; the key arrives in that inbox (one key per email):

```bash
curl -X POST https://onetagai.com/api/signup -H "Content-Type: application/json" -d '{"email":"you@example.com"}'
```

Every account gets 1,000,000 free tokens. This key is designed to be public, like an analytics ID: it can only spend that allowance.

## How a block works

Every block loads the OneTag AI script and calls `onetag.ask(prompt, input, options)` from the browser. `input` can be a string, any element on the page (its text), a form, an image, or a plain object. Answers can stream in, or come back as parsed JSON with `json: true`; the chat blocks pass earlier turns as `history`. Nothing runs on your server; the site stays static.

## Add a block

Drop an `.html` file into `blocks/` whose first line is `<!-- Title: one-sentence description. -->`, keep the key comment and script tag at the top, run `node build.mjs`, and it appears in the gallery with its own page. Blocks should be self-contained: one file, no dependencies, inline styles. A block without the script tag is listed as needing no key.

## Powered by OneTag AI

The blocks call [OneTag AI](https://onetagai.com/?ref=static-ai-block) from the browser, so the site stays static: no server, no API key in the page, a free allowance of 1,000,000 tokens per account. The blocks are MIT; point them at any compatible endpoint if you run your own.

## See also

- [Astro AI Docs](https://github.com/fengyiqicoder/astro-ai-docs): a free Astro docs template whose pages answer questions about themselves.
- [Astro AI Landing Page](https://github.com/fengyiqicoder/astro-ai-landing): a free Astro + Tailwind landing page template with a fit check and an ask-the-page box.
- [starlight-onetag](https://github.com/fengyiqicoder/starlight-onetag): Ask AI for existing Starlight docs sites.

## License

MIT.
