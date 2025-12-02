/**
 * Image Style Presets Library
 *
 * Provides pre-defined artistic styles for AI image generation
 * with optimized prompts for consistent results.
 */

export interface ImageStylePreset {
  id: string;
  name: string;
  description: string;
  category: 'realistic' | 'artistic' | 'digital' | 'vintage' | 'abstract' | 'specialized';
  prompt: string; // Prompt addition for this style
  negativePrompt?: string; // What to avoid
  thumbnail?: string; // Preview image URL or emoji
  popular: boolean;
  keywords: string[]; // For search
}

/**
 * Comprehensive library of image style presets
 */
export const IMAGE_STYLE_PRESETS: ImageStylePreset[] = [
  // === REALISTIC STYLES ===
  {
    id: 'photorealistic',
    name: 'Photorealistic',
    description: 'Ultra-realistic photograph with natural lighting and detail',
    category: 'realistic',
    prompt: 'photorealistic, high resolution, natural lighting, detailed textures, professional photography, 8k uhd, dslr, soft lighting, high quality, film grain',
    negativePrompt: 'cartoon, painting, illustration, drawing, art, sketch',
    thumbnail: '📷',
    popular: true,
    keywords: ['photo', 'realistic', 'natural', 'camera', 'professional']
  },
  {
    id: 'portrait',
    name: 'Portrait Photography',
    description: 'Professional portrait with shallow depth of field',
    category: 'realistic',
    prompt: 'portrait photography, shallow depth of field, bokeh background, professional lighting, sharp focus on subject, 85mm lens, f/1.8',
    negativePrompt: 'full body, landscape, wide angle',
    thumbnail: '👤',
    popular: true,
    keywords: ['portrait', 'face', 'headshot', 'person', 'professional']
  },
  {
    id: 'cinematic',
    name: 'Cinematic',
    description: 'Movie-like scene with dramatic lighting and composition',
    category: 'realistic',
    prompt: 'cinematic, dramatic lighting, film still, anamorphic lens, color grading, epic composition, wide angle, atmospheric',
    negativePrompt: 'amateur, snapshot, low quality',
    thumbnail: '🎬',
    popular: true,
    keywords: ['movie', 'film', 'dramatic', 'epic', 'cinematic']
  },
  {
    id: 'macro',
    name: 'Macro Photography',
    description: 'Extreme close-up with intricate details',
    category: 'realistic',
    prompt: 'macro photography, extreme close-up, intricate details, sharp focus, shallow depth of field, 100mm macro lens',
    negativePrompt: 'wide shot, landscape',
    thumbnail: '🔬',
    popular: false,
    keywords: ['close-up', 'detail', 'macro', 'zoom', 'tiny']
  },
  {
    id: 'street',
    name: 'Street Photography',
    description: 'Candid urban scene with documentary style',
    category: 'realistic',
    prompt: 'street photography, candid, urban setting, documentary style, natural lighting, authentic moment, photojournalism',
    negativePrompt: 'posed, studio, artificial',
    thumbnail: '🏙️',
    popular: false,
    keywords: ['urban', 'city', 'candid', 'documentary', 'street']
  },

  // === ARTISTIC STYLES ===
  {
    id: 'oil-painting',
    name: 'Oil Painting',
    description: 'Classic oil painting with visible brushstrokes',
    category: 'artistic',
    prompt: 'oil painting, thick brushstrokes, textured canvas, classical art, rich colors, impasto technique',
    negativePrompt: 'photograph, digital, smooth',
    thumbnail: '🎨',
    popular: true,
    keywords: ['painting', 'oil', 'canvas', 'classical', 'brushstroke']
  },
  {
    id: 'watercolor',
    name: 'Watercolor',
    description: 'Soft watercolor painting with flowing colors',
    category: 'artistic',
    prompt: 'watercolor painting, soft edges, flowing colors, translucent layers, paper texture, artistic, delicate',
    negativePrompt: 'sharp, digital, photograph',
    thumbnail: '💧',
    popular: true,
    keywords: ['watercolor', 'paint', 'soft', 'flowing', 'artistic']
  },
  {
    id: 'impressionist',
    name: 'Impressionist',
    description: 'Impressionist painting style with light and color emphasis',
    category: 'artistic',
    prompt: 'impressionist painting, loose brushwork, emphasis on light, vibrant colors, outdoor scene, Claude Monet style',
    negativePrompt: 'detailed, realistic, sharp',
    thumbnail: '🌅',
    popular: false,
    keywords: ['impressionism', 'monet', 'light', 'color', 'artistic']
  },
  {
    id: 'pencil-sketch',
    name: 'Pencil Sketch',
    description: 'Hand-drawn pencil sketch with shading',
    category: 'artistic',
    prompt: 'pencil sketch, hand-drawn, graphite, shading, crosshatching, paper texture, monochrome, artistic drawing',
    negativePrompt: 'color, painting, photograph',
    thumbnail: '✏️',
    popular: false,
    keywords: ['sketch', 'drawing', 'pencil', 'black and white', 'hand-drawn']
  },
  {
    id: 'ink-drawing',
    name: 'Ink Drawing',
    description: 'Black ink illustration with fine lines',
    category: 'artistic',
    prompt: 'ink drawing, black ink, fine lines, pen and ink, detailed linework, traditional illustration',
    negativePrompt: 'color, photograph, painting',
    thumbnail: '🖋️',
    popular: false,
    keywords: ['ink', 'drawing', 'lines', 'illustration', 'pen']
  },

  // === DIGITAL STYLES ===
  {
    id: 'digital-art',
    name: 'Digital Art',
    description: 'Modern digital illustration with vibrant colors',
    category: 'digital',
    prompt: 'digital art, digital painting, vibrant colors, smooth gradients, modern illustration, concept art',
    negativePrompt: 'traditional, photograph, rough',
    thumbnail: '💻',
    popular: true,
    keywords: ['digital', 'illustration', 'modern', 'vibrant', 'concept']
  },
  {
    id: 'anime',
    name: 'Anime',
    description: 'Japanese anime style illustration',
    category: 'digital',
    prompt: 'anime style, manga illustration, cel shaded, vibrant colors, Japanese animation, clean lines',
    negativePrompt: 'realistic, western cartoon, photograph',
    thumbnail: '🎌',
    popular: true,
    keywords: ['anime', 'manga', 'japanese', 'cartoon', 'illustration']
  },
  {
    id: '3d-render',
    name: '3D Render',
    description: 'Computer-generated 3D render with ray tracing',
    category: 'digital',
    prompt: '3D render, CGI, ray tracing, octane render, unreal engine, volumetric lighting, photorealistic 3D',
    negativePrompt: '2D, flat, painting',
    thumbnail: '🎲',
    popular: true,
    keywords: ['3d', 'render', 'cgi', 'computer', 'raytracing']
  },
  {
    id: 'pixel-art',
    name: 'Pixel Art',
    description: 'Retro pixel art with 8-bit or 16-bit style',
    category: 'digital',
    prompt: 'pixel art, 8-bit, 16-bit, retro game style, pixelated, limited palette, isometric',
    negativePrompt: 'smooth, high resolution, realistic',
    thumbnail: '👾',
    popular: false,
    keywords: ['pixel', 'retro', '8-bit', 'game', 'pixelated']
  },
  {
    id: 'low-poly',
    name: 'Low Poly',
    description: 'Geometric low-polygon 3D style',
    category: 'digital',
    prompt: 'low poly, geometric shapes, polygonal art, flat shading, minimalist 3D, faceted',
    negativePrompt: 'high detail, realistic, smooth',
    thumbnail: '🔷',
    popular: false,
    keywords: ['low poly', 'geometric', 'polygon', '3d', 'minimalist']
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk',
    description: 'Futuristic cyberpunk aesthetic with neon lights',
    category: 'digital',
    prompt: 'cyberpunk, neon lights, futuristic, dystopian city, purple and cyan colors, high tech low life, blade runner aesthetic',
    negativePrompt: 'natural, organic, vintage',
    thumbnail: '🌃',
    popular: true,
    keywords: ['cyberpunk', 'neon', 'futuristic', 'sci-fi', 'dystopian']
  },

  // === VINTAGE STYLES ===
  {
    id: 'vintage-photo',
    name: 'Vintage Photo',
    description: 'Old photograph with sepia tones and grain',
    category: 'vintage',
    prompt: 'vintage photograph, sepia tone, aged photo, film grain, faded colors, old camera, nostalgic',
    negativePrompt: 'modern, sharp, vibrant, digital',
    thumbnail: '📜',
    popular: false,
    keywords: ['vintage', 'old', 'sepia', 'retro', 'nostalgic']
  },
  {
    id: 'polaroid',
    name: 'Polaroid',
    description: 'Instant Polaroid photo with white border',
    category: 'vintage',
    prompt: 'polaroid photo, instant camera, white border frame, slightly faded, warm tones, 1970s aesthetic',
    negativePrompt: 'modern, digital, sharp',
    thumbnail: '📸',
    popular: false,
    keywords: ['polaroid', 'instant', 'retro', '70s', 'frame']
  },
  {
    id: 'art-deco',
    name: 'Art Deco',
    description: '1920s Art Deco style with geometric patterns',
    category: 'vintage',
    prompt: 'art deco style, 1920s aesthetic, geometric patterns, gold accents, elegant, vintage poster, symmetrical',
    negativePrompt: 'modern, organic, rough',
    thumbnail: '💎',
    popular: false,
    keywords: ['art deco', '1920s', 'geometric', 'vintage', 'elegant']
  },
  {
    id: 'retro-futurism',
    name: 'Retro Futurism',
    description: '1950s vision of the future with atomic age aesthetic',
    category: 'vintage',
    prompt: 'retro futurism, 1950s sci-fi, atomic age, space age, vintage technology, optimistic future',
    negativePrompt: 'modern, realistic, gritty',
    thumbnail: '🚀',
    popular: false,
    keywords: ['retro', 'futurism', '1950s', 'space age', 'vintage']
  },

  // === ABSTRACT STYLES ===
  {
    id: 'abstract',
    name: 'Abstract',
    description: 'Non-representational abstract art',
    category: 'abstract',
    prompt: 'abstract art, non-representational, expressive colors, geometric shapes, modern art, contemporary',
    negativePrompt: 'realistic, detailed, representational',
    thumbnail: '🎭',
    popular: false,
    keywords: ['abstract', 'modern', 'shapes', 'colors', 'contemporary']
  },
  {
    id: 'surreal',
    name: 'Surrealism',
    description: 'Dreamlike surrealist composition',
    category: 'abstract',
    prompt: 'surrealism, dreamlike, impossible scenes, Salvador Dali style, imaginative, subconscious imagery',
    negativePrompt: 'realistic, ordinary, conventional',
    thumbnail: '🌀',
    popular: true,
    keywords: ['surreal', 'dream', 'dali', 'imaginative', 'weird']
  },
  {
    id: 'minimalist',
    name: 'Minimalist',
    description: 'Clean minimalist design with simple elements',
    category: 'abstract',
    prompt: 'minimalist, clean design, simple shapes, negative space, limited color palette, modern, elegant',
    negativePrompt: 'complex, detailed, ornate',
    thumbnail: '⬜',
    popular: true,
    keywords: ['minimal', 'simple', 'clean', 'modern', 'elegant']
  },
  {
    id: 'psychedelic',
    name: 'Psychedelic',
    description: 'Vibrant psychedelic art with swirling patterns',
    category: 'abstract',
    prompt: 'psychedelic art, swirling patterns, vibrant colors, trippy, kaleidoscopic, 1960s style, mind-bending',
    negativePrompt: 'simple, muted, realistic',
    thumbnail: '🌈',
    popular: false,
    keywords: ['psychedelic', 'trippy', 'colorful', '60s', 'swirling']
  },

  // === SPECIALIZED STYLES ===
  {
    id: 'comic-book',
    name: 'Comic Book',
    description: 'Comic book style with bold lines and colors',
    category: 'specialized',
    prompt: 'comic book style, bold outlines, halftone dots, vibrant colors, dynamic composition, pop art influence',
    negativePrompt: 'realistic, photograph, subtle',
    thumbnail: '💥',
    popular: true,
    keywords: ['comic', 'cartoon', 'bold', 'pop art', 'superhero']
  },
  {
    id: 'stained-glass',
    name: 'Stained Glass',
    description: 'Medieval stained glass window style',
    category: 'specialized',
    prompt: 'stained glass window, colorful glass panels, lead lines, translucent, gothic cathedral style, light filtering through',
    negativePrompt: 'solid, opaque, modern',
    thumbnail: '🪟',
    popular: false,
    keywords: ['stained glass', 'cathedral', 'colorful', 'medieval', 'window']
  },
  {
    id: 'papercut',
    name: 'Papercut',
    description: 'Layered paper cut-out art style',
    category: 'specialized',
    prompt: 'paper cut art, layered paper, shadow box effect, 3D depth, intricate cutting, handcrafted look',
    negativePrompt: 'flat, digital, painted',
    thumbnail: '✂️',
    popular: false,
    keywords: ['paper', 'cutout', 'layers', 'craft', '3d']
  },
  {
    id: 'isometric',
    name: 'Isometric',
    description: 'Isometric perspective technical illustration',
    category: 'specialized',
    prompt: 'isometric perspective, technical illustration, 30 degree angle, geometric, clean lines, architectural',
    negativePrompt: 'perspective, realistic depth, organic',
    thumbnail: '📐',
    popular: false,
    keywords: ['isometric', 'technical', 'geometric', 'architectural', 'diagram']
  },
  {
    id: 'blueprint',
    name: 'Blueprint',
    description: 'Technical blueprint drawing style',
    category: 'specialized',
    prompt: 'blueprint style, technical drawing, white lines on blue background, architectural plans, precise measurements, schematic',
    negativePrompt: 'artistic, colorful, photographic',
    thumbnail: '📋',
    popular: false,
    keywords: ['blueprint', 'technical', 'architectural', 'drawing', 'plans']
  },
  {
    id: 'fantasy-art',
    name: 'Fantasy Art',
    description: 'Epic fantasy illustration with magical elements',
    category: 'specialized',
    prompt: 'fantasy art, epic illustration, magical elements, detailed characters, dramatic lighting, concept art quality',
    negativePrompt: 'realistic, modern, mundane',
    thumbnail: '🗡️',
    popular: true,
    keywords: ['fantasy', 'magic', 'epic', 'medieval', 'illustration']
  }
];

