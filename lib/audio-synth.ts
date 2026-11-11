import { WATERMARK_SIGNATURE } from "./watermark";

/**
 * Encodes audio PCM data (Float32Array) to a valid 16-bit PCM RIFF WAV ArrayBuffer
 * and embeds the EGVL invisible watermark in the RIFF metadata chunk.
 */
export function encodeWAV(
  samples: Float32Array,
  sampleRate: number = 44100,
  numChannels: number = 1
): ArrayBuffer {
  const bytesPerSample = 2;
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = samples.length * bytesPerSample;
  const watermarkBytes = new TextEncoder().encode(WATERMARK_SIGNATURE);
  const metadataChunkSize = 8 + watermarkBytes.length; // 'INFO' chunk
  const bufferSize = 44 + dataSize + metadataChunkSize;

  const buffer = new ArrayBuffer(bufferSize);
  const view = new DataView(buffer);

  // Helper to write ASCII strings
  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  // 1. RIFF Chunk Descriptor
  writeString(0, "RIFF");
  view.setUint32(4, 36 + dataSize + metadataChunkSize, true); // Total file size minus 8
  writeString(8, "WAVE");

  // 2. "fmt " Sub-chunk
  writeString(12, "fmt ");
  view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
  view.setUint16(20, 1, true); // AudioFormat (1 = PCM)
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, 16, true); // BitsPerSample (16 bits)

  // 3. "data" Sub-chunk
  writeString(36, "data");
  view.setUint32(40, dataSize, true);

  // Write PCM audio samples (float32 to 16-bit signed integer)
  let offset = 44;
  for (let i = 0; i < samples.length; i++, offset += 2) {
    let s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }

  // 4. Append Watermark Metadata Sub-chunk ("LIST" -> "INFO" -> "ISFT")
  writeString(offset, "EGVL");
  view.setUint32(offset + 4, watermarkBytes.length, true);
  offset += 8;
  for (let i = 0; i < watermarkBytes.length; i++, offset++) {
    view.setUint8(offset, watermarkBytes[i]);
  }

  return buffer;
}

export function bufferToDataUrl(buffer: ArrayBuffer, mimeType: string = "audio/wav"): string {
  const blob = new Blob([buffer], { type: mimeType });
  return URL.createObjectURL(blob);
}

/**
 * Synthesizes a TTS Voice sentence or SSML-infused speech audio
 */
export function synthesizeTTSVoice(
  text: string,
  params: {
    voicePitch?: number; // 0.6 - 1.4
    speed?: number; // 0.8 - 1.5
    stability?: number;
    similarity?: number;
    styleExaggeration?: number;
    tone?: string;
  } = {}
): { audioUrl: string; duration: number } {
  const sampleRate = 44100;
  const wordCount = Math.max(1, text.trim().split(/\s+/).length);
  const baseSpeed = params.speed || 1.0;
  // Average reading speed: ~3 words per second
  const approxDuration = Math.min(60, Math.max(1.8, (wordCount * 0.38) / baseSpeed));
  const numSamples = Math.floor(sampleRate * approxDuration);
  const samples = new Float32Array(numSamples);

  // Pitch base frequency
  const basePitch = (params.voicePitch || 1.0) * (params.tone === "deep" ? 110 : params.tone === "raspy" ? 130 : 180);
  const stability = params.stability !== undefined ? params.stability : 0.75;
  const styleEx = params.styleExaggeration || 0.1;

  // Generate a speech-like formant-synthesized waveform with prosody
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    // Sentence prosody curve
    const sentenceProgress = t / approxDuration;
    const prosodyMod = Math.sin(sentenceProgress * Math.PI) * 20 * (1 - stability + styleEx * 0.5);
    const f0 = basePitch + prosodyMod + Math.sin(t * 4) * 8;

    // Glottal pulse harmonic series (formants at f0, 3*f0, 5*f0 with harmonic decay)
    let sample = 0;
    sample += 0.45 * Math.sin(2 * Math.PI * f0 * t);
    sample += 0.25 * Math.sin(2 * Math.PI * (f0 * 2) * t);
    sample += 0.15 * Math.sin(2 * Math.PI * (f0 * 3.2) * t);
    sample += 0.08 * Math.sin(2 * Math.PI * (f0 * 4.8) * t);

    // Formant filters simulation: subtle resonance peak
    const formant1 = Math.sin(2 * Math.PI * 700 * t) * 0.1;
    const formant2 = Math.sin(2 * Math.PI * 1800 * t) * 0.05;
    sample = sample * 0.85 + formant1 + formant2;

    // Breathiness / consonant friction simulation
    const whisperNoise = (Math.random() * 2 - 1) * (params.tone === "raspy" ? 0.08 : 0.03);
    sample += whisperNoise;

    // Word rhythm envelope: pulsing volume on syllable cadences (~4 Hz)
    const syllablePulse = (Math.sin(2 * Math.PI * 4 * baseSpeed * t) + 1) * 0.35 + 0.3;
    sample *= syllablePulse;

    // Fade in and out
    const fadeIn = Math.min(1, t / 0.08);
    const fadeOut = Math.min(1, (approxDuration - t) / 0.12);
    samples[i] = sample * fadeIn * fadeOut * 0.8;
  }

  const wavBuffer = encodeWAV(samples, sampleRate);
  const audioUrl = bufferToDataUrl(wavBuffer);

  return { audioUrl, duration: approxDuration };
}

