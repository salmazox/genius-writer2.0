
export enum ToolType {
  TRANSLATE = 'TRANSLATE',
  CV_BUILDER = 'CV_BUILDER',
  SMART_EDITOR = 'SMART_EDITOR', // New Word-like Editor
  SOCIAL_TWITTER = 'SOCIAL_TWITTER',
  SOCIAL_LINKEDIN = 'SOCIAL_LINKEDIN',
  BLOG_INTRO = 'BLOG_INTRO',
  BLOG_FULL = 'BLOG_FULL',
  EMAIL_NEWSLETTER = 'EMAIL_NEWSLETTER',
  EMAIL_PROMO = 'EMAIL_PROMO',
  PRODUCT_DESC = 'PRODUCT_DESC',
  DATA_ANALYSIS = 'DATA_ANALYSIS',
  IMAGE_GEN = 'IMAGE_GEN',
  // New Tools
  SEO_KEYWORDS = 'SEO_KEYWORDS',
  SEO_META_TAGS = 'SEO_META_TAGS',
  HR_JOB_DESC = 'HR_JOB_DESC',
  HR_INTERVIEW_PREP = 'HR_INTERVIEW_PREP',
  LIVE_INTERVIEW = 'LIVE_INTERVIEW', // New Live API Tool
  STARTUP_VALIDATOR = 'STARTUP_VALIDATOR',
  TEXT_POLISHER = 'TEXT_POLISHER',
  SUMMARIZER = 'SUMMARIZER',
  // German Market Specials
  INVOICE_GEN = 'INVOICE_GEN',
  CONTRACT_GEN = 'CONTRACT_GEN',
  EMAIL_TEMPLATE = 'EMAIL_TEMPLATE',
}

export interface LinkedAccounts {
  twitter: boolean;
  linkedin: boolean;
  instagram?: boolean;
}

export interface User {
  name: string;
  email: string;
  plan: 'free' | 'pro' | 'agency' | 'enterprise';
  avatar?: string;
  bio?: string;
  linkedAccounts: LinkedAccounts;
  favorites: ToolType[]; // New: Tool Favorites
}

export interface Invoice {
  id: string;
  date: string;
  amount: number;
  status: 'Paid' | 'Pending' | 'Failed';
  items: string;
}

export interface BrandVoice {
  id: string;
  name: string;
  description: string; // e.g., "Professional, Concise, and Authoritative"
}

export interface ToolConfig {
  id: ToolType;
  name: string;
  category: string;
  description: string;
  icon: string;
  model: string;
  inputs: ToolInput[];
}

export interface ToolInput {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'select';
  options?: string[]; // For select type
  placeholder?: string;
  section?: string; // New: For grouping inputs visually
}

export interface DocumentVersion {
  id: string;
  timestamp: number;
  content: string;
  changeDescription: string;
  author?: string;
  type?: 'text' | 'image' | 'cv_json'; // Added cv_json type
}

export interface Folder {
  id: string;
  name: string;
  createdAt: number;
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  timestamp: number;
  selectedText?: string; // Context/Quote
  resolved?: boolean;
}

export interface ShareSettings {
  isPublic: boolean;
  publicPermission: 'view' | 'comment' | 'edit';
  invitedUsers: { email: string; permission: 'view' | 'comment' | 'edit' }[];
}

export interface SavedDocument {
  id: string;
  title: string;
  content: string;
  templateId: ToolType;
  lastModified: number;
  versions: DocumentVersion[];
  folderId?: string; // New: Organization
  tags?: string[]; // New: Filtering
  deletedAt?: number; // New: Soft Delete
  comments?: Comment[]; // New: Collaboration
  shareSettings?: ShareSettings; // New: Sharing
}

export interface Collaborator {
  id: string;
  name: string;
  color: string;
  isActive: boolean;
  cursorPosition?: { x: number; y: number };
}

// --- CV Builder Specific Types ---

export interface CVTheme {
  name: string;
  primary: string; // The main accent color (Headers, icons)
  secondary: string; // A lighter version for backgrounds/sidebars
  text: string; // Main text color
}

export interface CVExperience {
  id: string;
  title: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
}

export interface CVEducation {
  id: string;
  degree: string;
  school: string;
  location: string;
  year: string;
}

export interface CVCertificate {
  id: string;
  name: string;
  issuer: string;
  date: string;
  url: string;
  description: string;
}

export interface CVLanguage {
  id: string;
  language: string;
  proficiency: string;
}

export interface CVPersonal {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  website: string;
  linkedin: string;
  jobTitle: string;
  summary: string;
  photoBase64: string;
  photoShape: 'circle' | 'square' | 'rounded';
  photoFilter: 'none' | 'grayscale';
}

export interface CVData {
  template: 'modern' | 'classic' | 'minimal';
  theme: CVTheme;
  personal: CVPersonal;
  experience: CVExperience[];
  education: CVEducation[];
  skills: string[];
  certifications: CVCertificate[];
  languages: CVLanguage[];
}

export interface ATSAnalysis {
  score: number;
  missingKeywords: string[];
  suggestions: string[];
  summary: string;
  improvedSummary?: string;
}
