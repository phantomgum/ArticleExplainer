let activeTooltip = null;

document.addEventListener("mouseup", (e) => {
  // Don't trigger if clicking inside an existing tooltip
  if (e.target.closest("#ae-tooltip")) return;

  setTimeout(() => {
    const selected = window.getSelection().toString().trim();
    if (selected.length < 5) {
      removeTooltip();
      return;
    }
    const articleContext = getArticleContext();
    showTooltip(selected, articleContext);
  }, 10);
});

document.addEventListener("mousedown", (e) => {
  if (!e.target.closest("#ae-tooltip")) {
    removeTooltip();
  }
});

function getArticleContext() {
  // Try to find the main article content, falling back progressively
  const selectors = ["article", "main", "[role='main']", ".post-content", ".article-body", ".entry-content", "body"];
  for (const sel of selectors) {
    const el = document.querySelector(sel);
    if (el) {
      return el.innerText.slice(0, 8000).trim();
    }
  }
  return document.body.innerText.slice(0, 8000);
}

function showTooltip(selectedText, context) {
  removeTooltip();

  const selection = window.getSelection();
  if (!selection.rangeCount) return;

  const range = selection.getRangeAt(0).getBoundingClientRect();
  const tooltip = document.createElement("div");
  tooltip.id = "ae-tooltip";
  tooltip.innerHTML = `
    <div id="ae-header">
      <span id="ae-title">✨ Article Explainer</span>
      <button id="ae-close">✕</button>
    </div>
    <div id="ae-selected-text">"${selectedText.length > 120 ? selectedText.slice(0, 120) + "…" : selectedText}"</div>
    <button id="ae-explain-btn">Explain this</button>
    <div id="ae-result"></div>
  `;

  // Position near selection
  const top = window.scrollY + range.bottom + 12;
  const left = Math.min(window.scrollX + range.left, window.innerWidth - 380);
  tooltip.style.top = `${top}px`;
  tooltip.style.left = `${Math.max(left, 8)}px`;

  document.body.appendChild(tooltip);
  activeTooltip = tooltip;

  document.getElementById("ae-close").addEventListener("click", removeTooltip);
  document.getElementById("ae-explain-btn").addEventListener("click", () => {
    runExplanation(selectedText, context);
  });
}

async function runExplanation(selectedText, context) {
  const btn = document.getElementById("ae-explain-btn");
  const result = document.getElementById("ae-result");
  if (!btn || !result) return;

  btn.disabled = true;
  btn.textContent = "Thinking…";
  result.textContent = "";

  const response = await chrome.runtime.sendMessage({
    type: "EXPLAIN",
    selectedText,
    context
  });

  btn.style.display = "none";

  if (response.error) {
    result.innerHTML = `<span class="ae-error">⚠️ ${response.error}</span>`;
  } else {
    result.textContent = response.explanation;
  }
}

function removeTooltip() {
  document.getElementById("ae-tooltip")?.remove();
  activeTooltip = null;
}