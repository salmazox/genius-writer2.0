/**
 * Help Context
 *
 * Manages contextual help state and provides help content throughout the app
 */

import React, { createContext, useContext, useState, useCallback } from 'react';

export interface HelpArticle {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  videoUrl?: string;
}

interface HelpContextType {
  isHelpOpen: boolean;
  currentArticle: HelpArticle | null;
  searchQuery: string;
  openHelp: (articleId?: string) => void;
  closeHelp: () => void;
  setSearchQuery: (query: string) => void;
  getArticle: (id: string) => HelpArticle | undefined;
  searchArticles: (query: string) => HelpArticle[];
}

const HelpContext = createContext<HelpContextType | undefined>(undefined);

/**
 * Help Articles Database
 */
const HELP_ARTICLES: HelpArticle[] = [
  {
    id: 'getting-started',
    title: 'Getting Started with Genius Writer',
    content: `Welcome to Genius Writer! Here's how to get started:

1. **Choose a Tool**: Browse our library of AI-powered tools for different writing tasks
2. **Fill in Details**: Provide the information needed for your content
3. **Generate with AI**: Let our AI create professional content for you
4. **Edit & Export**: Customize the result and export in your preferred format

**Tips:**
- Start with the CV Builder or Blog Writer for the best experience
- The more details you provide, the better the AI-generated content
- Use the Smart Editor for quick edits and improvements`,
    category: 'Getting Started',
    tags: ['basics', 'tutorial', 'onboarding']
  },
  {
    id: 'cv-builder-guide',
    title: 'How to Create a Professional CV',
    content: `Create a standout CV in minutes:

**Step 1: Personal Information**
Enter your name, contact details, and professional title

**Step 2: Work Experience**
- Use the CAR method: Context + Action + Result
- Start with powerful action verbs
- Quantify your achievements with numbers and percentages

**Step 3: Skills & Education**
List your relevant skills and educational background

**Step 4: Generate**
Click "Generate with AI" to transform your information into professional content

**Pro Tips:**
- Be specific with your achievements
- Use industry keywords for ATS optimization
- Choose a template that matches your industry`,
    category: 'Tools',
    tags: ['cv', 'resume', 'career'],
    videoUrl: 'https://example.com/cv-tutorial'
  },
  {
    id: 'blog-writing-guide',
    title: 'Writing Engaging Blog Posts',
    content: `Create compelling blog content:

**Choose Your Topic**
Select a specific, focused topic your audience cares about

**Set the Tone**
- Professional: For business and technical content
- Casual: For lifestyle and entertainment
- Friendly: For community and social content

**Optimize for SEO**
- Include target keywords
- Write compelling meta descriptions
- Use headers (H2, H3) to structure content

**Edit & Enhance**
Use the Smart Editor to refine your content with:
- Grammar and style suggestions
- Readability improvements
- Tone adjustments`,
    category: 'Tools',
    tags: ['blog', 'content', 'seo', 'writing']
  },
  {
    id: 'subscription-plans',
    title: 'Understanding Subscription Plans',
    content: `Choose the right plan for your needs:

**Free Plan**
- 10 AI generations per month
- 5 documents per month
- Basic templates
- PDF export only

**Starter Plan (€9.99/month)**
- 100 AI generations per month
- 50 documents per month
- All templates
- Multiple export formats
- Email support

**Professional Plan (€24.99/month)**
- 500 AI generations per month
- 200 documents per month
- All premium templates
- Team collaboration (5 members)
- Priority support
- Advanced analytics

**Enterprise Plan (€89.99/month)**
- Unlimited AI generations
- Unlimited documents
- Custom integrations
- Dedicated account manager
- API access

**Billing:**
- Pay monthly or yearly (save up to 17%)
- Cancel anytime
- Prices in EUR (USD available)`,
    category: 'Billing',
    tags: ['pricing', 'subscription', 'plans', 'upgrade']
  },
  {
    id: 'keyboard-shortcuts',
    title: 'Keyboard Shortcuts',
    content: `Work faster with keyboard shortcuts:

**Global Shortcuts**
- \`Ctrl + K\` or \`Cmd + K\`: Open command palette
- \`Ctrl + /\`: View all shortcuts
- \`Ctrl + S\`: Save current document

**Editor Shortcuts**
- \`Ctrl + B\`: Bold text
- \`Ctrl + I\`: Italic text
- \`Ctrl + U\`: Underline text
- \`Ctrl + Z\`: Undo
- \`Ctrl + Y\`: Redo

**Navigation**
- \`Ctrl + H\`: Go to home/dashboard
- \`Ctrl + D\`: Go to documents
- \`Escape\`: Close modals and menus`,
    category: 'Tips & Tricks',
    tags: ['shortcuts', 'keyboard', 'productivity']
  },
  {
    id: 'export-formats',
    title: 'Exporting Your Documents',
    content: `Export your content in multiple formats:

**Available Formats (by plan)**

**Free Plan:**
- PDF: Professional PDF export

**Starter & Above:**
- PDF: Professional PDF export
- DOCX: Microsoft Word format
- HTML: Web-ready HTML

**Professional & Enterprise:**
- PDF, DOCX, HTML
- Markdown: Plain text with formatting
- TXT: Plain text
- JSON: Structured data export

**Export Tips:**
- PDFs maintain formatting perfectly
- DOCX for further editing in Word
- HTML for web publishing
- Markdown for technical documentation`,
    category: 'Features',
    tags: ['export', 'pdf', 'docx', 'formats']
  },
  {
    id: 'collaboration',
    title: 'Team Collaboration',
    content: `Work together on documents:

**Available on Professional & Enterprise plans**

**Invite Team Members**
1. Go to User Dashboard → Settings
2. Click "Invite Team Member"
3. Enter their email address
4. Set their role (Editor or Viewer)

**Share Documents**
- Click the share icon on any document
- Choose permissions (view, edit, comment)
- Generate shareable link
- Track who has access

**Real-time Collaboration**
- See who's viewing/editing
- Live cursor tracking
- Comment and suggest edits
- Version history

**Roles:**
- Owner: Full control
- Editor: Edit and share
- Viewer: View only`,
    category: 'Features',
    tags: ['collaboration', 'team', 'sharing', 'professional']
  },
  {
    id: 'ai-quality-tips',
    title: 'Getting the Best AI Results',
    content: `Maximize AI output quality:

**Be Specific**
Instead of: "Write about marketing"
Try: "Write a blog post about email marketing best practices for small businesses"

**Provide Context**
Include:
- Target audience
- Desired tone
- Key points to cover
- Word count or length

**Use Examples**
Show the AI what style you want:
- Include sample headlines
- Reference similar content
- Describe your brand voice

**Iterate**
- Generate multiple versions
- Refine your prompts
- Combine the best parts
- Use Smart Editor to polish

**Common Issues:**
- Generic content → Add more specific details
- Wrong tone → Specify tone explicitly
- Too short → Request longer content
- Off-topic → Clarify your requirements`,
    category: 'Tips & Tricks',
    tags: ['ai', 'quality', 'prompts', 'tips']
  }
];

