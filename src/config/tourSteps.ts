/**
 * Onboarding Tour Configuration
 *
 * Defines all tour steps for different user journeys
 */

export interface TourStep {
  id: string;
  target: string; // CSS selector for element to highlight
  title: string;
  content: string;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  action?: {
    label: string;
    onClick: () => void;
  };
  spotlightPadding?: number; // Padding around highlighted element
  disableBeacon?: boolean; // Disable pulsing beacon
}

export interface Tour {
  id: string;
  name: string;
  steps: TourStep[];
  autoStart?: boolean;
  showProgress?: boolean;
}

/**
 * First-time user tour
 */
export const FIRST_TIME_USER_TOUR: Tour = {
  id: 'first-time-user',
  name: 'Welcome to Genius Writer',
  autoStart: true,
  showProgress: true,
  steps: [
    {
      id: 'welcome',
      target: 'body',
      title: 'Welcome to Genius Writer! 🎉',
      content: 'Let\'s take a quick tour to help you get started with our AI-powered writing tools.',
      placement: 'top',
      disableBeacon: true
    },
    {
      id: 'dashboard-tools',
      target: '[data-tour="tools-grid"]',
      title: 'Explore Our AI Tools',
      content: 'Choose from CV Builder, Blog Writer, LinkedIn Posts, Email Writer, and more. Each tool is optimized for specific writing tasks.',
      placement: 'bottom',
      spotlightPadding: 20
    },
    {
      id: 'tool-selection',
      target: '[data-tour="tool-card"]:first-child',
      title: 'Select a Tool',
      content: 'Click on any tool card to open it. Try the CV Builder to create professional resumes with AI assistance.',
      placement: 'right',
      spotlightPadding: 10
    },
    {
      id: 'documents-library',
      target: '[data-tour="documents-section"]',
      title: 'Your Document Library',
      content: 'All your created documents are automatically saved here. Access them anytime to continue editing.',
      placement: 'top',
      spotlightPadding: 15
    },
    {
      id: 'user-menu',
      target: '[data-tour="user-menu"]',
      title: 'Account Settings',
      content: 'Access your profile, billing, usage statistics, and settings from here.',
      placement: 'left',
      spotlightPadding: 10
    },
    {
      id: 'complete',
      target: 'body',
      title: 'You\'re All Set! ✨',
      content: 'You\'re ready to start creating amazing content with AI. Need help? Check the help icon in the top right corner.',
      placement: 'top',
      disableBeacon: true
    }
  ]
};

/**
 * CV Builder feature tour
 */
export const CV_BUILDER_TOUR: Tour = {
  id: 'cv-builder',
  name: 'CV Builder Tour',
  showProgress: true,
  steps: [
    {
      id: 'cv-form',
      target: '[data-tour="cv-form"]',
      title: 'Fill in Your Details',
      content: 'Start by entering your personal information, work experience, and skills. The more details you provide, the better your CV will be.',
      placement: 'right',
      spotlightPadding: 15
    },
    {
      id: 'ai-generate',
      target: '[data-tour="generate-button"]',
      title: 'Generate with AI',
      content: 'Click here to let AI transform your information into professionally written CV content with optimized language.',
      placement: 'top',
      spotlightPadding: 10
    },
    {
      id: 'preview',
      target: '[data-tour="cv-preview"]',
      title: 'Live Preview',
      content: 'Watch your CV come to life in real-time. Any changes you make will instantly appear in the preview.',
      placement: 'left',
      spotlightPadding: 20
    },
    {
      id: 'export',
      target: '[data-tour="export-button"]',
      title: 'Export Your CV',
      content: 'When you\'re happy with your CV, export it as PDF, DOCX, or other formats depending on your plan.',
      placement: 'bottom',
      spotlightPadding: 10
    },
    {
      id: 'templates',
      target: '[data-tour="template-selector"]',
      title: 'Try Different Templates',
      content: 'Switch between professional templates to find the perfect look for your CV.',
      placement: 'top',
      spotlightPadding: 10
    }
  ]
};

/**
 * Blog Writer feature tour
 */