/**
 * Synthesizes a procedural lo-fi / electronic / cinematic music preview track
 */
export function synthesizeMusicTrack(
  prompt: string,
  params: {
    genre?: string;
    mood?: string;
    bpm?: number;
    duration?: number;
  } = {}
): { audioUrl: string; duration: number } {
  const sampleRate = 44100;
  const duration = Math.min(60, params.duration || 15);
  const numSamples = Math.floor(sampleRate * duration);
  const samples = new Float32Array(numSamples);

  const bpm = params.bpm || 84;
  const beatDuration = 60 / bpm;

  // Chord progression frequencies (e.g. Cmin -> Ab -> Eb -> Bb)
  const chords = [
    [130.81, 155.56, 196.0, 261.63], // C minor
    [103.83, 130.81, 155.56, 207.65], // Ab Major
    [155.56, 196.0, 233.08, 311.13], // Eb Major
    [116.54, 146.83, 174.61, 233.08], // Bb Major
  ];

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const currentBeat = t / beatDuration;
    const barIndex = Math.floor(currentBeat / 4) % chords.length;
    const chord = chords[barIndex];
    const beatFraction = currentBeat % 1;

    let sample = 0;

    // 1. Chords (Warm Rhodes/Synth Pad)
    for (let c = 0; c < chord.length; c++) {
      const freq = chord[c];
      const sine = Math.sin(2 * Math.PI * freq * t);
      const sub = Math.sin(2 * Math.PI * (freq * 0.5) * t) * 0.3;
      sample += (sine + sub) * 0.08;
    }

    // 2. Sub Bass (on beat 1 and 3 of bar)
    const rootFreq = chord[0] * 0.5;
    const bassEnv = Math.exp(-beatFraction * 3.5);
    sample += Math.sin(2 * Math.PI * rootFreq * t) * bassEnv * 0.28;

    // 3. Kick Drum (on beats 1 and 3)
    if (Math.floor(currentBeat) % 2 === 0 && beatFraction < 0.25) {
      const kickT = beatFraction * beatDuration;
      const kickFreq = Math.max(45, 140 * Math.exp(-kickT * 30));
      const kickEnv = Math.exp(-kickT * 12);
      sample += Math.sin(2 * Math.PI * kickFreq * kickT) * kickEnv * 0.45;
    }

    // 4. Snare / Clack (on beats 2 and 4)
    if (Math.floor(currentBeat) % 2 === 1 && beatFraction < 0.2) {
      const snareT = beatFraction * beatDuration;
      const noise = (Math.random() * 2 - 1) * Math.exp(-snareT * 25);
      const tone = Math.sin(2 * Math.PI * 220 * snareT) * Math.exp(-snareT * 35);
      sample += (noise * 0.6 + tone * 0.4) * 0.35;
    }

    // 5. Hi-hats (every 8th note)
    const eighthFraction = (currentBeat * 2) % 1;
    if (eighthFraction < 0.08) {
      const hatT = eighthFraction * (beatDuration / 2);
      const hatNoise = (Math.random() * 2 - 1) * Math.exp(-hatT * 60);
      sample += hatNoise * 0.12;
    }

    // Master envelope: smooth fade in & fade out
    const fadeIn = Math.min(1, t / 0.5);
    const fadeOut = Math.min(1, (duration - t) / 0.8);
    samples[i] = Math.max(-0.95, Math.min(0.95, sample * fadeIn * fadeOut * 0.9));
  }

  const wavBuffer = encodeWAV(samples, sampleRate);
  const audioUrl = bufferToDataUrl(wavBuffer);

  return { audioUrl, duration };
}

