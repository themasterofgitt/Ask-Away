
export enum CategoryType {
  KNOTS = 'Knots & Kinks',
  FANTASY = 'Wild Fantasies',
  PREFERENCES = 'Bedroom Preferences',
  DEEP_DIVE = 'Deep Dive',
  ICE_BREAKERS = 'Ice Breakers',
  TABOO = 'Taboo Subjects',
  SCENARIOS = 'Roleplay Scenarios',
  CONNECTION = 'Soul Connection',
  CURIOUS_MINDS = 'Curious Minds'
}

export interface Card {
  id: string;
  category: CategoryType;
  text: string;
  color: string;
}

export interface GameState {
  currentCategory: CategoryType | 'All' | null;
  history: string[];
  points: number;
  turn: 1 | 2;
  player1Name: string;
  player2Name: string;
}

export interface CategoryMetadata {
  type: CategoryType;
  color: string;
  icon: string;
  description: string;
  image: string;
}
