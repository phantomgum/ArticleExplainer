chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "EXPLAIN") {
    handleExplain(message.selectedText, message.context)
      .then(sendResponse)
      .catch(err => sendResponse({ error: err.message }));
    return true; // Keep message channel open for async response
  }

  if (message.type === "GET_KEY") {
    chrome.storage.sync.get("apiKey", (result) => {
      sendResponse({ apiKey: result.apiKey || "" });
    });
    return true;
  }
});

async function handleExplain(selectedText, context) {
  const stored = await chrome.storage.sync.get("apiKey");
  const apiKey = stored.apiKey;

  if (!apiKey) {
    return { error: "No API key set. Click the extension icon to add your Google Gemini API key." };
  }

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `You are a helpful reading assistant. Below is the context of an article the user is reading, followed by a specific passage they want explained.

ARTICLE CONTEXT:
${context}

---

SELECTED PASSAGE TO EXPLAIN:
"${selectedText}"

Explain this passage clearly and concisely in 2-4 sentences. Use the article context to inform your explanation. Speak directly to the reader.`
          }]
        }],
        generationConfig: {
          maxOutputTokens: 400,
          temperature: 0.5
        }
      })
    }
  );

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || `API error ${res.status}`);
  }

  const data = await res.json();
  const explanation = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!explanation) {
    throw new Error("No response from Gemini. Please try again.");
  }

  return { explanation };
}