export const BLOG_WRITER_TOUR: Tour = {
  id: 'blog-writer',
  name: 'Blog Writer Tour',
  showProgress: true,
  steps: [
    {
      id: 'blog-topic',
      target: '[data-tour="topic-input"]',
      title: 'Enter Your Topic',
      content: 'Tell us what you want to write about. Be specific for better results!',
      placement: 'bottom',
      spotlightPadding: 10
    },
    {
      id: 'blog-options',
      target: '[data-tour="blog-options"]',
      title: 'Customize Your Blog',
      content: 'Set the tone, length, and style. Choose keywords to optimize for SEO.',
      placement: 'right',
      spotlightPadding: 15
    },
    {
      id: 'generate-blog',
      target: '[data-tour="generate-button"]',
      title: 'Generate Content',
      content: 'AI will create a complete blog post with introduction, body paragraphs, and conclusion.',
      placement: 'top',
      spotlightPadding: 10
    },
    {
      id: 'edit-content',
      target: '[data-tour="editor"]',
      title: 'Edit and Refine',
      content: 'Use our rich text editor to customize the generated content. Add images, format text, and make it your own.',
      placement: 'left',
      spotlightPadding: 20
    },
    {
      id: 'analysis-panel',
      target: '[data-tour="analysis-panel"]',
      title: 'Content Analysis',
      content: 'Check readability scores, tone analysis, and SEO recommendations to improve your content.',
      placement: 'left',
      spotlightPadding: 15
    }
  ]
};

/**
 * Smart Editor feature tour
 */
export const SMART_EDITOR_TOUR: Tour = {
  id: 'smart-editor',
  name: 'Smart Editor Tour',
  showProgress: true,
  steps: [
    {
      id: 'editor-workspace',
      target: '[data-tour="editor"]',
      title: 'Your Writing Workspace',
      content: 'Write or paste your content here. The AI is always ready to help improve your writing.',
      placement: 'top',
      spotlightPadding: 20
    },
    {
      id: 'ai-suggestions',
      target: '[data-tour="ai-suggestions"]',
      title: 'AI Suggestions',
      content: 'Select any text to get AI-powered suggestions for improvement, rephrasing, or expansion.',
      placement: 'right',
      spotlightPadding: 15
    },
    {
      id: 'formatting-tools',
      target: '[data-tour="formatting-toolbar"]',
      title: 'Formatting Tools',
      content: 'Format your text with headers, lists, bold, italic, and more professional styling options.',
      placement: 'bottom',
      spotlightPadding: 10
    },
    {
      id: 'word-count',
      target: '[data-tour="word-count"]',
      title: 'Writing Statistics',
      content: 'Track your word count, reading time, and other writing metrics in real-time.',
      placement: 'left',
      spotlightPadding: 10
    }
  ]
};

/**
 * Billing & Usage tour
 */
export const BILLING_TOUR: Tour = {
  id: 'billing',
  name: 'Billing & Usage Tour',
  showProgress: true,
  steps: [
    {
      id: 'current-plan',
      target: '[data-tour="current-plan"]',
      title: 'Your Current Plan',
      content: 'View your active subscription tier and billing details here.',
      placement: 'bottom',
      spotlightPadding: 15
    },
    {
      id: 'usage-metrics',
      target: '[data-tour="usage-metrics"]',
      title: 'Usage Statistics',
      content: 'Monitor your AI generations, document count, and storage usage. Stay within your plan limits or upgrade for more.',
      placement: 'right',
      spotlightPadding: 20
    },
    {
      id: 'upgrade-plans',
      target: '[data-tour="upgrade-section"]',
      title: 'Upgrade Your Plan',
      content: 'Unlock more features, higher limits, and advanced tools by upgrading to a higher tier.',
      placement: 'top',
      spotlightPadding: 15
    },
    {
      id: 'billing-history',
      target: '[data-tour="invoices"]',
      title: 'Billing History',
      content: 'Access all your invoices and payment history. Download receipts anytime you need them.',
      placement: 'left',
      spotlightPadding: 10
    }
  ]
};

/**
 * All available tours
 */
export const ALL_TOURS: Record<string, Tour> = {
  'first-time-user': FIRST_TIME_USER_TOUR,
  'cv-builder': CV_BUILDER_TOUR,
  'blog-writer': BLOG_WRITER_TOUR,
  'smart-editor': SMART_EDITOR_TOUR,
  'billing': BILLING_TOUR
};

/**
 * Get tour by ID
 */
export function getTour(tourId: string): Tour | undefined {
  return ALL_TOURS[tourId];
}

/**
 * Check if user has completed a tour
 */
export function hasCompletedTour(tourId: string): boolean {
  try {
    const completed = localStorage.getItem(`tour_completed_${tourId}`);
    return completed === 'true';
  } catch {
    return false;
  }
}

/**
 * Mark tour as completed
 */
export function markTourCompleted(tourId: string): void {
  try {
    localStorage.setItem(`tour_completed_${tourId}`, 'true');
  } catch (error) {
    console.error('Failed to mark tour as completed:', error);
  }
}

/**
 * Reset tour progress
 */
export function resetTour(tourId: string): void {
  try {
    localStorage.removeItem(`tour_completed_${tourId}`);
  } catch (error) {
    console.error('Failed to reset tour:', error);
  }
}

/**
 * Reset all tours
 */
export function resetAllTours(): void {
  Object.keys(ALL_TOURS).forEach(tourId => resetTour(tourId));
}
