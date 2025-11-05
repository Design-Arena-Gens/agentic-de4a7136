// Extract visible text content with basic cleanup
function extractPageText() {
  const body = document.body;
  if (!body) return "";
  const walker = document.createTreeWalker(body, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const text = node.nodeValue || "";
      const trimmed = text.replace(/\s+/g, " ").trim();
      if (!trimmed) return NodeFilter.FILTER_REJECT;
      // Skip hidden elements
      const parent = node.parentElement;
      if (!parent) return NodeFilter.FILTER_ACCEPT;
      const style = window.getComputedStyle(parent);
      if (style && (style.display === "none" || style.visibility === "hidden")) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    }
  });
  const chunks = [];
  while (walker.nextNode()) {
    const txt = walker.currentNode.nodeValue || "";
    const cleaned = txt.replace(/\s+/g, " ").trim();
    if (cleaned) chunks.push(cleaned);
  }
  const combined = chunks.join(" \n");
  return combined.length > 180000 ? combined.slice(0, 180000) : combined;
}

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg?.type === "GET_PAGE_TEXT") {
    try {
      const text = extractPageText();
      sendResponse({ ok: true, text, url: location.href, title: document.title });
    } catch (e) {
      sendResponse({ ok: false, error: String(e) });
    }
  }
  return true;
});
