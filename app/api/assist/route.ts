import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

export async function POST(req: NextRequest) {
  try {
    const { pageText, url, task } = (await req.json()) as {
      pageText?: string;
      url?: string;
      task?: string;
    };

    if (!pageText || !task) {
      return NextResponse.json({ error: "Missing pageText or task" }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;

    const prompt = `You are a helpful browsing agent. The user wants to complete a task on the current web page. Analyze the provided page text and produce:
- A concise understanding of the page
- A step-by-step plan that can be followed by a human
- Helpful notes about pitfalls, needed context, or missing information
- If the task cannot be completed from the provided page, suggest what to do next

Page URL: ${url || "(unknown)"}
Task: ${task}

--- Page Text (truncated) ---\n${pageText.slice(0, 18000)}`;

    let result = "";

    if (apiKey) {
      const openai = new OpenAI({ apiKey });
      const completion = await openai.chat.completions.create({
        model,
        messages: [
          { role: "system", content: "You assist with web browsing tasks succinctly and precisely." },
          { role: "user", content: prompt },
        ],
        temperature: 0.2,
      });
      result = completion.choices?.[0]?.message?.content || "";
    } else {
      // Fallback when no API key is configured
      result = `AI is not configured (missing OPENAI_API_KEY). Here's a deterministic checklist based on your inputs.\n\n1) Understand the page: Skim headings, key buttons, and forms.\n2) Locate relevant elements: Use the page text to find sections that mention your goal.\n3) Take action: Click the appropriate buttons/links or fill forms.\n4) Validate outcome: Confirm the page reflects the intended change.\n\nPage: ${url || "(unknown)"}\nTask: ${task}\n\nTip: Install and use the Chrome extension to capture accurate page content.`;
    }

    return NextResponse.json({ result, model });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Unknown error" }, { status: 500 });
  }
}