interface HelpProviderProps {
  children: React.ReactNode;
}

export const HelpProvider: React.FC<HelpProviderProps> = ({ children }) => {
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [currentArticle, setCurrentArticle] = useState<HelpArticle | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const openHelp = useCallback((articleId?: string) => {
    if (articleId) {
      const article = HELP_ARTICLES.find(a => a.id === articleId);
      setCurrentArticle(article || null);
    }
    setIsHelpOpen(true);
  }, []);

  const closeHelp = useCallback(() => {
    setIsHelpOpen(false);
    // Don't clear current article immediately to allow smooth transition
    setTimeout(() => setCurrentArticle(null), 300);
  }, []);

  const getArticle = useCallback((id: string): HelpArticle | undefined => {
    return HELP_ARTICLES.find(a => a.id === id);
  }, []);

  const searchArticles = useCallback((query: string): HelpArticle[] => {
    if (!query.trim()) return HELP_ARTICLES;

    const lowerQuery = query.toLowerCase();
    return HELP_ARTICLES.filter(article =>
      article.title.toLowerCase().includes(lowerQuery) ||
      article.content.toLowerCase().includes(lowerQuery) ||
      article.tags.some(tag => tag.toLowerCase().includes(lowerQuery)) ||
      article.category.toLowerCase().includes(lowerQuery)
    );
  }, []);

  const value: HelpContextType = {
    isHelpOpen,
    currentArticle,
    searchQuery,
    openHelp,
    closeHelp,
    setSearchQuery,
    getArticle,
    searchArticles
  };

  return <HelpContext.Provider value={value}>{children}</HelpContext.Provider>;
};

/**
 * Hook to use help context
 */
export const useHelp = (): HelpContextType => {
  const context = useContext(HelpContext);
  if (!context) {
    throw new Error('useHelp must be used within HelpProvider');
  }
  return context;
};
