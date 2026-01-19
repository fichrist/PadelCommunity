/**
 * Hook for padel ranking level management
 * Platform-agnostic - works for both React Web and React Native
 */

export interface RankingLevel {
  value: string;
  min: number;
  max: number;
}

/**
 * All available ranking levels for padel matches
 */
export const ALL_RANKING_LEVELS: RankingLevel[] = [
  { value: 'p50-p100', min: 50, max: 100 },
  { value: 'p100-p200', min: 100, max: 200 },
  { value: 'p200-p300', min: 200, max: 300 },
  { value: 'p300-p400', min: 300, max: 400 },
  { value: 'p400-p500', min: 400, max: 500 },
  { value: 'p500-p700', min: 500, max: 700 },
  { value: 'p700-p1000', min: 700, max: 1000 },
  { value: 'p1000+', min: 1000, max: Infinity },
];

/**
 * Extract numeric value from ranking string (e.g., "P450" -> 450)
 */
export const parseRankingValue = (ranking: string | null): number | null => {
  if (!ranking) return null;

  const rankingMatch = ranking.match(/P?(\d+)/i);
  if (!rankingMatch) return null;

  return parseInt(rankingMatch[1]);
};

/**
 * Get available ranking levels based on user's ranking
 * Returns levels that include the user's ranking value
 */
export const getAvailableRankingLevels = (userRanking: string | null): string[] => {
  if (!userRanking) return [];

  const rankingValue = parseRankingValue(userRanking);
  if (rankingValue === null) return [];

  // Filter levels that include the user's ranking
  return ALL_RANKING_LEVELS
    .filter(level => rankingValue >= level.min && rankingValue <= level.max)
    .map(level => level.value);
};

/**
 * Check if a match level is suitable for a user's ranking
 */
export const isLevelSuitableForUser = (
  matchLevel: string,
  userRanking: string | null
): boolean => {
  if (!userRanking) return true;

  const rankingValue = parseRankingValue(userRanking);
  if (rankingValue === null) return true;

  const level = ALL_RANKING_LEVELS.find(l => l.value === matchLevel);
  if (!level) return true;

  return rankingValue >= level.min && rankingValue <= level.max;
};

/**
 * Get the ranking level object for a given value
 */
export const getRankingLevel = (levelValue: string): RankingLevel | undefined => {
  return ALL_RANKING_LEVELS.find(level => level.value === levelValue);
};

/**
 * Format ranking display string
 */
export const formatRanking = (ranking: string | null): string => {
  if (!ranking) return 'N/A';
  return ranking.toUpperCase();
};

/**
 * Get min and max values from a level string (e.g., "p500-p700" -> { min: 500, max: 700 })
 */
export const parseLevelRange = (levelValue: string): { min: number; max: number } | null => {
  const level = getRankingLevel(levelValue);
  return level ? { min: level.min, max: level.max } : null;
};
