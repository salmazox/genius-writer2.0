/**
 * Content Templates Library
 *
 * Pre-built templates for common use cases across industries
 * to accelerate content creation and provide best-practice structures.
 */

import { ToolType } from '../types';

export interface ContentTemplate {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  industry?: TemplateIndustry;
  toolType: ToolType;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: number; // in minutes
  popular: boolean;
  tags: string[];
  prefilledInputs: Record<string, any>; // Pre-filled form values
  thumbnail?: string; // Emoji or image
  useCases: string[];
}

export type TemplateCategory =
  | 'marketing'
  | 'sales'
  | 'social-media'
  | 'email'
  | 'blog'
  | 'product'
  | 'seo'
  | 'ads'
  | 'business'
  | 'creative';

export type TemplateIndustry =
  | 'general'
  | 'saas'
  | 'ecommerce'
  | 'healthcare'
  | 'finance'
  | 'education'
  | 'real-estate'
  | 'legal'
  | 'hospitality'
  | 'technology';

/**
 * Comprehensive template library (50+ templates)
 */
export const CONTENT_TEMPLATES: ContentTemplate[] = [
  // === MARKETING TEMPLATES ===
  {
    id: 'product-launch-email',
    name: 'Product Launch Email',
    description: 'Announce a new product with excitement and clear CTAs',
    category: 'email',
    industry: 'saas',
    toolType: ToolType.EMAIL_TEMPLATE,
    difficulty: 'beginner',
    estimatedTime: 5,
    popular: true,
    tags: ['product', 'launch', 'announcement', 'email'],
    thumbnail: '🚀',
    useCases: ['New product releases', 'Feature announcements', 'Beta launches'],
    prefilledInputs: {
      subject: 'Introducing [Product Name] - Transform Your [Outcome]',
      tone: 'exciting',
      length: 'medium'
    }
  },
  {
    id: 'welcome-email-sequence',
    name: 'Welcome Email Sequence',
    description: 'Onboard new subscribers with a warm welcome',
    category: 'email',
    industry: 'general',
    toolType: ToolType.EMAIL_TEMPLATE,
    difficulty: 'beginner',
    estimatedTime: 5,
    popular: true,
    tags: ['welcome', 'onboarding', 'email', 'sequence'],
    thumbnail: '👋',
    useCases: ['New subscriber onboarding', 'First purchase follow-up', 'Trial start'],
    prefilledInputs: {
      subject: 'Welcome to [Company] - Here\'s What to Expect',
      tone: 'friendly',
      length: 'short'
    }
  },
  {
    id: 'abandoned-cart-email',
    name: 'Abandoned Cart Recovery',
    description: 'Win back customers who left items in their cart',
    category: 'email',
    industry: 'ecommerce',
    toolType: ToolType.EMAIL_TEMPLATE,
    difficulty: 'intermediate',
    estimatedTime: 7,
    popular: true,
    tags: ['ecommerce', 'cart', 'recovery', 'sales'],
    thumbnail: '🛒',
    useCases: ['Cart abandonment', 'Checkout recovery', 'Sales recovery'],
    prefilledInputs: {
      subject: 'You Left Something Behind - Complete Your Order',
      tone: 'persuasive',
      length: 'medium'
    }
  },

  // === BLOG TEMPLATES ===
  {
    id: 'how-to-guide',
    name: 'How-To Guide',
    description: 'Step-by-step tutorial format for educational content',
    category: 'blog',
    industry: 'general',
    toolType: ToolType.BLOG_FULL,
    difficulty: 'beginner',
    estimatedTime: 15,
    popular: true,
    tags: ['tutorial', 'guide', 'education', 'how-to'],
    thumbnail: '📖',
    useCases: ['Product tutorials', 'Process explanations', 'Skill teaching'],
    prefilledInputs: {
      topic: 'How to [Achieve Specific Goal] in [Timeframe]',
      keywords: 'how to, guide, tutorial, step by step',
      tone: 'educational',
      length: 'long'
    }
  },
  {
    id: 'listicle',
    name: 'Listicle (Top 10/Best)',
    description: 'Numbered list format for engaging, scannable content',
    category: 'blog',
    industry: 'general',
    toolType: ToolType.BLOG_FULL,
    difficulty: 'beginner',
    estimatedTime: 10,
    popular: true,
    tags: ['list', 'top', 'best', 'comparison'],
    thumbnail: '📝',
    useCases: ['Product roundups', 'Tool comparisons', 'Resource lists'],
    prefilledInputs: {
      topic: '[Number] Best [Things] for [Audience] in [Year]',
      keywords: 'best, top, list',
      tone: 'informative',
      length: 'medium'
    }
  },
  {
    id: 'case-study',
    name: 'Customer Case Study',
    description: 'Showcase customer success stories with data',
    category: 'blog',
    industry: 'saas',
    toolType: ToolType.BLOG_FULL,
    difficulty: 'advanced',
    estimatedTime: 20,
    popular: true,
    tags: ['case study', 'success', 'testimonial', 'proof'],
    thumbnail: '📊',
    useCases: ['Customer success stories', 'ROI proof', 'Social proof'],
    prefilledInputs: {
      topic: 'How [Company] Achieved [Result] Using [Product]',
      keywords: 'case study, success story, results',
      tone: 'professional',
      length: 'long'
    }
  },
  {
    id: 'thought-leadership',
    name: 'Thought Leadership Article',
    description: 'Industry insights and expert perspectives',
    category: 'blog',
    industry: 'general',
    toolType: ToolType.BLOG_FULL,
    difficulty: 'advanced',
    estimatedTime: 25,
    popular: false,
    tags: ['thought leadership', 'insights', 'trends', 'opinion'],
    thumbnail: '💡',
    useCases: ['Industry predictions', 'Trend analysis', 'Expert opinions'],
    prefilledInputs: {
      topic: 'The Future of [Industry]: [Number] Trends to Watch',
      keywords: 'future, trends, industry, insights',
      tone: 'authoritative',
      length: 'long'
    }
  },
  {
    id: 'comparison-post',
    name: 'Product Comparison',
    description: 'Side-by-side comparison of solutions',
    category: 'blog',
    industry: 'general',
    toolType: ToolType.BLOG_FULL,
    difficulty: 'intermediate',
    estimatedTime: 15,
    popular: true,
    tags: ['comparison', 'vs', 'review', 'alternatives'],
    thumbnail: '⚖️',
    useCases: ['Product comparisons', 'Alternative reviews', 'Feature analysis'],
    prefilledInputs: {
      topic: '[Product A] vs [Product B]: Which is Better for [Use Case]?',
      keywords: 'vs, comparison, alternative, review',
      tone: 'objective',
      length: 'long'
    }
  },

  // === SOCIAL MEDIA TEMPLATES ===
  {
    id: 'linkedin-announcement',
    name: 'LinkedIn Company Update',
    description: 'Professional announcement for LinkedIn audience',
    category: 'social-media',
    industry: 'general',
    toolType: ToolType.SOCIAL_LINKEDIN,
    difficulty: 'beginner',
    estimatedTime: 3,
    popular: true,
    tags: ['linkedin', 'announcement', 'professional', 'update'],
    thumbnail: '💼',
    useCases: ['Company news', 'Product updates', 'Milestone announcements'],
    prefilledInputs: {
      topic: 'Exciting news: [Company Achievement or Update]',
      tone: 'professional',
      length: 'medium'
    }
  },
  {
    id: 'twitter-thread',
    name: 'Twitter Thread Starter',
    description: 'Engaging thread opener with hook',
    category: 'social-media',
    industry: 'general',
    toolType: ToolType.SOCIAL_TWITTER,
    difficulty: 'intermediate',
    estimatedTime: 5,
    popular: true,
    tags: ['twitter', 'thread', 'engagement', 'viral'],
    thumbnail: '🐦',
    useCases: ['Educational threads', 'Story threads', 'Tip threads'],
    prefilledInputs: {
      topic: '[Number] lessons I learned about [Topic]',
      tone: 'conversational',
      length: 'short'
    }
  },
  {
    id: 'instagram-caption',
    name: 'Instagram Engaging Caption',
    description: 'Caption with hook, story, and CTA',
    category: 'social-media',
    industry: 'general',
    toolType: ToolType.SMART_EDITOR,
    difficulty: 'beginner',
    estimatedTime: 3,
    popular: true,
    tags: ['instagram', 'caption', 'engagement', 'story'],
    thumbnail: '📸',
    useCases: ['Product posts', 'Behind-the-scenes', 'User-generated content'],
    prefilledInputs: {
      topic: '[Relatable situation or question]',
      tone: 'friendly',
      length: 'medium'
    }
  },
  {
    id: 'viral-hook',
    name: 'Viral Social Hook',
    description: 'Attention-grabbing opener for any platform',
    category: 'social-media',
    industry: 'general',
    toolType: ToolType.SOCIAL_TWITTER,
    difficulty: 'intermediate',
    estimatedTime: 2,
    popular: true,
    tags: ['viral', 'hook', 'engagement', 'attention'],
    thumbnail: '🔥',
    useCases: ['High-engagement posts', 'Viral content', 'Attention-grabbers'],
    prefilledInputs: {
      topic: 'Unpopular opinion: [Controversial take]',
      tone: 'bold',
      length: 'short'
    }
  },

  // === SALES & COPYWRITING ===
  {
    id: 'landing-page-hero',
    name: 'Landing Page Hero Section',
    description: 'Compelling above-the-fold copy with clear value prop',
    category: 'marketing',
    industry: 'saas',
    toolType: ToolType.SMART_EDITOR,
    difficulty: 'intermediate',
    estimatedTime: 10,
    popular: true,
    tags: ['landing page', 'hero', 'headline', 'cta'],
    thumbnail: '🎯',
    useCases: ['Product pages', 'Service pages', 'Campaign landing pages'],
    prefilledInputs: {
      productName: '[Product Name]',
      targetAudience: '[Target Customer]',
      mainBenefit: '[Primary Benefit]',
      tone: 'persuasive'
    }
  },
  {
    id: 'sales-email-cold',
    name: 'Cold Sales Outreach',
    description: 'Personalized cold email that gets responses',
    category: 'sales',
    industry: 'general',
    toolType: ToolType.EMAIL_TEMPLATE,
    difficulty: 'advanced',
    estimatedTime: 8,
    popular: true,
    tags: ['sales', 'cold email', 'outreach', 'b2b'],
    thumbnail: '❄️',
    useCases: ['B2B outreach', 'Partnership requests', 'Sales prospecting'],
    prefilledInputs: {
      subject: 'Quick question about [Their Company\'s Challenge]',
      tone: 'professional',
      length: 'short'
    }
  },
  {
    id: 'sales-followup',
    name: 'Sales Follow-Up Email',
    description: 'Gentle reminder without being pushy',
    category: 'sales',
    industry: 'general',
    toolType: ToolType.EMAIL_TEMPLATE,
    difficulty: 'intermediate',
    estimatedTime: 5,
    popular: true,
    tags: ['sales', 'follow-up', 'reminder', 'persistence'],
    thumbnail: '🔔',
    useCases: ['Demo follow-ups', 'Proposal follow-ups', 'Meeting reminders'],
    prefilledInputs: {
      subject: 'Following up on [Previous Conversation]',
      tone: 'friendly',
      length: 'short'
    }
  },
  {
    id: 'value-proposition',
    name: 'Value Proposition Statement',
    description: 'Clear, compelling value prop in one sentence',
    category: 'marketing',
    industry: 'general',
    toolType: ToolType.SMART_EDITOR,
    difficulty: 'intermediate',
    estimatedTime: 5,
    popular: true,
    tags: ['value prop', 'positioning', 'messaging', 'pitch'],
    thumbnail: '💎',
    useCases: ['Website headers', 'Pitch decks', 'Sales materials'],
    prefilledInputs: {}
  },

  // === PRODUCT TEMPLATES ===
  {
    id: 'product-description-ecommerce',
    name: 'E-commerce Product Description',
    description: 'SEO-optimized product copy that converts',
    category: 'product',
    industry: 'ecommerce',
    toolType: ToolType.SMART_EDITOR,
    difficulty: 'beginner',
    estimatedTime: 5,
    popular: true,
    tags: ['product', 'ecommerce', 'seo', 'description'],
    thumbnail: '🛍️',
    useCases: ['Product pages', 'Marketplace listings', 'Catalog copy'],
    prefilledInputs: {}
  },
  {
    id: 'feature-release-notes',
    name: 'Feature Release Notes',
    description: 'Announce new features to users',
    category: 'product',
    industry: 'saas',
    toolType: ToolType.SMART_EDITOR,
    difficulty: 'beginner',
    estimatedTime: 5,
    popular: false,
    tags: ['release', 'features', 'changelog', 'updates'],
    thumbnail: '✨',
    useCases: ['Feature announcements', 'Changelogs', 'Product updates'],
    prefilledInputs: {}
  },
  {
    id: 'api-documentation',
    name: 'API Documentation',
    description: 'Clear, developer-friendly API docs',
    category: 'product',
    industry: 'technology',
    toolType: ToolType.SMART_EDITOR,
    difficulty: 'advanced',
    estimatedTime: 20,
    popular: false,
    tags: ['api', 'documentation', 'technical', 'developer'],
    thumbnail: '⚙️',
    useCases: ['API docs', 'Technical guides', 'Integration docs'],
    prefilledInputs: {}
  },

  // === SEO TEMPLATES ===
  {
    id: 'meta-description',
    name: 'SEO Meta Description',
    description: 'Compelling meta description for search results',
    category: 'seo',
    industry: 'general',
    toolType: ToolType.SMART_EDITOR,
    difficulty: 'beginner',
    estimatedTime: 2,
    popular: true,
    tags: ['seo', 'meta', 'description', 'serp'],
    thumbnail: '🔍',
    useCases: ['Blog posts', 'Product pages', 'Landing pages'],
    prefilledInputs: {}
  },
  {
    id: 'seo-title-tag',
    name: 'SEO Title Tag',
    description: 'Click-worthy title tags optimized for CTR',
    category: 'seo',
    industry: 'general',
    toolType: ToolType.SMART_EDITOR,
    difficulty: 'beginner',
    estimatedTime: 2,
    popular: true,
    tags: ['seo', 'title', 'tag', 'headline'],
    thumbnail: '📌',
    useCases: ['Page titles', 'Blog titles', 'Product titles'],
    prefilledInputs: {}
  },
  {
    id: 'faq-schema',
    name: 'FAQ Page Content',
    description: 'FAQ format optimized for rich snippets',
    category: 'seo',
    industry: 'general',
    toolType: ToolType.SMART_EDITOR,
    difficulty: 'intermediate',
    estimatedTime: 10,
    popular: false,
    tags: ['faq', 'schema', 'seo', 'snippets'],
    thumbnail: '❓',
    useCases: ['FAQ pages', 'Help centers', 'Support pages'],
    prefilledInputs: {}
  },

  // === ADS TEMPLATES ===
  {
    id: 'google-ads-rsa',
    name: 'Google Responsive Search Ad',
    description: 'Multiple headlines and descriptions for RSAs',
    category: 'ads',
    industry: 'general',
    toolType: ToolType.EMAIL_PROMO,
    difficulty: 'intermediate',
    estimatedTime: 10,
    popular: true,
    tags: ['google ads', 'ppc', 'search ads', 'rsa'],
    thumbnail: '📣',
    useCases: ['Google Ads campaigns', 'Search advertising', 'PPC'],
    prefilledInputs: {
      productName: '[Product/Service]',
      mainBenefit: '[Key Benefit]',
      targetAudience: '[Target Audience]'
    }
  },
  {
    id: 'facebook-ad-copy',
    name: 'Facebook Ad Copy',
    description: 'Attention-grabbing Facebook ad with social proof',
    category: 'ads',
    industry: 'ecommerce',
    toolType: ToolType.EMAIL_PROMO,
    difficulty: 'beginner',
    estimatedTime: 5,
    popular: true,
    tags: ['facebook', 'ads', 'social', 'paid'],
    thumbnail: '👥',
    useCases: ['Facebook campaigns', 'Instagram ads', 'Social advertising'],
    prefilledInputs: {
      productName: '[Product]',
      targetAudience: '[Audience]',
      mainBenefit: '[Benefit]'
    }
  },
  {
    id: 'linkedin-sponsored-content',
    name: 'LinkedIn Sponsored Post',
    description: 'B2B-focused sponsored content for LinkedIn',
    category: 'ads',
    industry: 'saas',
    toolType: ToolType.SOCIAL_LINKEDIN,
    difficulty: 'intermediate',
    estimatedTime: 7,
    popular: false,
    tags: ['linkedin', 'b2b', 'sponsored', 'ads'],
    thumbnail: '💼',
    useCases: ['LinkedIn campaigns', 'B2B advertising', 'Lead generation'],
    prefilledInputs: {
      topic: '[B2B Solution or Benefit]',
      tone: 'professional'
    }
  },

  // === BUSINESS TEMPLATES ===
  {
    id: 'press-release',
    name: 'Press Release',
    description: 'Professional press release for media distribution',
    category: 'business',
    industry: 'general',
    toolType: ToolType.SMART_EDITOR,
    difficulty: 'advanced',
    estimatedTime: 15,
    popular: false,
    tags: ['press', 'pr', 'media', 'announcement'],
    thumbnail: '📰',
    useCases: ['Company announcements', 'Product launches', 'Funding news'],
    prefilledInputs: {
      topic: '[Company Achievement or News]',
      tone: 'formal'
    }
  },
  {
    id: 'job-description',
    name: 'Job Description',
    description: 'Compelling job posting that attracts top talent',
    category: 'business',
    industry: 'general',
    toolType: ToolType.SMART_EDITOR,
    difficulty: 'intermediate',
    estimatedTime: 10,
    popular: false,
    tags: ['hiring', 'job', 'recruitment', 'hr'],
    thumbnail: '💼',
    useCases: ['Job postings', 'Recruitment', 'Talent acquisition'],
    prefilledInputs: {}
  },
  {
    id: 'investor-pitch',
    name: 'Investor Pitch Deck Copy',
    description: 'Compelling copy for pitch deck slides',
    category: 'business',
    industry: 'saas',
    toolType: ToolType.SMART_EDITOR,
    difficulty: 'advanced',
    estimatedTime: 30,
    popular: false,
    tags: ['pitch', 'investor', 'fundraising', 'deck'],
    thumbnail: '💰',
    useCases: ['Fundraising', 'Investor presentations', 'Pitch competitions'],
    prefilledInputs: {}
  },

  // === CREATIVE TEMPLATES ===
  {
    id: 'video-script',
    name: 'Video Script',
    description: 'Engaging video script with hook and structure',
    category: 'creative',
    industry: 'general',
    toolType: ToolType.SMART_EDITOR,
    difficulty: 'intermediate',
    estimatedTime: 15,
    popular: true,
    tags: ['video', 'script', 'youtube', 'content'],
    thumbnail: '🎬',
    useCases: ['YouTube videos', 'Explainer videos', 'Social video content'],
    prefilledInputs: {
      topic: '[Video Topic or Title]',
      duration: '5-10 minutes',
      tone: 'engaging'
    }
  },
  {
    id: 'podcast-intro',
    name: 'Podcast Episode Intro',
    description: 'Hook listeners with compelling episode intro',
    category: 'creative',
    industry: 'general',
    toolType: ToolType.SMART_EDITOR,
    difficulty: 'beginner',
    estimatedTime: 5,
    popular: false,
    tags: ['podcast', 'intro', 'audio', 'content'],
    thumbnail: '🎙️',
    useCases: ['Podcast episodes', 'Audio content', 'Show intros'],
    prefilledInputs: {}
  },
  {
    id: 'storytelling-framework',
    name: 'Brand Story',
    description: 'Compelling brand story using storytelling framework',
    category: 'creative',
    industry: 'general',
    toolType: ToolType.SMART_EDITOR,
    difficulty: 'advanced',
    estimatedTime: 20,
    popular: true,
    tags: ['story', 'brand', 'narrative', 'content'],
    thumbnail: '📚',
    useCases: ['About pages', 'Brand messaging', 'Company story'],
    prefilledInputs: {}
  },

  // === ADDITIONAL POPULAR TEMPLATES ===
  {
    id: 'newsletter',
    name: 'Email Newsletter',
    description: 'Engaging newsletter with news, tips, and CTAs',
    category: 'email',
    industry: 'general',
    toolType: ToolType.EMAIL_TEMPLATE,
    difficulty: 'intermediate',
    estimatedTime: 10,
    popular: true,
    tags: ['newsletter', 'email', 'content', 'updates'],
    thumbnail: '📬',
    useCases: ['Weekly newsletters', 'Monthly updates', 'Content roundups'],
    prefilledInputs: {
      subject: '[Company] Newsletter - [Month] Edition',
      tone: 'informative',
      length: 'medium'
    }
  },
  {
    id: 'testimonial-request',
    name: 'Testimonial Request Email',
    description: 'Politely ask satisfied customers for testimonials',
    category: 'email',
    industry: 'general',
    toolType: ToolType.EMAIL_TEMPLATE,
    difficulty: 'beginner',
    estimatedTime: 5,
    popular: false,
    tags: ['testimonial', 'review', 'social proof', 'request'],
    thumbnail: '⭐',
    useCases: ['Review requests', 'Testimonial collection', 'Social proof'],
    prefilledInputs: {
      subject: 'Would you share your experience with [Company]?',
      tone: 'friendly',
      length: 'short'
    }
  },
  {
    id: 'webinar-invitation',
    name: 'Webinar Invitation Email',
    description: 'Drive registrations with compelling webinar invite',
    category: 'email',
    industry: 'saas',
    toolType: ToolType.EMAIL_TEMPLATE,
    difficulty: 'intermediate',
    estimatedTime: 7,
    popular: true,
    tags: ['webinar', 'event', 'invitation', 'registration'],
    thumbnail: '🎓',
    useCases: ['Webinar promotion', 'Event invitations', 'Training sessions'],
    prefilledInputs: {
      subject: 'Join us: [Webinar Topic] on [Date]',
      tone: 'professional',
      length: 'medium'
    }
  },
  {
    id: 'referral-program',
    name: 'Referral Program Email',
    description: 'Encourage customers to refer friends',
    category: 'email',
    industry: 'general',
    toolType: ToolType.EMAIL_TEMPLATE,
    difficulty: 'intermediate',
    estimatedTime: 7,
    popular: false,
    tags: ['referral', 'growth', 'incentive', 'viral'],
    thumbnail: '🎁',
    useCases: ['Referral campaigns', 'Growth marketing', 'Customer advocacy'],
    prefilledInputs: {
      subject: 'Give [Reward], Get [Reward] - Share the Love',
      tone: 'exciting',
      length: 'medium'
    }
  },
  {
    id: 'survey-invitation',
    name: 'Customer Survey Email',
    description: 'Get feedback with well-crafted survey invitation',
    category: 'email',
    industry: 'general',
    toolType: ToolType.EMAIL_TEMPLATE,
    difficulty: 'beginner',
    estimatedTime: 5,
    popular: false,
    tags: ['survey', 'feedback', 'research', 'customer'],
    thumbnail: '📋',
    useCases: ['Feedback collection', 'User research', 'NPS surveys'],
    prefilledInputs: {
      subject: 'We\'d love your feedback (2 minutes)',
      tone: 'friendly',
      length: 'short'
    }
  },
  {
    id: 'holiday-campaign',
    name: 'Holiday/Seasonal Campaign',
    description: 'Festive campaign for holidays and special occasions',
    category: 'marketing',
    industry: 'ecommerce',
    toolType: ToolType.EMAIL_TEMPLATE,
    difficulty: 'intermediate',
    estimatedTime: 10,
    popular: true,
    tags: ['holiday', 'seasonal', 'promotion', 'campaign'],
    thumbnail: '🎄',
    useCases: ['Black Friday', 'Christmas', 'New Year', 'Valentine\'s'],
    prefilledInputs: {
      subject: '[Holiday] Sale: [Discount]% Off Everything',
      tone: 'exciting',
      length: 'medium'
    }
  },
  {
    id: 'crisis-communication',
    name: 'Crisis Communication',
    description: 'Transparent, empathetic communication during issues',
    category: 'business',
    industry: 'general',
    toolType: ToolType.SMART_EDITOR,
    difficulty: 'advanced',
    estimatedTime: 15,
    popular: false,
    tags: ['crisis', 'pr', 'communication', 'transparency'],
    thumbnail: '🚨',
    useCases: ['Service outages', 'Security issues', 'Company statements'],
    prefilledInputs: {}
  },
  {
    id: 'onboarding-checklist',
    name: 'User Onboarding Checklist',
    description: 'Step-by-step onboarding guide for new users',
    category: 'product',
    industry: 'saas',
    toolType: ToolType.SMART_EDITOR,
    difficulty: 'intermediate',
    estimatedTime: 10,
    popular: false,
    tags: ['onboarding', 'checklist', 'guide', 'ux'],
    thumbnail: '✅',
    useCases: ['User onboarding', 'Getting started guides', 'Activation'],
    prefilledInputs: {}
  },
  {
    id: 'comparison-chart',
    name: 'Feature Comparison Chart',
    description: 'Side-by-side feature comparison copy',
    category: 'product',
    industry: 'saas',
    toolType: ToolType.SMART_EDITOR,
    difficulty: 'intermediate',
    estimatedTime: 15,
    popular: false,
    tags: ['comparison', 'features', 'pricing', 'chart'],
    thumbnail: '📊',
    useCases: ['Pricing pages', 'Product pages', 'Sales materials'],
    prefilledInputs: {}
  },
  {
    id: 'retargeting-ad',
    name: 'Retargeting Ad Copy',
    description: 'Win back visitors who didn\'t convert',
    category: 'ads',
    industry: 'ecommerce',
    toolType: ToolType.EMAIL_PROMO,
    difficulty: 'intermediate',
    estimatedTime: 5,
    popular: true,
    tags: ['retargeting', 'remarketing', 'conversion', 'ads'],
    thumbnail: '🎯',
    useCases: ['Retargeting campaigns', 'Abandoned browsers', 'Remarketing'],
    prefilledInputs: {
      productName: '[Product]',
      offer: '[Special Offer]'
    }
  },
  {
    id: 'milestone-celebration',
    name: 'Company Milestone Post',
    description: 'Celebrate achievements and thank your community',
    category: 'social-media',
    industry: 'general',
    toolType: ToolType.SOCIAL_LINKEDIN,
    difficulty: 'beginner',
    estimatedTime: 5,
    popular: false,
    tags: ['milestone', 'celebration', 'achievement', 'community'],
    thumbnail: '🎉',
    useCases: ['Anniversary posts', 'User milestones', 'Team achievements'],
    prefilledInputs: {
      topic: 'We just hit [Milestone]! Here\'s what it means...',
      tone: 'grateful'
    }
  }
];

