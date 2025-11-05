const API_URL = "https://agentic-de4a7136.vercel.app/api/assist";

async function getActiveTabPageText() {
  return new Promise((resolve) => {
    try {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const tab = tabs?.[0];
        if (!tab?.id) return resolve({ ok: false, error: "No active tab" });
        chrome.tabs.sendMessage(tab.id, { type: "GET_PAGE_TEXT" }, (resp) => {
          if (chrome.runtime.lastError) {
            resolve({ ok: false, error: chrome.runtime.lastError.message });
          } else {
            resolve(resp);
          }
        });
      });
    } catch (e) {
      resolve({ ok: false, error: String(e) });
    }
  });
}

async function callAgent(pageText, url, task) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ pageText, url, task })
  });
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json();
}

async function main() {
  const runBtn = document.getElementById("run");
  const goalEl = document.getElementById("goal");
  const respEl = document.getElementById("resp");

  runBtn.addEventListener("click", async () => {
    runBtn.disabled = true;
    respEl.textContent = "Thinking...";
    try {
      const task = goalEl.value.trim();
      if (!task) throw new Error("Please enter a goal");
      const info = await getActiveTabPageText();
      if (!info?.ok) throw new Error(info?.error || "Failed to get page text");
      const data = await callAgent(info.text, info.url, task);
      respEl.textContent = data?.result || "No response";
    } catch (e) {
      respEl.textContent = String(e);
    } finally {
      runBtn.disabled = false;
    }
  });
}

main();
