"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type AssistResponse = {
  result: string;
  model?: string;
};

function truncate(text: string, max = 18000) {
  if (!text) return "";
  return text.length > max ? text.slice(0, max) : text;
}

export default function AgentUI() {
  const [pageText, setPageText] = useState("");
  const [url, setUrl] = useState("");
  const [task, setTask] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState<AssistResponse | null>(null);
  const taskRef = useRef<HTMLTextAreaElement | null>(null);

  // Accept payload from Chrome extension via postMessage or URL params
  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e?.data?.__agentic_payload) {
        const p = e.data.__agentic_payload as { pageText?: string; url?: string; task?: string };
        if (p.pageText) setPageText(truncate(p.pageText));
        if (p.url) setUrl(p.url);
        if (p.task) setTask(p.task);
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  useEffect(() => {
    const u = new URLSearchParams(window.location.search);
    const text = u.get("text");
    const taskQ = u.get("task");
    const pageUrl = u.get("url");
    if (text) setPageText(truncate(decodeURIComponent(text)));
    if (taskQ) setTask(decodeURIComponent(taskQ));
    if (pageUrl) setUrl(decodeURIComponent(pageUrl));
  }, []);

  const disabled = useMemo(() => !pageText || !task || loading, [pageText, task, loading]);

  const handleSubmit = async () => {
    setError(null);
    setLoading(true);
    setResponse(null);
    try {
      const res = await fetch("/api/assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pageText, url, task }),
      });
      if (!res.ok) {
        throw new Error(`Request failed: ${res.status}`);
      }
      const data = (await res.json()) as AssistResponse;
      setResponse(data);
    } catch (e: any) {
      setError(e?.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">Agentic Assistant</h1>
        <p className="text-slate-600">Paste or send the current page content from the Chrome extension, describe your goal, and let the agent help you complete the task.</p>
      </div>

      <div className="grid gap-4">
        <label className="text-sm font-medium">Page URL</label>
        <input
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
          placeholder="https://..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
      </div>

      <div className="grid gap-2">
        <label className="text-sm font-medium">Page Content</label>
        <textarea
          className="min-h-[160px] w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
          placeholder="Paste the visible text from the current tab..."
          value={pageText}
          onChange={(e) => setPageText(e.target.value)}
        />
        <div className="text-xs text-slate-500">Characters: {pageText.length}</div>
      </div>

      <div className="grid gap-2">
        <label className="text-sm font-medium">Your Goal</label>
        <textarea
          ref={taskRef}
          className="min-h-[100px] w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
          placeholder="Describe what you want to accomplish on this page..."
          value={task}
          onChange={(e) => setTask(e.target.value)}
        />
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={handleSubmit}
          disabled={disabled}
          className={`rounded-md px-4 py-2 text-sm font-medium text-white ${disabled ? "bg-slate-400" : "bg-slate-900 hover:bg-slate-800"}`}
        >
          {loading ? "Thinking..." : "Ask Agent"}
        </button>
        <a
          className="text-sm text-slate-600 underline"
          href="/extension/INSTALL.html"
          target="_blank"
        >
          Install Chrome Extension
        </a>
      </div>

      {error && (
        <div className="rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-800">
          {error}
        </div>
      )}

      {response?.result && (
        <div className="space-y-2">
          <div className="text-sm font-medium">Agent Response</div>
          <pre className="whitespace-pre-wrap rounded-md border border-slate-200 bg-slate-50 p-3 text-sm">
            {response.result}
          </pre>
        </div>
      )}
    </div>
  );
}
