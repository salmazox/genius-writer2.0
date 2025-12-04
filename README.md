<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />

# Genius Writer 2.0

**AI-Powered Writing Assistant & Content Creation Suite**

[![CI](https://github.com/salmazox/genius-writer2.0/actions/workflows/ci.yml/badge.svg)](https://github.com/salmazox/genius-writer2.0/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.2-blue)](https://reactjs.org/)

[Features](#features) • [Quick Start](#quick-start) • [Development](#development) • [Deployment](#deployment) • [Documentation](#documentation)

</div>

---

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Development](#development)
- [Testing](#testing)
- [Deployment](#deployment)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [Security](#security)
- [License](#license)

---

## ✨ Features

### Core Features
- 🤖 **Smart Document Editor** - AI-powered word processor with real-time suggestions
- 📝 **CV/Resume Builder** - ATS-optimized resume creation with 5 professional templates
- 🌍 **Multi-Language Translator** - Document translation supporting 100+ languages
- 🎤 **Live Interview Coach** - Real-time AI voice interview practice
- 🎨 **Brand Voice Manager** - Maintain consistent brand voice across content

### Content Generation Tools (25+)
- Social Media (Twitter, LinkedIn, Instagram)
- Blog Writing (posts, introductions, outlines)
- Email Marketing (newsletters, promotions, templates)
- SEO Tools (keywords, meta tags, optimization)
- HR Tools (job descriptions, interview questions)
- Business Documents (invoices, contracts, product descriptions)
- Data Analysis & Visualization
- Image Generation
- Text Enhancement (grammar, style, summarization)

### Advanced Features
- ✅ Real-time collaboration with comments
- 📊 ATS scoring and optimization for resumes
- 🔍 Plagiarism detection and fact-checking
- 📁 Document organization with folders and tags
- 🌙 Dark mode support
- 🌐 Multi-language UI (English, German, French, Spanish)
- 📱 Progressive Web App (PWA) support
- 🔒 XSS protection with DOMPurify
- 🎯 GDPR compliance

---

## 🛠 Tech Stack

### Frontend
- **Framework:** React 19.2 with TypeScript 5.8
- **Build Tool:** Vite 7.2
- **Styling:** Tailwind CSS 3.3
- **Routing:** React Router 7.9
- **Icons:** Lucide React
- **AI Integration:** Google Gemini API

### Backend (To Be Implemented)
- **Runtime:** Node.js + Express 4.18
- **Database:** PostgreSQL 15 + Prisma ORM
- **Authentication:** JWT + bcrypt
- **Payments:** Stripe 14.4

### DevOps & Tools
- **Testing:** Vitest + React Testing Library
- **Linting:** ESLint + Prettier
- **CI/CD:** GitHub Actions
- **Deployment:** Vercel (frontend), Docker Compose (full-stack)
- **Dependency Management:** Dependabot

---

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 20.x or higher ([Download](https://nodejs.org/))
- **npm** 10.x or higher (comes with Node.js)
- **Git** ([Download](https://git-scm.com/))
- **Google Gemini API Key** ([Get one here](https://aistudio.google.com/app/apikey))

Optional (for full-stack development):
- **Docker** and **Docker Compose** ([Download](https://www.docker.com/))
- **PostgreSQL** 15+ ([Download](https://www.postgresql.org/))

---

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/salmazox/genius-writer2.0.git
cd genius-writer2.0
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

```bash
# Copy the example environment file
cp .env.example .env.local

# Edit .env.local and add your API key
# API_KEY=your_gemini_api_key_here
```

Get your Gemini API key from: https://aistudio.google.com/app/apikey

### 4. Run the Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

---

## 💻 Development

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build locally |
| `npm test` | Run tests in watch mode |
| `npm run lint` | Check code for linting errors |
| `npm run lint:fix` | Fix linting errors automatically |
| `npm run format` | Format code with Prettier |
| `npm run format:check` | Check code formatting |
| `npm run type-check` | Run TypeScript type checking |

### Development Workflow

1. **Create a new branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Write code following the existing patterns
   - Add tests for new features
   - Update documentation as needed

3. **Run quality checks**
   ```bash
   npm run lint
   npm run type-check
   npm test
   ```

4. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: your feature description"
   ```

   Pre-commit hooks will automatically:
   - Lint and format your code
   - Run type checking
   - Validate commit message format

5. **Push and create a Pull Request**
   ```bash
   git push origin feature/your-feature-name
   ```

---

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests with UI
npm run test -- --ui

# Run tests with coverage
npm run test -- --coverage
```

### Test Structure

- **Unit Tests:** `src/**/*.test.ts(x)`
- **Integration Tests:** Testing services and contexts
- **Component Tests:** Testing React components with RTL

### Current Test Coverage

- `src/App.test.tsx` - Main app rendering
- `src/services/documentService.test.ts` - Document management
- `src/services/atsScoring.test.ts` - Resume ATS scoring (400+ lines)
- `src/utils/security.test.ts` - XSS protection and file validation
- `src/contexts/UserContext.test.tsx` - User state management
- `src/contexts/ToastContext.test.tsx` - Notification system

---

## 🚢 Deployment

### Deploy to Vercel (Frontend Only)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/salmazox/genius-writer2.0)

1. **Connect your repository to Vercel**
2. **Set environment variables:**
   - `API_KEY` - Your Gemini API key

3. **Deploy:**
   ```bash
   # Automatic deployment on push to main branch
   # Or manually trigger deployment
   vercel --prod
   ```

### Deploy with Docker Compose (Full Stack)

```bash
# Build and start all services
docker-compose up -d

# Services:
# - Frontend: http://localhost (port 80/443)
# - API: http://localhost/api
# - Database: PostgreSQL on port 5432
```

### Environment Configuration

See [.env.example](.env.example) for all required environment variables.

**⚠️ Security Warning:**
- The current implementation exposes the Gemini API key in the client bundle for demo purposes
- **For production:** Implement a backend proxy to handle all AI API calls
- Never commit `.env` or `.env.local` files

---

## 🔧 Environment Variables

Create a `.env.local` file in the root directory:

```env
# Required - Google Gemini API Key
API_KEY=your_gemini_api_key_here

# Optional - For backend (when implemented)
# DATABASE_URL=postgresql://user:password@localhost:5432/genius_writer
# JWT_SECRET=your_jwt_secret
# STRIPE_SECRET_KEY=sk_test_...
# STRIPE_WEBHOOK_SECRET=whsec_...
```

See [.env.example](.env.example) for complete documentation.

---

## 📁 Project Structure

```
genius-writer2.0/
├── .github/
│   ├── workflows/          # CI/CD pipelines
│   └── dependabot.yml      # Dependency updates
├── backend/
│   ├── prisma/            # Database schema (to be implemented)
│   ├── server.js          # Express API (placeholder)
│   └── package.json
├── public/
│   ├── data/              # Templates and presets
│   ├── manifest.json      # PWA manifest
│   └── sw.js             # Service worker
├── src/
│   ├── components/        # React components
│   │   ├── ui/           # Reusable UI components
│   │   ├── billing/      # Payment UI
│   │   ├── dashboard/    # Dashboard views
│   │   └── ...
│   ├── contexts/         # React contexts
│   ├── features/         # Feature modules
│   ├── hooks/           # Custom React hooks
│   ├── pages/           # Route pages
│   ├── services/        # Business logic & API
│   ├── utils/           # Utility functions
│   ├── config/          # Configuration files
│   ├── App.tsx          # Main app component
│   └── index.tsx        # Entry point
├── docs/                # Documentation
├── .env.example         # Environment variables template
├── .eslintrc.cjs       # ESLint configuration
├── .prettierrc.json    # Prettier configuration
├── docker-compose.yml   # Docker services
├── package.json         # Dependencies and scripts
├── tsconfig.json       # TypeScript configuration
├── vite.config.ts      # Vite configuration
├── vercel.json         # Vercel deployment config
├── LICENSE             # MIT License
├── SECURITY.md         # Security policy
└── README.md           # This file
```

---

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/AmazingFeature`)
3. **Make your changes** and add tests
4. **Commit your changes** (`git commit -m 'feat: Add AmazingFeature'`)
5. **Push to the branch** (`git push origin feature/AmazingFeature`)
6. **Open a Pull Request**

### Commit Message Format

We follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

### Code Quality Standards

- All TypeScript files must pass type checking
- Code must pass ESLint rules (no warnings)
- New features must include tests
- Maintain test coverage above 70%
- Follow existing code patterns and style

---

## 🔒 Security

### Reporting Security Issues

Please report security vulnerabilities to: **security@geniuswriter.com**

Do not open public issues for security vulnerabilities.

See [SECURITY.md](SECURITY.md) for our complete security policy.

### Security Best Practices

- ✅ XSS protection with DOMPurify
- ✅ HTTPS enforced via HSTS
- ✅ Security headers configured
- ✅ Input validation and sanitization
- ✅ GDPR compliance features
- ⚠️ API key should be moved to backend (production requirement)

---

## 📚 Documentation

- **[Security Policy](SECURITY.md)** - Security guidelines and reporting
- **[Cleanup Checklist](CLEANUP_CHECKLIST.md)** - Technical debt tracking
- **[Phase 1 Documentation](docs/phase-1/)** - Initial development phase
- **[Phase 2 Documentation](docs/phase-2/)** - Feature expansion phase
- **[Competitive Analysis](docs/analysis/COMPETITIVE_ANALYSIS_REPORT.md)** - Market analysis

---

## 🎯 Roadmap

### ✅ Completed
- [x] Core writing tools (25+ content generators)
- [x] CV/Resume builder with ATS scoring
- [x] Multi-language support (4 languages)
- [x] PWA support with offline functionality
- [x] Brand voice management
- [x] Document organization system
- [x] Security hardening (XSS protection, headers)
- [x] Test coverage for critical components
- [x] CI/CD pipeline setup

### 🚧 In Progress
- [ ] Backend API implementation
- [ ] Database schema and migrations
- [ ] User authentication system
- [ ] Payment integration (Stripe)

### 📅 Planned
- [ ] Real-time collaboration features
- [ ] Advanced analytics dashboard
- [ ] API for third-party integrations
- [ ] Mobile applications (iOS/Android)
- [ ] Chrome extension
- [ ] Team workspaces
- [ ] Custom AI model fine-tuning

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Google Gemini AI for powering our AI features
- React team for the amazing framework
- Vercel for hosting platform
- All our contributors and users

---

## 📞 Support

- **Email:** support@geniuswriter.com
- **Issues:** [GitHub Issues](https://github.com/salmazox/genius-writer2.0/issues)
- **Discussions:** [GitHub Discussions](https://github.com/salmazox/genius-writer2.0/discussions)

---

<div align="center">

**[⬆ Back to Top](#genius-writer-20)**

Made with ❤️ by the Genius Writer Team

</div>