/**
 * Get all style presets
 */
export function getAllPresets(): ImageStylePreset[] {
  return IMAGE_STYLE_PRESETS;
}

/**
 * Get presets by category
 */
export function getPresetsByCategory(category: ImageStylePreset['category']): ImageStylePreset[] {
  return IMAGE_STYLE_PRESETS.filter(preset => preset.category === category);
}

/**
 * Get popular presets
 */
export function getPopularPresets(): ImageStylePreset[] {
  return IMAGE_STYLE_PRESETS.filter(preset => preset.popular);
}

/**
 * Get preset by ID
 */
export function getPresetById(id: string): ImageStylePreset | undefined {
  return IMAGE_STYLE_PRESETS.find(preset => preset.id === id);
}

/**
 * Search presets by keyword
 */
export function searchPresets(query: string): ImageStylePreset[] {
  const lowerQuery = query.toLowerCase().trim();
  if (!lowerQuery) return IMAGE_STYLE_PRESETS;

  return IMAGE_STYLE_PRESETS.filter(preset =>
    preset.name.toLowerCase().includes(lowerQuery) ||
    preset.description.toLowerCase().includes(lowerQuery) ||
    preset.keywords.some(keyword => keyword.includes(lowerQuery))
  );
}

/**
 * Apply style preset to base prompt
 */
