# Security Policy

## Supported Versions

We release patches for security vulnerabilities. Currently supported versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |

## Reporting a Vulnerability

We take the security of Genius Writer seriously. If you believe you have found a security vulnerability, please report it to us as described below.

### Please do NOT:

- Open a public GitHub issue for security vulnerabilities
- Discuss the vulnerability in public forums, social media, or mailing lists
- Exploit the vulnerability beyond what is necessary to demonstrate it

### Please DO:

1. **Email us directly** at: security@geniuswriter.com (or create a private security advisory on GitHub)
2. **Provide detailed information** including:
   - Type of vulnerability (e.g., XSS, SQL injection, authentication bypass)
   - Full paths of source file(s) related to the vulnerability
   - Location of the affected source code (tag/branch/commit or direct URL)
   - Step-by-step instructions to reproduce the issue
   - Proof-of-concept or exploit code (if possible)
   - Impact of the issue and potential attack scenarios

### What to expect:

- **Acknowledgment**: We will acknowledge receipt of your report within 48 hours
- **Updates**: We will send you regular updates about our progress
- **Timeline**: We aim to address critical vulnerabilities within 7 days
- **Credit**: If you wish, we will credit you in our security advisories (unless you prefer to remain anonymous)

## Security Best Practices

### For Users:

1. **API Keys**: Never commit API keys to version control
2. **Environment Variables**: Use `.env.local` for local development and never commit it
3. **Updates**: Keep your dependencies up to date using `npm update`
4. **Secrets**: Use secure secret management services for production deployments

### For Contributors:

1. **Input Validation**: Always validate and sanitize user inputs
2. **XSS Prevention**: Use DOMPurify for sanitizing HTML content (already integrated)
3. **Authentication**: Implement proper JWT validation on backend endpoints
4. **HTTPS**: Always use HTTPS in production
5. **Rate Limiting**: Implement rate limiting on API endpoints
6. **Dependencies**: Regularly run `npm audit` and address vulnerabilities

## Known Security Considerations

### Current Implementation Notes:

⚠️ **API Key Exposure (Development Mode)**
- The current implementation exposes the Gemini API key in the client bundle for demonstration purposes
- **This is NOT production-ready** and should only be used for local development
- Before production deployment, you MUST:
  - Implement a backend proxy for all AI API calls
  - Store API keys securely on the backend
  - Never expose API keys in client-side code

⚠️ **Authentication & Authorization**
- Backend authentication endpoints are currently placeholders
- Production deployment requires:
  - Full implementation of JWT-based authentication
  - Secure password hashing (bcrypt is already included)
  - Session management
  - Role-based access control (RBAC)

⚠️ **Payment Processing**
- Stripe webhook signature verification is implemented
- Ensure webhook endpoint uses HTTPS in production
- Validate all payment amounts on the backend

## Security Headers

The following security headers should be configured in production:

```
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.tailwindcss.com; style-src 'self' 'unsafe-inline'
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), microphone=(), camera=()
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

These are configured in `vercel.json` for Vercel deployments.

## Vulnerability Disclosure Timeline

1. **Day 0**: Vulnerability reported
2. **Day 1-2**: Acknowledgment and initial assessment
3. **Day 3-7**: Patch development and internal testing
4. **Day 7-14**: Patch release and security advisory publication
5. **Day 14+**: Public disclosure (if applicable)

## Security Tooling

We use the following tools to maintain security:

- **npm audit**: Regular dependency vulnerability scanning
- **GitHub Dependabot**: Automated dependency updates
- **ESLint**: Static code analysis with security rules
- **TypeScript**: Type safety to prevent common errors
- **Vitest**: Comprehensive testing including security test cases

## Contact

For security issues: security@geniuswriter.com
For general questions: support@geniuswriter.com
GitHub Security Advisories: https://github.com/salmazox/genius-writer2.0/security/advisories

## Updates to This Policy

This security policy may be updated from time to time. Please check back regularly for updates.

**Last Updated**: December 2024
