
import React from 'react';
import { 
  FileText, Globe, Image as ImageIcon, Twitter, Linkedin, Mail, PenTool, 
  Search, Tag, Briefcase, HelpCircle, Lightbulb, ShoppingBag, BarChart2,
  Wand2, Minimize2, Edit, FileEdit
} from 'lucide-react';
import { ToolConfig, ToolType } from '../types';

export const IconMap: Record<string, React.ElementType> = {
  'globe': Globe, 
  'file-text': FileText, 
  'mail': Mail, 
  'pen-tool': PenTool,
  'bar-chart-2': BarChart2, 
  'twitter': Twitter, 
  'linkedin': Linkedin,
  'shopping-bag': ShoppingBag, 
  'image': ImageIcon, 
  'search': Search,
  'tag': Tag, 
  'briefcase': Briefcase, 
  'lightbulb': Lightbulb, 
  'help-circle': HelpCircle,
  'wand-2': Wand2,
  'minimize-2': Minimize2,
  'file-edit': FileEdit,
};

export const getTools = (t: (key: string) => string): ToolConfig[] => [
    { 
      id: ToolType.SMART_EDITOR, 
      name: 'Smart Document Editor', 
      category: t('dashboard.categories.Business'), 
      description: 'A full-featured document editor with a real-time AI companion.', 
      icon: 'file-edit', 
      model: 'gemini-3-pro-preview', 
      inputs: [] // Handled by custom UI
    },
    { 
      id: ToolType.CV_BUILDER, 
      name: 'CV / Resume Builder', 
      category: t('dashboard.categories.Business'), 
      description: t('features.cvDesc'), 
      icon: 'file-text', 
      model: 'gemini-3-pro-preview', 
      inputs: [] 
    },
    { 
      id: ToolType.TRANSLATE, 
      name: t('features.translate'), 
      category: t('dashboard.categories.Utility'), 
      description: t('features.translateDesc'), 
      icon: 'globe', 
      model: 'gemini-2.5-flash', 
      inputs: [] 
    },
    { 
      id: ToolType.TEXT_POLISHER, 
      name: t('features.polisher'), 
      category: t('dashboard.categories.Utility'), 
      description: t('features.polisherDesc'), 
      icon: 'wand-2', 
      model: 'gemini-2.5-flash', 
      inputs: [
        { name: 'textToPolish', label: t('dashboard.inputs.textToPolish'), type: 'textarea', placeholder: 'Paste your draft here...' },
        { name: 'polishGoal', label: t('dashboard.inputs.polishGoal'), type: 'select', options: ['Professional & Formal', 'Friendly & Casual', 'Concise & Direct', 'Persuasive', 'Grammar Fix Only'] }
      ] 
    },
    { 
      id: ToolType.SUMMARIZER, 
      name: t('features.summarizer'), 
      category: t('dashboard.categories.Utility'), 
      description: t('features.summarizerDesc'), 
      icon: 'minimize-2', 
      model: 'gemini-2.5-flash', 
      inputs: [
        { name: 'textToSummarize', label: t('dashboard.inputs.textToSummarize'), type: 'textarea', placeholder: 'Paste long text here...' },
        { name: 'summaryFormat', label: t('dashboard.inputs.summaryFormat'), type: 'select', options: ['Bullet Points', 'Executive Summary (Paragraph)', 'ELI5 (Simple)', 'Action Items'] }
      ] 
    },
    { 
      id: ToolType.IMAGE_GEN, 
      name: 'AI Image Generator', 
      category: t('dashboard.categories.Social'), 
      description: 'Generate unique images for your posts.', 
      icon: 'image', 
      model: 'gemini-2.5-flash-image', 
      inputs: [
        { name: 'prompt', label: 'Image Description', type: 'textarea', placeholder: 'A futuristic city...' }, 
        { name: 'aspectRatio', label: 'Aspect Ratio', type: 'select', options: ['1:1', '16:9', '9:16', '4:3', '3:4'] }
      ] 
    },
    { 
      id: ToolType.SOCIAL_TWITTER, 
      name: 'Twitter/X Post', 
      category: t('dashboard.categories.Social'), 
      description: t('features.socialDesc'), 
      icon: 'twitter', 
      model: 'gemini-2.5-flash', 
      inputs: [
        { name: 'topic', label: t('dashboard.inputs.topic'), type: 'text', placeholder: 'e.g., AI trends' }, 
        { name: 'tone', label: t('dashboard.inputs.tone'), type: 'select', options: ['Witty', 'Professional', 'Controversial', 'Helpful'] }
      ] 
    },
    { 
      id: ToolType.SOCIAL_LINKEDIN, 
      name: 'LinkedIn Post', 
      category: t('dashboard.categories.Social'), 
      description: 'Professional posts to grow your network.', 
      icon: 'linkedin', 
      model: 'gemini-3-pro-preview', 
      inputs: [
        { name: 'topic', label: t('dashboard.inputs.topic'), type: 'text' }, 
        { name: 'audience', label: t('dashboard.inputs.audience'), type: 'text' },
        { name: 'tone', label: t('dashboard.inputs.tone'), type: 'select', options: ['Thought Leadership', 'Storytelling', 'Professional'] }
      ] 
    },
    { 
      id: ToolType.EMAIL_NEWSLETTER, 
      name: 'Newsletter', 
      category: t('dashboard.categories.Email'), 
      description: t('features.emailDesc'), 
      icon: 'mail', 
      model: 'gemini-2.5-flash', 
      inputs: [
        { name: 'topic', label: t('dashboard.inputs.topic'), type: 'text' }, 
        { name: 'highlights', label: t('dashboard.inputs.highlights'), type: 'textarea' },
        { name: 'cta', label: t('dashboard.inputs.cta'), type: 'text' }
      ] 
    },
    {
      id: ToolType.EMAIL_PROMO,
      name: 'Promotional Email',
      category: t('dashboard.categories.Email'),
      description: 'High-converting sales emails.',
      icon: 'mail',
      model: 'gemini-2.5-flash',
      inputs: [
        { name: 'product', label: t('dashboard.inputs.product'), type: 'text' },
        { name: 'offer', label: t('dashboard.inputs.offer'), type: 'text' },
        { name: 'urgency', label: t('dashboard.inputs.urgency'), type: 'select', options: ['High', 'Medium', 'Low'] }
      ]
    },
    { 
      id: ToolType.BLOG_INTRO,
      name: 'Blog Intro',
      category: t('dashboard.categories.Blog'),
      description: 'Catchy introductions to hook readers.',
      icon: 'pen-tool',
      model: 'gemini-2.5-flash',
      inputs: [
        { name: 'topic', label: t('dashboard.inputs.topic'), type: 'text' },
        { name: 'tone', label: t('dashboard.inputs.tone'), type: 'select', options: ['Conversational', 'Formal', 'Excited'] },
        { name: 'hookType', label: t('dashboard.inputs.hookType'), type: 'select', options: ['Question', 'Statistic', 'Story', 'Controversial Statement'] }
      ]
    },
    { 
      id: ToolType.BLOG_FULL, 
      name: 'Full Blog Post', 
      category: t('dashboard.categories.Blog'), 
      description: t('features.blogDesc'), 
      icon: 'file-text', 
      model: 'gemini-3-pro-preview', 
      inputs: [
        { name: 'topic', label: t('dashboard.inputs.topic'), type: 'text' }, 
        { name: 'audience', label: t('dashboard.inputs.audience'), type: 'text' },
        { name: 'tone', label: t('dashboard.inputs.tone'), type: 'select', options: ['Informative', 'Opinionated'] },
        { name: 'length', label: t('dashboard.inputs.length'), type: 'select', options: ['Short (500)', 'Medium (1000)', 'Long (2000)'] }
      ] 
    },
    { 
      id: ToolType.SEO_KEYWORDS, 
      name: 'Keyword Researcher', 
      category: t('dashboard.categories.SEO'), 
      description: 'Generate high-volume keywords.', 
      icon: 'search', 
      model: 'gemini-2.5-flash', 
      inputs: [
        { name: 'topic', label: t('dashboard.inputs.topic'), type: 'text' },
        { name: 'region', label: t('dashboard.inputs.region'), type: 'text' }
      ] 
    },
    {
      id: ToolType.SEO_META_TAGS,
      name: 'Meta Tag Generator',
      category: t('dashboard.categories.SEO'),
      description: 'Optimized Title Tags and Meta Descriptions.',
      icon: 'tag',
      model: 'gemini-2.5-flash',
      inputs: [
        { name: 'topic', label: t('dashboard.inputs.topic'), type: 'text' },
        { name: 'keyword', label: t('dashboard.inputs.keyword'), type: 'text' },
        { name: 'tone', label: t('dashboard.inputs.tone'), type: 'select', options: ['Clickbait', 'Professional', 'Descriptive'] }
      ]
    },
    { 
      id: ToolType.HR_JOB_DESC, 
      name: 'Job Description', 
      category: t('dashboard.categories.HR'), 
      description: 'Professional, inclusive job postings.', 
      icon: 'briefcase', 
      model: 'gemini-2.5-flash', 
      inputs: [
        { name: 'role', label: t('dashboard.inputs.role'), type: 'text' }, 
        { name: 'company', label: t('dashboard.inputs.company'), type: 'text' },
        { name: 'responsibilities', label: t('dashboard.inputs.responsibilities'), type: 'textarea' },
        { name: 'requirements', label: t('dashboard.inputs.requirements'), type: 'textarea' },
        { name: 'tone', label: t('dashboard.inputs.tone'), type: 'select', options: ['Formal', 'Exciting/Startup', 'Casual'] }
      ] 
    },
    {
      id: ToolType.HR_INTERVIEW_PREP,
      name: 'Interview Prep',
      category: t('dashboard.categories.HR'),
      description: 'Generate interview questions and answer tips.',
      icon: 'help-circle',
      model: 'gemini-3-pro-preview',
      inputs: [
        { name: 'role', label: t('dashboard.inputs.role'), type: 'text' },
        { name: 'industry', label: t('dashboard.inputs.industry'), type: 'text' }
      ]
    },
    {
      id: ToolType.STARTUP_VALIDATOR,
      name: 'Startup Idea Validator',
      category: t('dashboard.categories.Strategy'),
      description: 'SWOT analysis and feedback.',
      icon: 'lightbulb',
      model: 'gemini-3-pro-preview',
      inputs: [
        { name: 'idea', label: t('dashboard.inputs.idea'), type: 'textarea' },
        { name: 'market', label: t('dashboard.inputs.market'), type: 'text' }
      ]
    },
    { 
      id: ToolType.PRODUCT_DESC, 
      name: t('dashboard.inputs.productName'), 
      category: t('dashboard.categories.Business'), 
      description: 'Sell more with compelling copy.', 
      icon: 'shopping-bag', 
      model: 'gemini-2.5-flash', 
      inputs: [
        { name: 'productName', label: t('dashboard.inputs.productName'), type: 'text' }, 
        { name: 'features', label: t('dashboard.inputs.features'), type: 'textarea' }, 
        { name: 'audience', label: t('dashboard.inputs.audience'), type: 'text' }
      ] 
    },
    { 
      id: ToolType.DATA_ANALYSIS, 
      name: t('features.data'), 
      category: t('dashboard.categories.Utility'), 
      description: t('features.dataDesc'), 
      icon: 'bar-chart-2', 
      model: 'gemini-3-pro-preview', 
      inputs: [
        { name: 'data', label: t('dashboard.inputs.data'), type: 'textarea' }, 
        { name: 'goal', label: t('dashboard.inputs.goal'), type: 'text' }
      ] 
    }
  ];