export function applyStyleToPrompt(basePrompt: string, styleId: string): {
  enhancedPrompt: string;
  negativePrompt: string;
} {
  const preset = getPresetById(styleId);

  if (!preset) {
    return {
      enhancedPrompt: basePrompt,
      negativePrompt: ''
    };
  }

  // Combine base prompt with style prompt
  const enhancedPrompt = `${basePrompt}, ${preset.prompt}`;

  return {
    enhancedPrompt,
    negativePrompt: preset.negativePrompt || ''
  };
}

/**
 * Get category display name
 */
export function getCategoryName(category: ImageStylePreset['category']): string {
  const names: Record<ImageStylePreset['category'], string> = {
    realistic: 'Realistic',
    artistic: 'Artistic',
    digital: 'Digital',
    vintage: 'Vintage',
    abstract: 'Abstract',
    specialized: 'Specialized'
  };
  return names[category];
}

/**
 * Get category icon
 */
export function getCategoryIcon(category: ImageStylePreset['category']): string {
  const icons: Record<ImageStylePreset['category'], string> = {
    realistic: '📷',
    artistic: '🎨',
    digital: '💻',
    vintage: '📜',
    abstract: '🎭',
    specialized: '⚡'
  };
  return icons[category];
}

/**
 * Get all categories with counts
 */
export function getCategoriesWithCounts(): Array<{
  category: ImageStylePreset['category'];
  name: string;
  icon: string;
  count: number;
}> {
  const categories: ImageStylePreset['category'][] = [
    'realistic',
    'artistic',
    'digital',
    'vintage',
    'abstract',
    'specialized'
  ];

  return categories.map(category => ({
    category,
    name: getCategoryName(category),
    icon: getCategoryIcon(category),
    count: getPresetsByCategory(category).length
  }));
}

/**
 * Export for other components
 */
export default {
  getAllPresets,
  getPresetsByCategory,
  getPopularPresets,
  getPresetById,
  searchPresets,
  applyStyleToPrompt,
  getCategoryName,
  getCategoryIcon,
  getCategoriesWithCounts
};
