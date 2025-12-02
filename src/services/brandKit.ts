/**
 * Brand Kit Service
 *
 * Manages brand assets including logos, colors, fonts, and brand voice guidelines.
 * Stores brand information in localStorage for client-side persistence.
 */

export interface BrandLogo {
  id: string;
  name: string;
  dataUrl: string; // base64 encoded image
  type: 'color' | 'white' | 'black' | 'other';
  width: number;
  height: number;
  fileSize: number;
  uploadedAt: Date;
}

export interface BrandColor {
  id: string;
  name: string;
  hex: string;
  rgb: { r: number; g: number; b: number };
  hsl: { h: number; s: number; l: number };
  type: 'primary' | 'secondary' | 'accent' | 'neutral';
  usage?: string;
}

export interface BrandFont {
  id: string;
  name: string;
  family: string;
  type: 'heading' | 'body' | 'accent';
  source: 'google' | 'custom' | 'system';
  weight?: string;
  url?: string; // For Google Fonts or custom fonts
}

export interface BrandVoice {
  tone: 'professional' | 'casual' | 'friendly' | 'formal' | 'playful' | 'authoritative';
  writingStyle: string[];
  dos: string[];
  donts: string[];
  examplePhrases: string[];
  targetAudience: string;
  industryTerms: string[];
}

export interface BrandAsset {
  id: string;
  name: string;
  dataUrl: string;
  type: string;
  tags: string[];
  uploadedAt: Date;
  usageCount: number;
}

export interface BrandKit {
  id: string;
  name: string;
  logos: BrandLogo[];
  colors: BrandColor[];
  fonts: BrandFont[];
  voice: BrandVoice;
  assets: BrandAsset[];
  createdAt: Date;
  updatedAt: Date;
}

const BRAND_KIT_STORAGE_KEY = 'genius_brand_kit';

/**
 * Get the current brand kit
 */
export function getBrandKit(): BrandKit | null {
  const brandKitJson = localStorage.getItem(BRAND_KIT_STORAGE_KEY);
  if (!brandKitJson) return null;

  const brandKit: BrandKit = JSON.parse(brandKitJson);
  return {
    ...brandKit,
    createdAt: new Date(brandKit.createdAt),
    updatedAt: new Date(brandKit.updatedAt),
    logos: brandKit.logos.map(logo => ({
      ...logo,
      uploadedAt: new Date(logo.uploadedAt)
    })),
    assets: brandKit.assets.map(asset => ({
      ...asset,
      uploadedAt: new Date(asset.uploadedAt)
    }))
  };
}

/**
 * Create a new brand kit
 */
export function createBrandKit(name: string): BrandKit {
  const brandKit: BrandKit = {
    id: `brand_${Date.now()}`,
    name,
    logos: [],
    colors: [],
    fonts: [],
    voice: {
      tone: 'professional',
      writingStyle: [],
      dos: [],
      donts: [],
      examplePhrases: [],
      targetAudience: '',
      industryTerms: []
    },
    assets: [],
    createdAt: new Date(),
    updatedAt: new Date()
  };

  saveBrandKit(brandKit);
  return brandKit;
}

/**
 * Update brand kit
 */
export function updateBrandKit(updates: Partial<BrandKit>): BrandKit | null {
  const brandKit = getBrandKit();
  if (!brandKit) return null;

  const updatedKit = {
    ...brandKit,
    ...updates,
    updatedAt: new Date()
  };

  saveBrandKit(updatedKit);
  return updatedKit;
}

/**
 * Add a logo
 */
export function addLogo(logo: Omit<BrandLogo, 'id' | 'uploadedAt'>): BrandLogo {
  const brandKit = getBrandKit();
  if (!brandKit) throw new Error('No brand kit found');

  const newLogo: BrandLogo = {
    ...logo,
    id: `logo_${Date.now()}`,
    uploadedAt: new Date()
  };

  brandKit.logos.push(newLogo);
  saveBrandKit(brandKit);

  return newLogo;
}

/**
 * Remove a logo
 */
export function removeLogo(logoId: string): boolean {
  const brandKit = getBrandKit();
  if (!brandKit) return false;

  brandKit.logos = brandKit.logos.filter(l => l.id !== logoId);
  saveBrandKit(brandKit);
  return true;
}

/**
 * Add a color
 */
export function addColor(color: Omit<BrandColor, 'id'>): BrandColor {
  const brandKit = getBrandKit();
  if (!brandKit) throw new Error('No brand kit found');

  const newColor: BrandColor = {
    ...color,
    id: `color_${Date.now()}`
  };

  brandKit.colors.push(newColor);
  saveBrandKit(brandKit);

  return newColor;
}

/**
 * Remove a color
 */
export function removeColor(colorId: string): boolean {
  const brandKit = getBrandKit();
  if (!brandKit) return false;

  brandKit.colors = brandKit.colors.filter(c => c.id !== colorId);
  saveBrandKit(brandKit);
  return true;
}

/**
 * Update a color
 */
