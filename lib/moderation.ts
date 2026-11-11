// Content moderation and safety engine for EGVL

const BLOCKED_WORDS = [
  "child porn", "csam", "suicide", "bomb threat", "kill all", 
  "assassinate", "terrorist attack", "doxx", "credit card dump"
];

const PROTECTED_ARTISTS = [
  "drake", "taylor swift", "the beatles", "beatles", "eminem", "ed sheeran",
  "ariana grande", "kanye west", "michael jackson", "beyonce", "rihanna",
  "billie eilish", "the weeknd", "kendrick lamar", "travis scott", "adele"
];

const PROTECTED_POLITICIANS_AND_PUBLIC_FIGURES = [
  "joe biden", "donald trump", "barack obama", "kamala harris", "bill clinton",
  "george bush", "vladimir putin", "xi jinping", "emmanuel macron", "elon musk",
  "mark zuckerberg", "jeff bezos", "keir starmer", "rishi sunak", "narendra modi"
];

export interface ModerationResult {
  passed: boolean;
  reason?: string;
  category?: 'toxic' | 'copyright' | 'public_figure' | 'harmful';
  flaggedTerms?: string[];
}

export function moderateText(text: string, context: 'tts' | 'music' | 'sfx' = 'tts'): ModerationResult {
  const lower = text.toLowerCase();

  // 1. Harmful content check
  for (const word of BLOCKED_WORDS) {
    if (lower.includes(word)) {
      return {
        passed: false,
        reason: `Violates Acceptable Use Policy: Harmful or prohibited content detected.`,
        category: 'harmful',
        flaggedTerms: [word]
      };
    }
  }

  // 2. Music/SFX Copyright artist imitation check
  if (context === 'music' || context === 'sfx') {
    for (const artist of PROTECTED_ARTISTS) {
      // Regex check for word boundary to avoid false positives (e.g., "drake" vs "mandrakeroot")
      const regex = new RegExp(`\\b${artist}\\b`, 'i');
      if (regex.test(lower)) {
        return {
          passed: false,
          reason: `Copyright Protection: Imitation or direct generation using protected artist name "${artist}" is prohibited. Please describe musical styles, instruments, or genres instead.`,
          category: 'copyright',
          flaggedTerms: [artist]
        };
      }
    }
  }

  return { passed: true };
}

export function moderateVoiceCloneName(voiceName: string, description: string = ''): ModerationResult {
  const combined = `${voiceName} ${description}`.toLowerCase();

  for (const person of PROTECTED_POLITICIANS_AND_PUBLIC_FIGURES) {
    const regex = new RegExp(`\\b${person}\\b`, 'i');
    if (regex.test(combined)) {
      return {
        passed: false,
        reason: `Policy Violation: Cloning public figures, celebrities, or political leaders ("${person}") is strictly prohibited to prevent impersonation and fraud.`,
        category: 'public_figure',
        flaggedTerms: [person]
      };
    }
  }

  return { passed: true };
}
