/**
 * Social Media Preview Component
 *
 * Displays realistic previews of how social media posts will appear
 * on Twitter, LinkedIn, and Instagram platforms.
 */

import React from 'react';
import {
  MessageCircle,
  Repeat2,
  Heart,
  Share,
  ThumbsUp,
  Send,
  Bookmark,
  MoreHorizontal
} from 'lucide-react';
import { useThemeLanguage } from '../contexts/ThemeLanguageContext';

export type SocialPlatform = 'twitter' | 'linkedin' | 'instagram';

interface SocialMediaPreviewProps {
  platform: SocialPlatform;
  content: string;
  imageUrl?: string;
  author?: {
    name: string;
    handle?: string;
    avatar?: string;
    title?: string; // For LinkedIn
  };
}

/**
 * Generate default author based on platform
 */
function getDefaultAuthor(platform: SocialPlatform, t: (key: string) => string) {
  return {
    name: t('ui.socialMedia.yourName'),
    handle: platform === 'linkedin' ? undefined : t('ui.socialMedia.yourHandle'),
    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(t('ui.socialMedia.yourName'))}&background=6366f1&color=fff&size=128`,
    title: platform === 'linkedin' ? t('ui.socialMedia.professionalTitle') : undefined
  };
}

/**
 * Format timestamp (mock data for preview)
 */
function getMockTimestamp(): string {
  const now = new Date();
  return now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

const SocialMediaPreview: React.FC<SocialMediaPreviewProps> = ({
  platform,
  content,
  imageUrl,
  author
}) => {
  const { t } = useThemeLanguage();
  const defaultAuthor = getDefaultAuthor(platform, t);
  const displayAuthor = { ...defaultAuthor, ...author };

  // Twitter Preview
  if (platform === 'twitter') {
    return (
      <div className="border rounded-xl bg-white max-w-xl shadow-sm hover:bg-slate-50 transition-colors">
        {/* Header */}
        <div className="p-4">
          <div className="flex items-start gap-3 mb-3">
            <img
              src={displayAuthor.avatar}
              alt={displayAuthor.name}
              className="w-12 h-12 rounded-full flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1 flex-wrap">
                <span className="font-bold text-slate-900 hover:underline cursor-pointer">
                  {displayAuthor.name}
                </span>
                <svg viewBox="0 0 22 22" className="w-5 h-5 text-blue-500" fill="currentColor">
                  <path d="M20.396 11c-.018-.646-.215-1.275-.57-1.816-.354-.54-.852-.972-1.438-1.246.223-.607.27-1.264.14-1.897-.131-.634-.437-1.218-.882-1.687-.47-.445-1.053-.75-1.687-.882-.633-.13-1.29-.083-1.897.14-.273-.587-.704-1.086-1.245-1.44S11.647 1.62 11 1.604c-.646.017-1.273.213-1.813.568s-.969.854-1.24 1.44c-.608-.223-1.267-.272-1.902-.14-.635.13-1.22.436-1.69.882-.445.47-.749 1.055-.878 1.688-.13.633-.08 1.29.144 1.896-.587.274-1.087.705-1.443 1.245-.356.54-.555 1.17-.574 1.817.02.647.218 1.276.574 1.817.356.54.856.972 1.443 1.245-.224.606-.274 1.263-.144 1.896.13.634.433 1.218.877 1.688.47.443 1.054.747 1.687.878.633.132 1.29.084 1.897-.136.274.586.705 1.084 1.246 1.439.54.354 1.17.551 1.816.569.647-.016 1.276-.213 1.817-.567s.972-.854 1.245-1.44c.604.239 1.266.296 1.903.164.636-.132 1.22-.447 1.68-.907.46-.46.776-1.044.908-1.681s.075-1.299-.165-1.903c.586-.274 1.084-.705 1.439-1.246.354-.54.551-1.17.569-1.816zM9.662 14.85l-3.429-3.428 1.293-1.302 2.072 2.072 4.4-4.794 1.347 1.246z" />
                </svg>
                <span className="text-slate-500 text-sm">
                  {displayAuthor.handle}
                </span>
                <span className="text-slate-500 text-sm">·</span>
                <span className="text-slate-500 text-sm hover:underline cursor-pointer">
                  {getMockTimestamp()}
                </span>
              </div>
            </div>
            <button className="p-2 hover:bg-blue-50 rounded-full transition-colors">
              <MoreHorizontal size={18} className="text-slate-500" />
            </button>
          </div>

          {/* Content */}
          <div className="mb-3">
            <p className="text-slate-900 text-[15px] leading-relaxed whitespace-pre-wrap">
              {content}
            </p>
          </div>

          {/* Image */}
          {imageUrl && (
            <div className="rounded-2xl overflow-hidden border border-slate-200 mb-3">
              <img
                src={imageUrl}
                alt="Tweet media"
                className="w-full object-cover"
              />
            </div>
          )}
        </div>

        {/* Engagement Bar */}
        <div className="flex justify-between px-4 pb-3 text-slate-500 text-sm border-t border-slate-100 pt-3">
          <button className="flex items-center gap-2 hover:text-blue-500 transition-colors group">
            <div className="p-2 rounded-full group-hover:bg-blue-50 transition-colors">
              <MessageCircle size={18} />
            </div>
            <span>24</span>
          </button>
          <button className="flex items-center gap-2 hover:text-green-500 transition-colors group">
            <div className="p-2 rounded-full group-hover:bg-green-50 transition-colors">
              <Repeat2 size={18} />
            </div>
            <span>12</span>
          </button>
          <button className="flex items-center gap-2 hover:text-red-500 transition-colors group">
            <div className="p-2 rounded-full group-hover:bg-red-50 transition-colors">
              <Heart size={18} />
            </div>
            <span>156</span>
          </button>
          <button className="flex items-center gap-2 hover:text-blue-500 transition-colors group">
            <div className="p-2 rounded-full group-hover:bg-blue-50 transition-colors">
              <Share size={18} />
            </div>
          </button>
        </div>
      </div>
    );
  }

  // LinkedIn Preview
  if (platform === 'linkedin') {
    return (
      <div className="border rounded-lg bg-white max-w-xl shadow-sm">
        {/* Header */}
        <div className="p-4">
          <div className="flex items-start gap-3 mb-3">
            <img
              src={displayAuthor.avatar}
              alt={displayAuthor.name}
              className="w-12 h-12 rounded-full flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-slate-900 hover:underline cursor-pointer text-sm">
                {displayAuthor.name}
              </div>
              <div className="text-xs text-slate-600 leading-tight">
                {displayAuthor.title || t('ui.socialMedia.professionalTitle')}
              </div>
              <div className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                <span>{getMockTimestamp()}</span>
                <span>•</span>
                <svg viewBox="0 0 16 16" className="w-3 h-3" fill="currentColor">
                  <path d="M8 1a7 7 0 107 7 7 7 0 00-7-7zM3 8a5 5 0 011-3l.5.5L5 6v1a1 1 0 001 1v1a1 1 0 001 1h3a1 1 0 001-1V8a5 5 0 11-8 0z" />
                </svg>
              </div>
            </div>
            <button className="p-2 hover:bg-slate-100 rounded transition-colors">
              <MoreHorizontal size={20} className="text-slate-600" />
            </button>
          </div>

          {/* Content */}
          <div className="mb-3">
            <p className="text-slate-900 text-sm leading-relaxed whitespace-pre-wrap">
              {content}
            </p>
          </div>
        </div>

        {/* Image */}
        {imageUrl && (
          <div className="w-full">
            <img
              src={imageUrl}
              alt="Post media"
              className="w-full object-cover"
            />
          </div>
        )}

        {/* Engagement Bar */}
        <div className="px-4 py-2 border-t border-slate-100">
          <div className="flex justify-between text-slate-600 text-sm">
            <button className="flex items-center gap-2 py-2 px-3 hover:bg-slate-100 rounded transition-colors flex-1 justify-center">
              <ThumbsUp size={18} />
              <span>Like</span>
            </button>
            <button className="flex items-center gap-2 py-2 px-3 hover:bg-slate-100 rounded transition-colors flex-1 justify-center">
              <MessageCircle size={18} />
              <span>Comment</span>
            </button>
            <button className="flex items-center gap-2 py-2 px-3 hover:bg-slate-100 rounded transition-colors flex-1 justify-center">
              <Repeat2 size={18} />
              <span>Repost</span>
            </button>
            <button className="flex items-center gap-2 py-2 px-3 hover:bg-slate-100 rounded transition-colors flex-1 justify-center">
              <Send size={18} />
              <span>Send</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Instagram Preview
  if (platform === 'instagram') {
    return (
      <div className="border rounded-lg bg-white max-w-md shadow-sm">
        {/* Header */}
        <div className="p-3 flex items-center gap-3 border-b border-slate-100">
          <img
            src={displayAuthor.avatar}
            alt={displayAuthor.name}
            className="w-8 h-8 rounded-full flex-shrink-0 ring-2 ring-pink-500 p-0.5"
          />
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-sm text-slate-900">
              {displayAuthor.handle || t('ui.socialMedia.yourHandle')}
            </div>
          </div>
          <button className="p-1">
            <MoreHorizontal size={20} className="text-slate-900" />
          </button>
        </div>

        {/* Image (Instagram is image-first) */}
        {imageUrl && (
          <div className="w-full aspect-square bg-slate-100">
            <img
              src={imageUrl}
              alt="Instagram post"
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Action Bar */}
        <div className="px-3 py-2 flex items-center justify-between">
          <div className="flex gap-4">
            <button className="hover:text-slate-500 transition-colors">
              <Heart size={24} />
            </button>
            <button className="hover:text-slate-500 transition-colors">
              <MessageCircle size={24} />
            </button>
            <button className="hover:text-slate-500 transition-colors">
              <Send size={24} />
            </button>
          </div>
          <button className="hover:text-slate-500 transition-colors">
            <Bookmark size={24} />
          </button>
        </div>

        {/* Likes */}
        <div className="px-3 pb-2">
          <p className="text-sm font-semibold text-slate-900">
            1,234 likes
          </p>
        </div>

        {/* Caption */}
        <div className="px-3 pb-3">
          <p className="text-sm text-slate-900">
            <span className="font-semibold mr-2">
              {displayAuthor.handle || t('ui.socialMedia.yourHandle')}
            </span>
            <span className="whitespace-pre-wrap">{content}</span>
          </p>
          <p className="text-xs text-slate-400 mt-2">
            {getMockTimestamp()}
          </p>
        </div>

        {/* Comment Input */}
        <div className="px-3 pb-3 border-t border-slate-100 pt-3">
          <div className="flex items-center gap-2">
            <img
              src={displayAuthor.avatar}
              alt="Your avatar"
              className="w-6 h-6 rounded-full flex-shrink-0"
            />
            <input
              type="text"
              placeholder="Add a comment..."
              className="flex-1 text-sm text-slate-600 placeholder-slate-400 outline-none"
              disabled
            />
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default SocialMediaPreview;
