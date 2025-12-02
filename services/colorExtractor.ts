/**
 * Color Extractor Service
 *
 * Extracts dominant colors from images using Canvas API.
 * Provides color conversion utilities and accessibility checking.
 */

export interface ExtractedColor {
  hex: string;
  rgb: { r: number; g: number; b: number };
  hsl: { h: number; s: number; l: number };
  count: number;
}

/**
 * Extract dominant colors from an image
 */
export async function extractColorsFromImage(
  imageDataUrl: string,
  maxColors: number = 5
): Promise<ExtractedColor[]> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        // Create canvas
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        // Scale down image for faster processing
        const maxSize = 100;
        const scale = Math.min(maxSize / img.width, maxSize / img.height);
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;

        // Draw image
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // Get image data
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const pixels = imageData.data;

        // Count colors
        const colorCounts = new Map<string, { rgb: { r: number; g: number; b: number }; count: number }>();

        for (let i = 0; i < pixels.length; i += 4) {
          const r = pixels[i];
          const g = pixels[i + 1];
          const b = pixels[i + 2];
          const a = pixels[i + 3];

          // Skip transparent pixels
          if (a < 128) continue;

          // Quantize colors to reduce unique color count
          const quantizedR = Math.round(r / 10) * 10;
          const quantizedG = Math.round(g / 10) * 10;
          const quantizedB = Math.round(b / 10) * 10;

          const key = `${quantizedR},${quantizedG},${quantizedB}`;

          if (colorCounts.has(key)) {
            colorCounts.get(key)!.count++;
          } else {
            colorCounts.set(key, {
              rgb: { r: quantizedR, g: quantizedG, b: quantizedB },
              count: 1
            });
          }
        }

        // Sort by count and get top colors
        const sortedColors = Array.from(colorCounts.values())
          .sort((a, b) => b.count - a.count)
          .slice(0, maxColors);

        // Convert to ExtractedColor format
        const extractedColors: ExtractedColor[] = sortedColors.map(({ rgb, count }) => {
          const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
          const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

          return { hex, rgb, hsl, count };
        });

        resolve(extractedColors);
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    img.src = imageDataUrl;
  });
}

/**
 * Convert RGB to HEX
 */
export function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => {
    const hex = Math.round(n).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Convert HEX to RGB
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      }
    : null;
}

/**
 * Convert RGB to HSL
 */
export function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  };
}

/**
 * Convert HSL to RGB
 */
export function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  h /= 360;
  s /= 100;
  l /= 100;

  let r, g, b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255)
  };
}

/**
 * Calculate luminance of a color
 */
export function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Calculate contrast ratio between two colors
 */
export function getContrastRatio(
  rgb1: { r: number; g: number; b: number },
  rgb2: { r: number; g: number; b: number }
): number {
  const l1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const l2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);

  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check if color contrast meets WCAG guidelines
 */
export function checkWCAGCompliance(
  foreground: { r: number; g: number; b: number },
  background: { r: number; g: number; b: number },
  level: 'AA' | 'AAA' = 'AA',
  size: 'normal' | 'large' = 'normal'
): { passes: boolean; ratio: number; required: number } {
  const ratio = getContrastRatio(foreground, background);

  let required: number;
  if (level === 'AAA') {
    required = size === 'large' ? 4.5 : 7;
  } else {
    required = size === 'large' ? 3 : 4.5;
  }

  return {
    passes: ratio >= required,
    ratio: Math.round(ratio * 100) / 100,
    required
  };
}

/**
 * Generate complementary color
 */
export function getComplementaryColor(hex: string): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;

  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  const complementaryHsl = {
    h: (hsl.h + 180) % 360,
    s: hsl.s,
    l: hsl.l
  };

  const complementaryRgb = hslToRgb(complementaryHsl.h, complementaryHsl.s, complementaryHsl.l);
  return rgbToHex(complementaryRgb.r, complementaryRgb.g, complementaryRgb.b);
}

/**
 * Generate analogous colors
 */
export function getAnalogousColors(hex: string, count: number = 2): string[] {
  const rgb = hexToRgb(hex);
  if (!rgb) return [hex];

  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  const colors: string[] = [];

  for (let i = 1; i <= count; i++) {
    const angle = (30 * i);
    const analogousHsl = {
      h: (hsl.h + angle) % 360,
      s: hsl.s,
      l: hsl.l
    };

    const analogousRgb = hslToRgb(analogousHsl.h, analogousHsl.s, analogousHsl.l);
    colors.push(rgbToHex(analogousRgb.r, analogousRgb.g, analogousRgb.b));
  }

  return colors;
}

/**
 * Generate color shades
 */
export function generateShades(hex: string, count: number = 5): string[] {
  const rgb = hexToRgb(hex);
  if (!rgb) return [hex];

  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  const shades: string[] = [];

  for (let i = 0; i < count; i++) {
    const lightness = (100 / (count + 1)) * (i + 1);
    const shadeHsl = {
      h: hsl.h,
      s: hsl.s,
      l: lightness
    };

    const shadeRgb = hslToRgb(shadeHsl.h, shadeHsl.s, shadeHsl.l);
    shades.push(rgbToHex(shadeRgb.r, shadeRgb.g, shadeRgb.b));
  }

  return shades;
}

export default {
  extractColorsFromImage,
  rgbToHex,
  hexToRgb,
  rgbToHsl,
  hslToRgb,
  getLuminance,
  getContrastRatio,
  checkWCAGCompliance,
  getComplementaryColor,
  getAnalogousColors,
  generateShades
};
