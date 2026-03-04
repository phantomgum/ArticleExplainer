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
      return { error: "No API key set. Click the extension icon to add your Anthropic API key." };
    }
  
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 400,
        messages: [{
          role: "user",
          content: `You are a helpful reading assistant. Below is the context of an article the user is reading, followed by a specific passage they want explained.
  
  ARTICLE CONTEXT:
  ${context}
  
  ---
  
  SELECTED PASSAGE TO EXPLAIN:
  "${selectedText}"
  
  Explain this passage clearly and concisely in 2-4 sentences. Use the article context to inform your explanation. Speak directly to the reader.`
        }]
      })
    });
  
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error?.message || `API error ${res.status}`);
    }
  
    const data = await res.json();
    return { explanation: data.content[0].text };
  }