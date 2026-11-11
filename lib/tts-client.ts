import type { Voice } from "@/lib/types";

export const TTS_MODEL_NAME = "Gemini 3.8 Flash TTS";

export class SpeechRequestError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
    this.name = "SpeechRequestError";
  }
}

export interface SpeechRequestOptions {
  voiceId: string;
  text?: string;
  speed?: number;
  language?: string;
  expressiveness?: number;
  preview?: boolean;
  signal?: AbortSignal;
}

export interface SpeechFile {
  audioUrl: string;
  duration: number;
  creditsRemaining: number | null;
  costCredits: number;
}

export async function requestSpeech({
  signal,
  ...options
}: SpeechRequestOptions): Promise<SpeechFile> {
  const response = await fetch("/api/tts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(options),
    signal,
  });

  if (!response.ok) {
    const result = (await response.json().catch(() => null)) as { error?: string } | null;
    const providerMessage = result?.error || "Speech could not be generated. Please try again.";
    const message = response.status === 502 && /valid credit card/i.test(providerMessage)
      ? "AI Gateway needs an active payment method to generate downloadable speech. Device voice playback is available below."
      : providerMessage;
    throw new SpeechRequestError(message, response.status);
  }

  const audioBlob = await response.blob();
  if (!audioBlob.size) {
    throw new Error("The speech service returned an empty audio file.");
  }

  const durationHeader = Number(response.headers.get("x-audio-duration"));
  const creditsHeader = response.headers.get("x-credit-balance");
  const costHeader = Number(response.headers.get("x-credit-cost"));

  return {
    audioUrl: URL.createObjectURL(audioBlob),
    duration: Number.isFinite(durationHeader) && durationHeader > 0 ? durationHeader : 1,
    creditsRemaining: creditsHeader === null ? null : Number(creditsHeader),
    costCredits: Number.isFinite(costHeader) ? costHeader : 0,
  };
}

const browserLocaleByAccent: Record<string, string> = {
  American: "en-US",
  British: "en-GB",
  Australian: "en-AU",
  Scandinavian: "en-SE",
};

export function createDeviceSpeechUtterance(
  text: string,
  voice: Voice,
  options: { speed?: number; language?: string } = {},
) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    throw new Error("This browser does not support device speech.");
  }

  const language = options.language && options.language !== "auto"
    ? options.language
    : browserLocaleByAccent[voice.accent] ?? "en-US";
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = language;
  utterance.rate = Math.min(1.5, Math.max(0.7, options.speed ?? voice.speed ?? 1));
  utterance.pitch = Math.min(1.5, Math.max(0.5, voice.pitch ?? 1));

  const voices = window.speechSynthesis.getVoices();
  const locale = language.toLowerCase();
  const matchingVoice = voices.find((candidate) => candidate.lang.toLowerCase() === locale)
    ?? voices.find((candidate) => candidate.lang.toLowerCase().startsWith(locale.slice(0, 2)));
  if (matchingVoice) utterance.voice = matchingVoice;

  return utterance;
}
