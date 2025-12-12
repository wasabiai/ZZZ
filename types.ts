export enum AspectRatio {
  Square = "1:1",
  Portrait = "3:4", // Often used for posters
  Landscape = "4:3",
  Story = "9:16",
  Wide = "16:9"
}

export enum ProductAngle {
  Front = "Front View",
  Left = "Left Front 45 Degree View",
  Right = "Right Front 45 Degree View",
  Top = "Top View (Flat Lay)"
}

export interface StyleTemplate {
  id: string;
  name: string;
  description: string; // The user-facing short description
  prompt: string; // The AI prompt injection
  tags: string[];
  previewColor: string; // Hex for UI decoration
}

export interface GeneratedImage {
  id: string;
  url: string;
  styleName: string;
  timestamp: number;
}

export interface DetailResult {
  id: string;
  url: string;
  caption: string; // The marketing copy
  focusPoint: string; // What feature is being highlighted
}

export enum AppState {
  Upload,
  StyleSelection,
  Generating,
  Result
}

export type ProcessingStep = 'idle' | 'uploading' | 'analyzing' | 'generating' | 'generating_details';

export interface LayoutTemplate {
  id: string;
  name: string;
  category: 'muji' | 'uniqlo' | 'train' | 'editorial';
  iconColor: string;
}