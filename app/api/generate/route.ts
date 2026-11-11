import { NextRequest, NextResponse } from "next/server";
import { moderateText, moderateVoiceCloneName } from "@/lib/moderation";
import { WATERMARK_SIGNATURE } from "@/lib/watermark";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, prompt, voice_id, model, params } = body;

    if (!prompt && type !== "isolate") {
      return NextResponse.json({ error: "Missing required prompt parameter" }, { status: 400 });
    }

    // 1. Content Moderation
    if (prompt) {
      const mod = moderateText(prompt, type === "music" ? "music" : type === "sfx" ? "sfx" : "tts");
      if (!mod.passed) {
        return NextResponse.json({ error: mod.reason, category: mod.category }, { status: 403 });
      }
    }

    // 2. Return mock generation response
    return NextResponse.json({
      id: `gen_api_${Date.now()}`,
      status: "completed",
      type: type || "tts",
      model: model || "egvl-multilingual-v2",
      prompt,
      watermarked: true,
      watermark_signature: WATERMARK_SIGNATURE,
      cost_credits: 50,
      audio_url: "https://media.egvoicelabs.com/samples/sample_output.wav",
      duration: 6.2,
      created_at: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