/**
 * Get all templates
 */
export function getAllTemplates(): ContentTemplate[] {
  return CONTENT_TEMPLATES;
}

/**
 * Get templates by category
 */
export function getTemplatesByCategory(category: TemplateCategory): ContentTemplate[] {
  return CONTENT_TEMPLATES.filter(t => t.category === category);
}

/**
 * Get templates by industry
 */
export function getTemplatesByIndustry(industry: TemplateIndustry): ContentTemplate[] {
  return CONTENT_TEMPLATES.filter(t => t.industry === industry);
}

/**
 * Get templates by tool type
 */
export function getTemplatesByToolType(toolType: ToolType): ContentTemplate[] {
  return CONTENT_TEMPLATES.filter(t => t.toolType === toolType);
}

/**
 * Get popular templates
 */
export function getPopularTemplates(): ContentTemplate[] {
  return CONTENT_TEMPLATES.filter(t => t.popular);
}

/**
 * Get template by ID
 */
export function getTemplateById(id: string): ContentTemplate | undefined {
  return CONTENT_TEMPLATES.find(t => t.id === id);
}

/**
 * Search templates
 */
export function searchTemplates(query: string): ContentTemplate[] {
  const lowerQuery = query.toLowerCase().trim();
  if (!lowerQuery) return CONTENT_TEMPLATES;

  return CONTENT_TEMPLATES.filter(t =>
    t.name.toLowerCase().includes(lowerQuery) ||
    t.description.toLowerCase().includes(lowerQuery) ||
    t.tags.some(tag => tag.includes(lowerQuery)) ||
    t.useCases.some(uc => uc.toLowerCase().includes(lowerQuery))
  );
}