/**
 * Synthesizes procedural Sound Effects (Rain/Thunder, Laser, Ocean, Impact, Chime)
 */
export function synthesizeSFX(
  prompt: string,
  params: {
    duration?: number;
    loop?: boolean;
    promptInfluence?: number;
  } = {}
): { audioUrl: string; duration: number } {
  const sampleRate = 44100;
  const duration = Math.min(22, Math.max(0.8, params.duration || 5));
  const numSamples = Math.floor(sampleRate * duration);
  const samples = new Float32Array(numSamples);

  const lower = prompt.toLowerCase();
  const isRain = lower.includes("rain") || lower.includes("water") || lower.includes("storm");
  const isThunder = lower.includes("thunder") || lower.includes("explosion") || lower.includes("boom");
  const isLaser = lower.includes("laser") || lower.includes("sci-fi") || lower.includes("beam") || lower.includes("space");
  const isChime = lower.includes("bell") || lower.includes("chime") || lower.includes("notification") || lower.includes("crystal");

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    let s = 0;

    if (isLaser) {
      // Fast pitch drop frequency modulation
      const chirpFreq = Math.max(80, 2400 * Math.exp(-t * 9));
      s = Math.sin(2 * Math.PI * chirpFreq * t) * Math.exp(-t * 3.5);
    } else if (isChime) {
      // Metallic harmonic bell chime
      s += Math.sin(2 * Math.PI * 880 * t) * Math.exp(-t * 1.5) * 0.5;
      s += Math.sin(2 * Math.PI * 1760 * t) * Math.exp(-t * 2.2) * 0.3;
      s += Math.sin(2 * Math.PI * 2640 * t) * Math.exp(-t * 3.0) * 0.2;
    } else if (isThunder) {
      // Low rumble + randomized peak impulses
      const lowRumble = Math.sin(2 * Math.PI * (45 + Math.sin(t * 8) * 15) * t);
      const rumbleNoise = (Math.random() * 2 - 1) * Math.exp(-t * 0.8);
      s = (lowRumble * 0.6 + rumbleNoise * 0.4) * Math.exp(-t * 0.5);
    } else {
      // Rain / ambient noise / default atmospheric texture
      const whiteNoise = (Math.random() * 2 - 1);
      // Pink-ish noise filter approximation
      const dropPatter = Math.sin(t * 120 + Math.sin(t * 40)) * 0.15;
      s = whiteNoise * 0.25 + dropPatter;
    }

    // Apply fade
    const fadeIn = Math.min(1, t / 0.1);
    const fadeOut = Math.min(1, (duration - t) / 0.25);
    samples[i] = Math.max(-0.95, Math.min(0.95, s * fadeIn * fadeOut * 0.85));
  }

  const wavBuffer = encodeWAV(samples, sampleRate);
  const audioUrl = bufferToDataUrl(wavBuffer);

  return { audioUrl, duration };
}
