/**
 * Usage Tracking (Simulated Backend)
 */
const USAGE_KEY = 'gw_usage_tracker';

export interface UsageData {
  wordsUsed: number;
  imagesUsed: number;
  lastReset: number;
}

export const getUsageData = (): UsageData => {
  try {
    const data = localStorage.getItem(USAGE_KEY);
    if (!data) return { wordsUsed: 0, imagesUsed: 0, lastReset: Date.now() };

    const parsed = JSON.parse(data);
    // Reset monthly (mock logic: if last reset was > 30 days ago)
    if (Date.now() - parsed.lastReset > 30 * 24 * 60 * 60 * 1000) {
        return { wordsUsed: 0, imagesUsed: 0, lastReset: Date.now() };
    }
    // Backward compatibility for old format without imagesUsed
    if (parsed.imagesUsed === undefined) {
        parsed.imagesUsed = 0;
    }
    return parsed;
  } catch {
    return { wordsUsed: 0, imagesUsed: 0, lastReset: Date.now() };
  }
};

export const LIMITS: Record<string, { words: number, images: number }> = {
  free: { words: 2000, images: 0 },
  pro: { words: 50000, images: 50 },
  agency: { words: 200000, images: 200 },
  enterprise: { words: Infinity, images: Infinity }
};

export const checkUsageAllowance = (type: 'word' | 'image' = 'word') => {
  let plan = 'free';
  try {
    const userStr = localStorage.getItem('ai_writer_user');
    if (userStr) {
        plan = JSON.parse(userStr).plan || 'free';
    }
  } catch (e) {
    console.warn("Could not read user plan", e);
  }

  const usage = getUsageData();
  const limit = LIMITS[plan] || LIMITS.free;

  if (type === 'word' && usage.wordsUsed >= limit.words) {
    throw new Error(`Word limit reached (${limit.words.toLocaleString()} words). Please upgrade to continue.`);
  }

  if (type === 'image' && usage.imagesUsed >= limit.images) {
    throw new Error(`Image limit reached (${limit.images} images). Please upgrade to continue.`);
  }
};

export const trackUsage = (text: string, isImage: boolean = false) => {
  const usage = getUsageData();
  let newWords = usage.wordsUsed;
  let newImages = usage.imagesUsed;

  if (isImage) {
      newImages += 1;
  } else if (text) {
      const wordCount = text.trim().split(/\s+/).length;
      newWords += wordCount;
  }

  localStorage.setItem(USAGE_KEY, JSON.stringify({
    ...usage,
    wordsUsed: newWords,
    imagesUsed: newImages
  }));

  // Dispatch event for UI updates
  window.dispatchEvent(new Event('usage_updated'));
};
