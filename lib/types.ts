export type VoiceCategory = 'premade' | 'cloned' | 'designed';
export type Gender = 'female' | 'male' | 'non-binary';
export type Age = 'young' | 'middle-aged' | 'old';

export interface Voice {
  id: string;
  name: string;
  description: string;
  category: VoiceCategory;
  gender: Gender;
  age: Age;
  accent: string;
  language: string;
  useCase: string; // e.g. "Narrative & Story", "Conversational", "News", "Video Games", "ASMR"
  previewAudioUrl?: string;
  avatarUrl?: string;
  labels: string[];
  isCloned?: boolean;
  isDesigned?: boolean;
  isShared?: boolean;
  isFavorite?: boolean;
  ownerId?: string;
  sampleCount?: number;
  qualityRating?: number;
  pitch?: number; // 0.5 to 1.5
  speed?: number; // 0.5 to 2.0
  tone?: string;
  createdAt: string;
}

export interface Generation {
  id: string;
  type: 'tts' | 'music' | 'sfx' | 'voice-changer' | 'isolation';
  title: string;
  prompt: string;
  voiceId?: string;
  voiceName?: string;
  model: string; // 'EGVL Turbo' | 'EGVL Multilingual' | 'EGVL SoundGen' | 'EGVL BeatSync'
  audioUrl: string;
  duration: number; // in seconds
  costCredits: number;
  createdAt: string;
  status: 'completed' | 'processing' | 'failed';
  params: Record<string, any>;
  isFavorite?: boolean;
  watermarked: boolean;
}

export interface AudioTrackClip {
  id: string;
  title: string;
  type: 'tts' | 'music' | 'sfx' | 'recording';
  startTime: number; // in seconds on timeline
  duration: number;
  audioUrl: string;
  volume: number; // 0 to 1
  color: string;
}

export interface ProjectTrack {
  id: string;
  name: string;
  type: 'speech' | 'music' | 'sfx';
  muted: boolean;
  solo: boolean;
  volume: number; // 0 to 1
  clips: AudioTrackClip[];
}

export interface Project {
  id: string;
  title: string;
  description?: string;
  tracks: ProjectTrack[];
  duration: number;
  updatedAt: string;
  createdAt: string;
}

export interface AudioQualityCheck {
  noiseLevel: 'low' | 'moderate' | 'high';
  clippingDetected: boolean;
  durationSeconds: number;
  isAcceptable: boolean;
  sampleRate: number;
  score: number; // 0 - 100
  issues: string[];
  recommendations: string[];
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  plan: 'Free' | 'Starter' | 'Creator' | 'Pro';
  credits: number;
  maxCredits: number;
  apiKey: string;
  createdAt: string;
  avatar?: string;
}
