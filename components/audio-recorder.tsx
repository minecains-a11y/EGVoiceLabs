"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Mic, Square, Play, Pause, Trash2, AlertCircle, CheckCircle2 } from "lucide-react";
import { formatTime } from "@/lib/utils";
import { AudioQualityCheck } from "@/lib/types";

interface AudioRecorderProps {
  onRecordingComplete: (blob: Blob, quality: AudioQualityCheck) => void;
  onDeleteSample?: () => void;
  minDurationSeconds?: number;
}

export function AudioRecorder({
  onRecordingComplete,
  onDeleteSample,
  minDurationSeconds = 5,
}: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [micLevel, setMicLevel] = useState(0);
  const [clippingWarning, setClippingWarning] = useState(false);
  const [noiseScore, setNoiseScore] = useState<"low" | "moderate" | "high">("low");
  const [micError, setMicError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const playbackAudioRef = useRef<HTMLAudioElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Audio level analyzer loop
  const updateAudioLevels = useCallback(() => {
    if (!analyserRef.current) return;
    const analyser = analyserRef.current;
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(dataArray);

    let sum = 0;
    let max = 0;
    for (let i = 0; i < dataArray.length; i++) {
      sum += dataArray[i];
      if (dataArray[i] > max) max = dataArray[i];
    }
    const avg = sum / dataArray.length;
    const normalizedLevel = Math.min(100, Math.round((avg / 128) * 100));
    setMicLevel(normalizedLevel);

    // Clipping alert
    if (max >= 250) {
      setClippingWarning(true);
    } else {
      setClippingWarning(false);
    }

    // Noise evaluation
    if (normalizedLevel < 12) {
      setNoiseScore("low");
    } else if (normalizedLevel < 25) {
      setNoiseScore("moderate");
    } else {
      setNoiseScore("high");
    }

    // Draw live oscilloscope canvas
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        const timeData = new Uint8Array(analyser.fftSize);
        analyser.getByteTimeDomainData(timeData);

        ctx.fillStyle = "#0A0A0A";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.lineWidth = 2;
        ctx.strokeStyle = clippingWarning ? "#FFFFFF" : "#A1A1AA";
        ctx.beginPath();

        const sliceWidth = canvas.width / timeData.length;
        let x = 0;
        for (let i = 0; i < timeData.length; i++) {
          const v = timeData[i] / 128.0;
          const y = (v * canvas.height) / 2;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
          x += sliceWidth;
        }
        ctx.lineTo(canvas.width, canvas.height / 2);
        ctx.stroke();
      }
    }

    animFrameRef.current = requestAnimationFrame(updateAudioLevels);
  }, [clippingWarning]);

  const startRecording = async () => {
    try {
      setMicError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: false,
          autoGainControl: false,
        },
      });

      // Web Audio Analysis setup
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 512;
      source.connect(analyser);

      audioContextRef.current = audioCtx;
      analyserRef.current = analyser;

      // MediaRecorder setup
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        setAudioBlob(blob);
        setAudioUrl(url);

        // Quality check evaluation
        const finalDuration = recordingTime;
        const issues: string[] = [];
        const recommendations: string[] = [];

        if (finalDuration < minDurationSeconds) {
          issues.push(`Recording is too short (${finalDuration}s). Minimum is ${minDurationSeconds}s.`);
          recommendations.push("Record at least 30-60 seconds for higher vocal nuance.");
        }
        if (clippingWarning) {
          issues.push("Clipping/Distortion detected: mic volume was too loud.");
          recommendations.push("Lower microphone gain or move 6-8 inches away from the mic.");
        }
        if (noiseScore === "high") {
          issues.push("High background room noise detected.");
          recommendations.push("Use a quieter room and eliminate fan/computer hum.");
        }

        const score = Math.max(
          40,
          100 - (issues.length * 20) - (clippingWarning ? 15 : 0)
        );

        const quality: AudioQualityCheck = {
          noiseLevel: noiseScore,
          clippingDetected: clippingWarning,
          durationSeconds: finalDuration,
          isAcceptable: issues.length <= 1 && finalDuration >= 3,
          sampleRate: audioCtx.sampleRate || 44100,
          score,
          issues,
          recommendations,
        };

        onRecordingComplete(blob, quality);
      };

      mediaRecorder.start(250);
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime((t) => t + 1);
      }, 1000);

      updateAudioLevels();
    } catch (err: any) {
      console.error("Mic access error:", err);
      setMicError(
        "Microphone access denied or unavailable. Please check browser permissions."
      );
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
    }
    if (timerRef.current) clearInterval(timerRef.current);
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);

    setIsRecording(false);
  };

  const deleteRecording = () => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioBlob(null);
    setAudioUrl(null);
    setRecordingTime(0);
    setIsPlaying(false);
    if (onDeleteSample) onDeleteSample();
  };

  const togglePlayback = () => {
    if (!playbackAudioRef.current || !audioUrl) return;
    if (isPlaying) {
      playbackAudioRef.current.pause();
      setIsPlaying(false);
    } else {
      playbackAudioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (audioContextRef.current) audioContextRef.current.close().catch(() => {});
    };
  }, []);

  return (
    <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 backdrop-blur-md">
      {micError && (
        <div className="mb-4 p-3 rounded-xl bg-zinc-500/10 border border-zinc-500/30 text-zinc-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{micError}</span>
        </div>
      )}

      {/* Recording Oscilloscope & Level Meter */}
      <div className="relative mb-4">
        <canvas
          ref={canvasRef}
          width={500}
          height={80}
          className="w-full h-20 rounded-xl bg-zinc-950/80 border border-zinc-800/80"
        />

        {/* Live dB meter overlay */}
        {isRecording && (
          <div className="absolute top-2 right-2 flex items-center gap-2 bg-black/60 px-2 py-1 rounded-lg backdrop-blur-sm border border-zinc-700/50">
            <span className="text-[10px] text-zinc-400 uppercase font-mono">Input:</span>
            <div className="w-16 h-2 bg-zinc-800 rounded-full overflow-hidden flex">
              <div
                className={`h-full transition-all duration-75 ${
                  clippingWarning ? "bg-zinc-500" : "bg-white"
                }`}
                style={{ width: `${micLevel}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Controls & Status Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Rec / Stop / Playback buttons */}
        <div className="flex items-center gap-3">
          {!isRecording && !audioUrl && (
            <button
              onClick={startRecording}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-black font-semibold text-xs shadow-lg shadow-zinc-600/20 hover:scale-105 active:scale-95 transition-all"
            >
              <Mic className="w-4 h-4 animate-pulse" />
              <span>Record Voice Sample</span>
            </button>
          )}

          {isRecording && (
            <button
              onClick={stopRecording}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-600 text-white font-semibold text-xs shadow-lg shadow-zinc-600/30 hover:bg-zinc-700 transition-all animate-pulse"
            >
              <Square className="w-4 h-4 fill-current" />
              <span>Stop Recording ({formatTime(recordingTime)})</span>
            </button>
          )}

          {audioUrl && !isRecording && (
            <>
              <audio
                ref={playbackAudioRef}
                src={audioUrl}
                onEnded={() => setIsPlaying(false)}
              />
              <button
                onClick={togglePlayback}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-black font-semibold text-xs hover:bg-zinc-200 transition-all shadow-md"
              >
                {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                <span>{isPlaying ? "Pause Preview" : "Play Recording"}</span>
              </button>

              <button
                onClick={deleteRecording}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-900/30 hover:text-zinc-400 text-zinc-400 text-xs font-medium transition-colors"
                title="Delete voice sample"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Sample</span>
              </button>
            </>
          )}
        </div>

        {/* Live Audio Quality Indicators */}
        <div className="flex items-center gap-4 text-xs font-medium">
          {clippingWarning && (
            <span className="flex items-center gap-1 text-zinc-400 bg-zinc-500/10 px-2.5 py-1 rounded-lg border border-zinc-500/20 animate-pulse">
              <AlertCircle className="w-3.5 h-3.5" /> Clipping Detected (Loud)
            </span>
          )}

          <div className="flex items-center gap-1.5 text-zinc-400">
            <span>Noise Floor:</span>
            <span
              className={`font-semibold capitalize ${
                noiseScore === "low"
                  ? "text-zinc-400"
                  : noiseScore === "moderate"
                  ? "text-zinc-400"
                  : "text-zinc-400"
              }`}
            >
              {noiseScore}
            </span>
          </div>

          {audioUrl && (
            <span className="flex items-center gap-1 text-zinc-400 bg-zinc-500/10 px-2.5 py-1 rounded-lg border border-zinc-500/20">
              <CheckCircle2 className="w-3.5 h-3.5" /> {formatTime(recordingTime)} captured
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
