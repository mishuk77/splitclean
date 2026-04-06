import { CATEGORY_KEYWORDS, DEFAULT_CATEGORY } from '../constants/categories';

export function autoCategory(description: string): string {
  const lower = description.toLowerCase();
  for (const [emoji, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const keyword of keywords) {
      if (lower.includes(keyword)) return emoji;
    }
  }
  return DEFAULT_CATEGORY;
}
