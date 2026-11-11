"use client";

import { useEffect, useRef, useState } from "react";
import type { MouseEvent } from "react";
import { AudioLines, LoaderCircle, Volume2 } from "lucide-react";
import type { Voice } from "@/lib/types";
import { createDeviceSpeechUtterance, requestSpeech, SpeechRequestError } from "@/lib/tts-client";

interface VoicePreviewButtonProps {
  voice: Voice;
  className?: string;
  label?: string;
  playingLabel?: string;
  sampleText?: string;
  speed?: number;
  language?: string;
  browserOnly?: boolean;
}

export function VoicePreviewButton({
  voice,
  className = "",
  label,
  playingLabel = "Playing preview",
  sampleText,
  speed,
  language,
  browserOnly = false,
}: VoicePreviewButtonProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "playing">("idle");
  const [error, setError] = useState("");
  const [isDeviceVoice, setIsDeviceVoice] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const audioUrlRef = useRef<string | null>(null);
  const requestRef = useRef<AbortController | null>(null);

  const releaseAudio = () => {
    if (utteranceRef.current && typeof window !== "undefined" && "speechSynthesis" in window) {
      utteranceRef.current.onend = null;
      utteranceRef.current.onerror = null;
      window.speechSynthesis.cancel();
      utteranceRef.current = null;
    }
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
      audioRef.current = null;
    }
    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = null;
    }
  };

  useEffect(() => () => {
    requestRef.current?.abort();
    const audio = audioRef.current;
    audio?.pause();
    if (audio) audio.removeAttribute("src");
    if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
    if (utteranceRef.current && typeof window !== "undefined" && "speechSynthesis" in window) {
      utteranceRef.current.onend = null;
      utteranceRef.current.onerror = null;
      window.speechSynthesis.cancel();
    }
  }, []);

  const handlePreview = async (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setError("");

    if (status === "playing") {
      releaseAudio();
      setIsDeviceVoice(false);
      setStatus("idle");
      return;
    }

    if (status === "loading") return;

    const speakOnDevice = () => {
      const utterance = createDeviceSpeechUtterance(
        sampleText ?? `Hello, I am ${voice.name}. This is a live voice preview.`,
        voice,
        { speed: speed ?? voice.speed, language },
      );
      utteranceRef.current = utterance;
      utterance.onend = () => {
        utteranceRef.current = null;
        setStatus("idle");
        setIsDeviceVoice(false);
      };
      utterance.onerror = () => {
        utteranceRef.current = null;
        setStatus("idle");
        setIsDeviceVoice(false);
        setError("Device speech could not be played.");
      };
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
      setIsDeviceVoice(true);
      setStatus("playing");
      setError("Using your device's available speech voice.");
    };

    if (browserOnly) {
      try {
        speakOnDevice();
      } catch (deviceError) {
        setError(deviceError instanceof Error ? deviceError.message : "Device speech is not available.");
      }
      return;
    }

    setStatus("loading");
    const controller = new AbortController();
    requestRef.current = controller;

    try {
      const speech = await requestSpeech({
        voiceId: voice.id,
        speed: speed ?? voice.speed ?? 1,
        language,
        text: sampleText,
        preview: true,
        signal: controller.signal,
      });
      if (controller.signal.aborted) {
        URL.revokeObjectURL(speech.audioUrl);
        return;
      }

      audioUrlRef.current = speech.audioUrl;
      const audio = new Audio(speech.audioUrl);
      audioRef.current = audio;
      audio.addEventListener("ended", () => {
        releaseAudio();
        setStatus("idle");
      }, { once: true });
      audio.addEventListener("error", () => {
        releaseAudio();
        setStatus("idle");
        setError("Audio playback failed. Try the preview again.");
      }, { once: true });
      await audio.play();
      setStatus("playing");
    } catch (previewError) {
      if (controller.signal.aborted) return;
      releaseAudio();
      if (previewError instanceof SpeechRequestError && previewError.status === 502) {
        try {
          speakOnDevice();
          return;
        } catch {
          setError(previewError.message);
        }
      } else {
        setError(previewError instanceof Error ? previewError.message : "Preview could not be played.");
      }
      setStatus("idle");
    }
  };

  const isPlaying = status === "playing";
  const buttonLabel = status === "loading"
    ? "Preparing voice preview"
    : isPlaying
      ? isDeviceVoice ? "Playing on device" : playingLabel
      : label ?? "Preview voice";

  return (
    <>
      <button
        type="button"
        onClick={handlePreview}
        disabled={status === "loading"}
        className={`voice-preview-button inline-flex items-center justify-center gap-2 ${className}`}
        aria-label={buttonLabel}
        aria-pressed={isPlaying}
        data-state={status}
        title={error || buttonLabel}
      >
        {status === "loading" ? (
          <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
        ) : isPlaying ? (
          <AudioLines className="h-4 w-4 voice-preview-icon" aria-hidden="true" />
        ) : (
          <Volume2 className="h-4 w-4" aria-hidden="true" />
        )}
        {label && <span>{isPlaying ? isDeviceVoice ? "Playing on device" : playingLabel : status === "loading" ? "Preparing…" : label}</span>}
      </button>
      <span className="sr-only" role="status" aria-live="polite">{error}</span>
    </>
  );
}
