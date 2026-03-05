const input = document.getElementById("apiKey");
const status = document.getElementById("status");

// Load existing key
chrome.storage.sync.get("apiKey", (result) => {
  if (result.apiKey) {
    input.value = result.apiKey;
    status.textContent = "✓ Key saved";
  }
});

document.getElementById("save").addEventListener("click", () => {
  const key = input.value.trim();
  if (!key.startsWith("AIza")) {
    status.textContent = "⚠️ Key should start with AIza";
    status.style.color = "#f87171";
    return;
  }
  chrome.storage.sync.set({ apiKey: key }, () => {
    status.textContent = "✓ Saved! Please refresh your current page to start using the explainer.";
    status.style.color = "#a78bfa";
    input.style.borderColor = "#7c3aed";
  });
});
