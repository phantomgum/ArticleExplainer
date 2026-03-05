# ✨ Article Explainer

A Chrome extension that lets you highlight any text on a webpage and instantly get an AI-powered explanation — with the full article used as context, so answers are always relevant to what you're reading.
---

## Demo

1. Highlight any text on an article
2. Click **Explain this** in the tooltip that appears
3. Get a concise, context-aware explanation instantly

---

## Features

- 🖱️ **Select & explain** — highlight any text to trigger the tooltip
- 📄 **Full article context** — sends up to 8,000 characters of page content to the AI so explanations are grounded in what you're reading
- 🔑 **Secure key storage** — your API key is stored locally in Chrome's sync storage, never sent anywhere except the Gemini API
- 🎨 **Clean UI** — minimal dark tooltip that stays out of your way
- ⚡ **Fast** — uses Gemini 1.5 Flash, optimized for low latency

---

## Installation

### 1. Clone the repo
```bash
git clone https://github.com/yourusername/article-explainer.git
cd article-explainer
```

### 2. Load into Chrome
1. Go to `chrome://extensions`
2. Enable **Developer Mode** (toggle in the top right)
3. Click **Load unpacked** → select the `article-explainer` folder
4. The extension will appear in your toolbar

### 3. Add your API key
1. Click the extension icon in your toolbar (pin it via the 🧩 puzzle icon first)
2. Paste your Google Gemini API key
3. Click **Save Key**

> Get a free Gemini API key at [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)

---

## File Structure

```
article-explainer/
├── manifest.json      # Extension configuration (Manifest V3)
├── background.js      # Service worker — handles Gemini API calls
├── content.js         # Runs on every page, detects text selection & shows tooltip
├── popup.html         # Settings UI (API key input)
├── popup.js           # Settings logic
└── styles.css         # Tooltip styling
```

---

## How It Works

1. `content.js` listens for `mouseup` events and reads the selected text
2. It also scrapes the page's article content (`<article>`, `<main>`, or `<body>`) for context
3. When you click **Explain this**, it sends both to `background.js` via `chrome.runtime.sendMessage`
4. `background.js` calls the Gemini API with a prompt containing the full article context + selected passage
5. The explanation is returned and rendered in the tooltip

---

## Development

After editing any file, reload the extension without re-uploading:

1. Go to `chrome://extensions`
2. Click the **↺ refresh icon** on the extension card
3. Refresh your test page

To debug, click the **Service worker** link on the extension card to open the background console.

---

## Configuration

| Setting | Location | Default |
|---|---|---|
| API Key | Extension popup | — |
| Model | `background.js` | `gemini-1.5-flash` |
| Max context length | `content.js` | 8,000 chars |
| Max output tokens | `background.js` | 400 tokens |

---

## Roadmap

- [ ] Streaming responses (word-by-word rendering)
- [ ] Keyboard shortcut to trigger explanation
- [ ] Support for additional LLM providers (OpenAI, Claude)
- [ ] Right-click context menu option
- [ ] Explanation history per page

---

## License

MIT