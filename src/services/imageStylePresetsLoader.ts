/**
 * Image Style Presets Loader
 *
 * Lazy loads image style presets from JSON with caching.
 * Reduces initial bundle size by loading presets on-demand.
 */

import { ImageStylePreset } from './imageStylePresets';

// Cache for loaded presets
let presetsCache: ImageStylePreset[] | null = null;
let loadingPromise: Promise<ImageStylePreset[]> | null = null;

/**
 * Load presets from JSON file with caching
 */
export async function loadPresets(): Promise<ImageStylePreset[]> {
  // Return cached presets if available
  if (presetsCache) {
    return presetsCache;
  }

  // Return existing loading promise if one is in progress
  if (loadingPromise) {
    return loadingPromise;
  }

  // Start loading
  loadingPromise = fetch('/data/imageStylePresets.json')
    .then(response => {
      if (!response.ok) {
        throw new Error(`Failed to load image style presets: ${response.statusText}`);
      }
      return response.json();
    })
    .then((data: ImageStylePreset[]) => {
      // Cache the results
      presetsCache = data;
      loadingPromise = null;
      return data;
    })
    .catch(error => {
      console.error('Error loading image style presets:', error);
      loadingPromise = null;
      // Return empty array on error
      return [];
    });

  return loadingPromise;
}

/**
 * Preload presets (call this during app initialization if desired)
 */
export function preloadPresets(): void {
  if (!presetsCache && !loadingPromise) {
    loadPresets().catch(err => {
      console.error('Failed to preload image style presets:', err);
    });
  }
}

/**
 * Clear the cache (useful for testing)
 */
export function clearPresetsCache(): void {
  presetsCache = null;
  loadingPromise = null;
}

/**
 * Check if presets are loaded
 */
export function arePresetsLoaded(): boolean {
  return presetsCache !== null;
}