export function updateColor(colorId: string, updates: Partial<BrandColor>): BrandColor | null {
  const brandKit = getBrandKit();
  if (!brandKit) return null;

  const color = brandKit.colors.find(c => c.id === colorId);
  if (!color) return null;

  Object.assign(color, updates);
  saveBrandKit(brandKit);

  return color;
}

/**
 * Add a font
 */
export function addFont(font: Omit<BrandFont, 'id'>): BrandFont {
  const brandKit = getBrandKit();
  if (!brandKit) throw new Error('No brand kit found');

  const newFont: BrandFont = {
    ...font,
    id: `font_${Date.now()}`
  };

  brandKit.fonts.push(newFont);
  saveBrandKit(brandKit);

  return newFont;
}

/**
 * Remove a font
 */
export function removeFont(fontId: string): boolean {
  const brandKit = getBrandKit();
  if (!brandKit) return false;

  brandKit.fonts = brandKit.fonts.filter(f => f.id !== fontId);
  saveBrandKit(brandKit);
  return true;
}

/**
 * Update brand voice
 */
export function updateBrandVoice(updates: Partial<BrandVoice>): BrandVoice {
  const brandKit = getBrandKit();
  if (!brandKit) throw new Error('No brand kit found');

  brandKit.voice = {
    ...brandKit.voice,
    ...updates
  };

  saveBrandKit(brandKit);
  return brandKit.voice;
}

/**
 * Add a brand asset
 */
export function addAsset(asset: Omit<BrandAsset, 'id' | 'uploadedAt' | 'usageCount'>): BrandAsset {
  const brandKit = getBrandKit();
  if (!brandKit) throw new Error('No brand kit found');

  const newAsset: BrandAsset = {
    ...asset,
    id: `asset_${Date.now()}`,
    uploadedAt: new Date(),
    usageCount: 0
  };

  brandKit.assets.push(newAsset);
  saveBrandKit(brandKit);

  return newAsset;
}

/**
 * Remove an asset
 */
export function removeAsset(assetId: string): boolean {
  const brandKit = getBrandKit();
  if (!brandKit) return false;

  brandKit.assets = brandKit.assets.filter(a => a.id !== assetId);
  saveBrandKit(brandKit);
  return true;
}

/**
 * Increment asset usage count
 */
export function incrementAssetUsage(assetId: string): void {
  const brandKit = getBrandKit();
  if (!brandKit) return;

  const asset = brandKit.assets.find(a => a.id === assetId);
  if (asset) {
    asset.usageCount++;
    saveBrandKit(brandKit);
  }
}

/**
 * Get Google Fonts list (popular fonts)
 */
export function getGoogleFonts(): { name: string; category: string }[] {
  return [
    { name: 'Roboto', category: 'sans-serif' },
    { name: 'Open Sans', category: 'sans-serif' },
    { name: 'Lato', category: 'sans-serif' },
    { name: 'Montserrat', category: 'sans-serif' },
    { name: 'Poppins', category: 'sans-serif' },
    { name: 'Inter', category: 'sans-serif' },
    { name: 'Raleway', category: 'sans-serif' },
    { name: 'Playfair Display', category: 'serif' },
    { name: 'Merriweather', category: 'serif' },
    { name: 'Lora', category: 'serif' },
    { name: 'Source Sans Pro', category: 'sans-serif' },
    { name: 'Nunito', category: 'sans-serif' },
    { name: 'Ubuntu', category: 'sans-serif' },
    { name: 'PT Sans', category: 'sans-serif' },
    { name: 'Oswald', category: 'sans-serif' },
    { name: 'Work Sans', category: 'sans-serif' },
    { name: 'Crimson Text', category: 'serif' },
    { name: 'Libre Baskerville', category: 'serif' },
    { name: 'Fira Sans', category: 'sans-serif' },
    { name: 'Cabin', category: 'sans-serif' }
  ];
}

/**
 * Load Google Font dynamically
 */
export function loadGoogleFont(fontFamily: string): void {
  const link = document.createElement('link');
  link.href = `https://fonts.googleapis.com/css2?family=${fontFamily.replace(' ', '+')}:wght@400;500;600;700&display=swap`;
  link.rel = 'stylesheet';
  document.head.appendChild(link);
}

/**
 * Save brand kit to localStorage
 */
function saveBrandKit(brandKit: BrandKit): void {
  localStorage.setItem(BRAND_KIT_STORAGE_KEY, JSON.stringify(brandKit));
}

/**
 * Delete brand kit
 */
export function deleteBrandKit(): boolean {
  localStorage.removeItem(BRAND_KIT_STORAGE_KEY);
  return true;
}

export default {
  getBrandKit,
  createBrandKit,
  updateBrandKit,
  addLogo,
  removeLogo,
  addColor,
  removeColor,
  updateColor,
  addFont,
  removeFont,
  updateBrandVoice,
  addAsset,
  removeAsset,
  incrementAssetUsage,
  getGoogleFonts,
  loadGoogleFont,
  deleteBrandKit
};
