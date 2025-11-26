/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

export const MAX_STORY_PAGES = 10;
export const BACK_COVER_PAGE = 11;
export const TOTAL_PAGES = 11;
export const INITIAL_PAGES = 2;
export const GATE_PAGE = 2;
export const BATCH_SIZE = 6;
export const DECISION_PAGES = [3, 7]; // Added an extra decision point

export const GENRES = [
    "Magical Forest Adventure", 
    "Space Explorer", 
    "Friendly Animals", 
    "Under the Sea", 
    "Dinosaur Discovery", 
    "Fairy Tale Kingdom", 
    "Backyard Detective", 
    "Bedtime Story",
    "Custom"
];

export const TONES = [
    "RHYMING (A gentle poem structure)",
    "SILLY & FUNNY (Lots of giggles and jokes)",
    "GENTLE & CALMING (Perfect for bedtime)",
    "EXCITING (A big adventure with a happy ending)",
    "EDUCATIONAL (Learning about the world)",
    "WHIMSICAL (Dreamy and magical)"
];

export const LANGUAGES = [
    { code: 'en-US', name: 'English (US)' },
    { code: 'es-MX', name: 'Spanish' },
    { code: 'fr-FR', name: 'French' },
    { code: 'de-DE', name: 'German' },
    { code: 'it-IT', name: 'Italian' },
    { code: 'ja-JP', name: 'Japanese' },
    { code: 'ko-KR', name: 'Korean' },
    { code: 'pt-BR', name: 'Portuguese' },
    { code: 'hi-IN', name: 'Hindi' },
    { code: 'ar-EG', name: 'Arabic' }
];

export interface ComicFace {
  id: string;
  type: 'cover' | 'story' | 'back_cover';
  imageUrl?: string;
  narrative?: Beat;
  choices: string[];
  resolvedChoice?: string;
  isLoading: boolean;
  pageIndex?: number;
  isDecisionPage?: boolean;
}

export interface Beat {
  caption?: string; // Used for the main story text
  scene: string;
  choices: string[];
  focus_char: 'hero' | 'friend' | 'other';
}

export interface Persona {
  base64: string;
  desc: string;
}