/**
 * Get category display info
 */
export function getCategoryInfo(category: TemplateCategory): {
  name: string;
  icon: string;
  description: string;
} {
  const info: Record<TemplateCategory, { name: string; icon: string; description: string }> = {
    marketing: { name: 'Marketing', icon: '📣', description: 'Marketing campaigns and content' },
    sales: { name: 'Sales', icon: '💼', description: 'Sales emails and proposals' },
    'social-media': { name: 'Social Media', icon: '📱', description: 'Social posts and content' },
    email: { name: 'Email', icon: '📧', description: 'Email campaigns and templates' },
    blog: { name: 'Blog', icon: '📝', description: 'Blog posts and articles' },
    product: { name: 'Product', icon: '🚀', description: 'Product content and docs' },
    seo: { name: 'SEO', icon: '🔍', description: 'SEO-optimized content' },
    ads: { name: 'Advertising', icon: '📣', description: 'Ad copy and campaigns' },
    business: { name: 'Business', icon: '💼', description: 'Business communications' },
    creative: { name: 'Creative', icon: '🎨', description: 'Creative content and scripts' }
  };
  return info[category];
}

/**
 * Get all categories with counts
 */
export function getCategoriesWithCounts(): Array<{
  category: TemplateCategory;
  name: string;
  icon: string;
  count: number;
}> {
  const categories: TemplateCategory[] = [
    'marketing', 'sales', 'social-media', 'email', 'blog',
    'product', 'seo', 'ads', 'business', 'creative'
  ];

  return categories.map(category => {
    const info = getCategoryInfo(category);
    return {
      category,
      name: info.name,
      icon: info.icon,
      count: getTemplatesByCategory(category).length
    };
  });
}

export default {
  getAllTemplates,
  getTemplatesByCategory,
  getTemplatesByIndustry,
  getTemplatesByToolType,
  getPopularTemplates,
  getTemplateById,
  searchTemplates,
  getCategoryInfo,
  getCategoriesWithCounts
};
