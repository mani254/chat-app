// constants/gameCategories.ts
export const GAME_CATEGORIES = [
  { key: 'items', label: 'Items' },
  { key: 'materials', label: 'Materials' },
  { key: 'tools', label: 'Tools' },
  { key: 'food', label: 'Food' },
  { key: 'professions', label: 'Professions' },
  { key: 'activities', label: 'Activities' },
  { key: 'concepts', label: 'Concepts' },
  { key: 'other', label: 'Other' },
] as const;

export type GameCategory = (typeof GAME_CATEGORIES)[number]['key'];
