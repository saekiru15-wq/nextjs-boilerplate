import { NextRequest, NextResponse } from "next/server";

const ALLOWED_MODELS = new Set(["gemini-2.5-flash-lite", "gemini-2.5-pro"]);

export async function POST(request: NextRequest) {
  try {
    const key = (process.env.GEMINI_API_KEY || "").replace(/[\s\r\n\t]/g, "");
    if (!key) return NextResponse.json({ error: "GEMINI_API_KEY is not configured in Vercel." }, { status: 500 });

    const { message, history = [], model = "gemini-2.5-flash-lite" } = await request.json();
    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "message is required" }, { status: 400 });
    }

    const selectedModel = ALLOWED_MODELS.has(model) ? model : "gemini-2.5-flash-lite";
    const contents = [
      ...history.slice(-12).map((m: { role: string; content: string }) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: String(m.content || "") }],
      })),
      { role: "user", parts: [{ text: message }] },
    ];

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent?key=${encodeURIComponent(key)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{
              text: "너는 학생을 돕는 학습도우미다. 정답만 던지기보다 개념, 사고과정, 힌트를 중심으로 설명하고 학생의 수준에 맞춰 한국어로 답한다. 필요한 경우 단계별로 설명한다.",
            }],
          },
          contents,
          generationConfig: { maxOutputTokens: 1200 },
        }),
      },
    );

    const raw = await response.text();
    let data: any = {};
    try {
      data = raw ? JSON.parse(raw) : {};
    } catch {
      data = { error: raw || "Gemini가 비어 있는 응답을 반환했습니다." };
    }

    if (!response.ok) {
      const message = data?.error?.message || data?.error || "Gemini request failed";
      return NextResponse.json({ error: message }, { status: response.status });
    }

    const text = data?.candidates?.[0]?.content?.parts
      ?.map((p: any) => p?.text || "")
      .join("\n")
      .trim();

    if (!text) return NextResponse.json({ error: "Gemini 응답에 내용이 없습니다." }, { status: 502 });
    return NextResponse.json({ text, model: selectedModel });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "AI 서버 오류가 발생했습니다." }, { status: 500 });
  }
}
