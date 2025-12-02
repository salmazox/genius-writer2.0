/**
 * Brand Kit Manager Component
 *
 * Comprehensive brand management interface for logos, colors, fonts, and voice guidelines.
 * Includes file upload, color extraction, and Google Fonts integration.
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Palette,
  Type,
  ImageIcon,
  MessageSquare,
  Plus,
  Trash2,
  Upload,
  Copy,
  Check,
  X,
  Download,
  Sparkles
} from 'lucide-react';
import {
  getBrandKit,
  createBrandKit,
  addLogo,
  removeLogo,
  addColor,
  removeColor,
  updateColor,
  addFont,
  removeFont,
  updateBrandVoice,
  getGoogleFonts,
  loadGoogleFont,
  BrandKit,
  BrandLogo,
  BrandColor,
  BrandFont,
  BrandVoice
} from '../services/brandKit';
import {
  extractColorsFromImage,
  hexToRgb,
  checkWCAGCompliance
} from '../services/colorExtractor';
import { useToast } from '../contexts/ToastContext';

interface BrandKitManagerProps {
  onClose?: () => void;
}

type TabType = 'logos' | 'colors' | 'fonts' | 'voice';

export const BrandKitManager: React.FC<BrandKitManagerProps> = ({ onClose }) => {
  const { showToast } = useToast();
  const [brandKit, setBrandKit] = useState<BrandKit | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('logos');
  const [isExtracting, setIsExtracting] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);

  // Load brand kit
  useEffect(() => {
    let kit = getBrandKit();
    if (!kit) {
      kit = createBrandKit('My Brand');
    }
    setBrandKit(kit);
  }, []);

  const refreshBrandKit = () => {
    const kit = getBrandKit();
    setBrandKit(kit);
  };

  // Logo upload handler
  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showToast('Logo file size must be less than 5MB', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUrl = e.target?.result as string;
      const img = new Image();

      img.onload = async () => {
        try {
          addLogo({
            name: file.name,
            dataUrl,
            type: 'color',
            width: img.width,
            height: img.height,
            fileSize: file.size
          });

          refreshBrandKit();
          showToast('Logo uploaded successfully', 'success');

          // Extract colors from logo
          setIsExtracting(true);
          try {
            const colors = await extractColorsFromImage(dataUrl, 5);
            colors.forEach((color, index) => {
              const type = index === 0 ? 'primary' : index === 1 ? 'secondary' : 'accent';
              addColor({
                name: `Color ${index + 1}`,
                hex: color.hex,
                rgb: color.rgb,
                hsl: color.hsl,
                type
              });
            });
            refreshBrandKit();
            showToast('Colors extracted from logo', 'success');
          } catch (error) {
            console.error('Color extraction failed:', error);
          } finally {
            setIsExtracting(false);
          }
        } catch (error) {
          showToast('Failed to upload logo', 'error');
        }
      };

      img.src = dataUrl;
    };

    reader.readAsDataURL(file);
  };

  const handleDeleteLogo = (logoId: string) => {
    if (confirm('Delete this logo?')) {
      removeLogo(logoId);
      refreshBrandKit();
      showToast('Logo deleted', 'success');
    }
  };

  // Color management
  const [newColorHex, setNewColorHex] = useState('#000000');
  const [newColorName, setNewColorName] = useState('');
  const [newColorType, setNewColorType] = useState<BrandColor['type']>('primary');

  const handleAddColor = () => {
    if (!newColorName.trim()) {
      showToast('Please enter a color name', 'error');
      return;
    }

    const rgb = hexToRgb(newColorHex);
    if (!rgb) {
      showToast('Invalid color hex', 'error');
      return;
    }

    addColor({
      name: newColorName,
      hex: newColorHex,
      rgb,
      hsl: { h: 0, s: 0, l: 0 }, // Will be calculated by service
      type: newColorType
    });

    setNewColorName('');
    setNewColorHex('#000000');
    refreshBrandKit();
    showToast('Color added', 'success');
  };

  const handleDeleteColor = (colorId: string) => {
    removeColor(colorId);
    refreshBrandKit();
    showToast('Color removed', 'success');
  };

  const handleCopyColor = (hex: string) => {
    navigator.clipboard.writeText(hex);
    showToast('Color copied to clipboard', 'success');
  };

  // Font management
  const [showGoogleFonts, setShowGoogleFonts] = useState(false);
  const [selectedFontType, setSelectedFontType] = useState<BrandFont['type']>('heading');
  const googleFonts = getGoogleFonts();

  const handleAddGoogleFont = (fontName: string) => {
    addFont({
      name: fontName,
      family: fontName,
      type: selectedFontType,
      source: 'google',
      url: `https://fonts.googleapis.com/css2?family=${fontName.replace(' ', '+')}`
    });

    loadGoogleFont(fontName);
    refreshBrandKit();
    setShowGoogleFonts(false);
    showToast(`${fontName} added`, 'success');
  };

  const handleDeleteFont = (fontId: string) => {
    removeFont(fontId);
    refreshBrandKit();
    showToast('Font removed', 'success');
  };

  // Voice guidelines
  const [voiceEdits, setVoiceEdits] = useState<Partial<BrandVoice>>({});

  useEffect(() => {
    if (brandKit) {
      setVoiceEdits(brandKit.voice);
    }
  }, [brandKit]);

  const handleSaveVoice = () => {
    updateBrandVoice(voiceEdits);
    refreshBrandKit();
    showToast('Brand voice updated', 'success');
  };

  if (!brandKit) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Sparkles size={48} className="mx-auto text-slate-300 mb-3 animate-spin" />
          <p className="text-slate-500">Loading Brand Kit...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-700 p-4 bg-slate-50 dark:bg-slate-800/50 flex-shrink-0">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Palette size={20} className="text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white">
              Brand Kit
            </h2>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors lg:hidden"
            >
              <X size={20} className="text-slate-600 dark:text-slate-400" />
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setActiveTab('logos')}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'logos'
                ? 'bg-indigo-600 text-white'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
            }`}
          >
            <ImageIcon size={16} />
            Logos
          </button>
          <button
            onClick={() => setActiveTab('colors')}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'colors'
                ? 'bg-indigo-600 text-white'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
            }`}
          >
            <Palette size={16} />
            Colors
          </button>
          <button
            onClick={() => setActiveTab('fonts')}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'fonts'
                ? 'bg-indigo-600 text-white'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
            }`}
          >
            <Type size={16} />
            Fonts
          </button>
          <button
            onClick={() => setActiveTab('voice')}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'voice'
                ? 'bg-indigo-600 text-white'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
            }`}
          >
            <MessageSquare size={16} />
            Voice
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Logos Tab */}
        {activeTab === 'logos' && (
          <div className="space-y-4">
            <div>
              <input
                ref={logoInputRef}
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
              />
              <button
                onClick={() => logoInputRef.current?.click()}
                disabled={isExtracting}
                className="w-full px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              >
                <Upload size={20} />
                {isExtracting ? 'Extracting colors...' : 'Upload Logo'}
              </button>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                Upload a logo to automatically extract brand colors
              </p>
            </div>

            {brandKit.logos.length === 0 ? (
              <div className="text-center py-12">
                <ImageIcon size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
                <p className="text-slate-500 dark:text-slate-400">No logos uploaded yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {brandKit.logos.map((logo) => (
                  <div
                    key={logo.id}
                    className="border border-slate-200 dark:border-slate-700 rounded-lg p-3 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors"
                  >
                    <div className="aspect-square bg-slate-100 dark:bg-slate-800 rounded-lg mb-2 flex items-center justify-center overflow-hidden">
                      <img src={logo.dataUrl} alt={logo.name} className="max-w-full max-h-full object-contain" />
                    </div>
                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate mb-1">
                      {logo.name}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                      {logo.width} × {logo.height}px
                    </p>
                    <button
                      onClick={() => handleDeleteLogo(logo.id)}
                      className="w-full px-3 py-1.5 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-700 dark:text-red-400 rounded-lg text-sm font-medium flex items-center justify-center gap-1"
                    >
                      <Trash2 size={14} />
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Colors Tab */}
        {activeTab === 'colors' && (
          <div className="space-y-4">
            {/* Add Color Form */}
            <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 space-y-3">
              <h3 className="font-semibold text-slate-900 dark:text-white">Add Color</h3>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={newColorHex}
                  onChange={(e) => setNewColorHex(e.target.value)}
                  className="w-16 h-16 rounded cursor-pointer"
                />
                <div className="flex-1 space-y-2">
                  <input
                    type="text"
                    value={newColorName}
                    onChange={(e) => setNewColorName(e.target.value)}
                    placeholder="Color name"
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <select
                    value={newColorType}
                    onChange={(e) => setNewColorType(e.target.value as BrandColor['type'])}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="primary">Primary</option>
                    <option value="secondary">Secondary</option>
                    <option value="accent">Accent</option>
                    <option value="neutral">Neutral</option>
                  </select>
                </div>
                <button
                  onClick={handleAddColor}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            {/* Color List */}
            {brandKit.colors.length === 0 ? (
              <div className="text-center py-12">
                <Palette size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
                <p className="text-slate-500 dark:text-slate-400">No colors added yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {brandKit.colors.map((color) => {
                  const contrastCheck = checkWCAGCompliance(
                    color.rgb,
                    { r: 255, g: 255, b: 255 },
                    'AA'
                  );

                  return (
                    <div
                      key={color.id}
                      className="border border-slate-200 dark:border-slate-700 rounded-lg p-3"
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className="w-16 h-16 rounded-lg flex-shrink-0"
                          style={{ backgroundColor: color.hex }}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-1">
                            <div>
                              <p className="font-medium text-slate-900 dark:text-white">
                                {color.name}
                              </p>
                              <span className="inline-block px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs rounded-full capitalize">
                                {color.type}
                              </span>
                            </div>
                            <button
                              onClick={() => handleDeleteColor(color.id)}
                              className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                            >
                              <Trash2 size={14} className="text-red-600 dark:text-red-400" />
                            </button>
                          </div>
                          <div className="space-y-1 text-xs">
                            <button
                              onClick={() => handleCopyColor(color.hex)}
                              className="flex items-center gap-1 text-slate-600 dark:text-slate-400 hover:text-indigo-600"
                            >
                              <Copy size={12} />
                              {color.hex}
                            </button>
                            <p className="text-slate-500 dark:text-slate-400">
                              RGB: {color.rgb.r}, {color.rgb.g}, {color.rgb.b}
                            </p>
                            <p className={`flex items-center gap-1 ${contrastCheck.passes ? 'text-green-600' : 'text-amber-600'}`}>
                              {contrastCheck.passes ? <Check size={12} /> : <X size={12} />}
                              WCAG {contrastCheck.ratio.toFixed(2)}:1
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Fonts Tab */}
        {activeTab === 'fonts' && (
          <div className="space-y-4">
            <div>
              <button
                onClick={() => setShowGoogleFonts(!showGoogleFonts)}
                className="w-full px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium flex items-center justify-center gap-2"
              >
                <Plus size={20} />
                Add Google Font
              </button>
            </div>

            {showGoogleFonts && (
              <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-slate-900 dark:text-white">Select Font Type</h3>
                  <button
                    onClick={() => setShowGoogleFonts(false)}
                    className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded"
                  >
                    <X size={16} />
                  </button>
                </div>
                <select
                  value={selectedFontType}
                  onChange={(e) => setSelectedFontType(e.target.value as BrandFont['type'])}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm"
                >
                  <option value="heading">Heading Font</option>
                  <option value="body">Body Font</option>
                  <option value="accent">Accent Font</option>
                </select>
                <div className="max-h-64 overflow-y-auto space-y-2">
                  {googleFonts.map((font) => (
                    <button
                      key={font.name}
                      onClick={() => handleAddGoogleFont(font.name)}
                      className="w-full px-3 py-2 text-left border border-slate-200 dark:border-slate-700 rounded-lg hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors"
                      style={{ fontFamily: font.name }}
                    >
                      <span className="text-lg">{font.name}</span>
                      <span className="text-xs text-slate-500 ml-2">({font.category})</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {brandKit.fonts.length === 0 ? (
              <div className="text-center py-12">
                <Type size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
                <p className="text-slate-500 dark:text-slate-400">No fonts added yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {brandKit.fonts.map((font) => (
                  <div
                    key={font.id}
                    className="border border-slate-200 dark:border-slate-700 rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">{font.name}</p>
                        <span className="inline-block px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs rounded-full capitalize">
                          {font.type}
                        </span>
                      </div>
                      <button
                        onClick={() => handleDeleteFont(font.id)}
                        className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                      >
                        <Trash2 size={14} className="text-red-600 dark:text-red-400" />
                      </button>
                    </div>
                    <p
                      className="text-2xl mt-2"
                      style={{ fontFamily: font.family }}
                    >
                      The quick brown fox jumps over the lazy dog
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Voice Tab */}
        {activeTab === 'voice' && (
          <div className="space-y-4">
            <div className="space-y-4">
              {/* Tone */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Brand Tone
                </label>
                <select
                  value={voiceEdits.tone}
                  onChange={(e) => setVoiceEdits({ ...voiceEdits, tone: e.target.value as any })}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="professional">Professional</option>
                  <option value="casual">Casual</option>
                  <option value="friendly">Friendly</option>
                  <option value="formal">Formal</option>
                  <option value="playful">Playful</option>
                  <option value="authoritative">Authoritative</option>
                </select>
              </div>

              {/* Target Audience */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Target Audience
                </label>
                <textarea
                  value={voiceEdits.targetAudience}
                  onChange={(e) => setVoiceEdits({ ...voiceEdits, targetAudience: e.target.value })}
                  placeholder="Describe your target audience..."
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[80px]"
                />
              </div>

              {/* Do's */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Do's (one per line)
                </label>
                <textarea
                  value={voiceEdits.dos?.join('\n')}
                  onChange={(e) => setVoiceEdits({ ...voiceEdits, dos: e.target.value.split('\n').filter(s => s.trim()) })}
                  placeholder="Use active voice&#10;Be concise&#10;Show empathy"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[100px]"
                />
              </div>

              {/* Don'ts */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Don'ts (one per line)
                </label>
                <textarea
                  value={voiceEdits.donts?.join('\n')}
                  onChange={(e) => setVoiceEdits({ ...voiceEdits, donts: e.target.value.split('\n').filter(s => s.trim()) })}
                  placeholder="Avoid jargon&#10;Don't use passive voice&#10;No technical terms"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[100px]"
                />
              </div>

              {/* Save Button */}
              <button
                onClick={handleSaveVoice}
                className="w-full px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium flex items-center justify-center gap-2"
              >
                <Check size={20} />
                Save Brand Voice
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BrandKitManager;
