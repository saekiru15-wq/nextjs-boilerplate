import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const key = (process.env.OPENAI_API_KEY || "").replace(/[\s\r\n\t]/g, "");
    if (!key) return NextResponse.json({ error: "OPENAI_API_KEY is not configured in Vercel." }, { status: 500 });
    const { message, history = [] } = await request.json();
    if (!message || typeof message !== "string") return NextResponse.json({ error: "message is required" }, { status: 400 });

    const input = [
      { role: "developer", content: "너는 학생을 돕는 학습도우미다. 정답만 던지기보다 개념, 사고과정, 힌트를 중심으로 설명하고 학생의 수준에 맞춰 한국어로 답한다." },
      ...history.slice(-12).map((m: { role: string; content: string }) => ({ role: m.role === "assistant" ? "assistant" : "user", content: m.content })),
      { role: "user", content: message },
    ];

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: "gpt-5.6-luna", input, max_output_tokens: 1200 }),
    });

    const raw = await response.text();
    let data: any = {};
    try { data = raw ? JSON.parse(raw) : {}; } catch { data = { error: raw || "OpenAI가 비어 있는 응답을 반환했습니다." }; }
    if (!response.ok) return NextResponse.json({ error: data?.error?.message || data?.error || "OpenAI request failed" }, { status: response.status });

    const text = data.output_text || data.output?.flatMap((x: any) => x.content || []).map((x: any) => x.text || "").join("\n") || "응답을 가져오지 못했어요.";
    return NextResponse.json({ text });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "AI 서버 오류가 발생했습니다." }, { status: 500 });
  }
}
