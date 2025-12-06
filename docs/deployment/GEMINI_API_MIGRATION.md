# Gemini API Migration Guide

## Security Issue Fixed

**Problem:** The Gemini API key was previously exposed in the client-side JavaScript bundle, allowing anyone to extract and misuse it.

**Solution:** All AI generation now goes through a secure backend proxy that keeps the API key server-side.

## What Changed

### ❌ OLD (Insecure - Client-Side API)
```typescript
import { generateContent } from './services/gemini';

const result = await generateContent(ToolType.BLOG_POST, {
  topic: 'My topic',
  tone: 'professional'
});
```

**Problem:** API key exposed in browser → Can be stolen → Unlimited API usage on your account

### ✅ NEW (Secure - Backend Proxy)
```typescript
import { aiService } from './services/aiService';

const result = await aiService.generate({
  prompt: 'Write a professional blog post about: My topic',
  model: 'gemini-2.5-flash',
  temperature: 0.7
});

const text = result.text;
```

**Benefits:**
- ✅ API key stays secure on backend
- ✅ Rate limiting enforced server-side
- ✅ Usage tracking per user
- ✅ Plan limits enforced (FREE: 10/month, PRO: 100/month, etc.)
- ✅ Authentication required

## Backend Configuration

### 1. Install Dependencies (Backend)
```bash
cd backend
npm install @google/genai
```

### 2. Set Environment Variable (Railway)
```bash
GEMINI_API_KEY=your_actual_api_key_here
```

**Where to get your API key:**
1. Go to https://aistudio.google.com/app/apikey
2. Create a new API key
3. Copy it to Railway environment variables
4. **NEVER** commit it to git

### 3. Verify Backend Route
The backend proxy is already implemented at `/backend/routes/ai.js` with three endpoints:

- `POST /api/ai/generate` - Generate content
- `POST /api/ai/stream` - Stream content in real-time
- `GET /api/ai/usage` - Get usage statistics

## Frontend Migration Steps

### For Each Component Using Gemini:

#### Step 1: Update Import
```typescript
// OLD
import { generateContent, generateContentStream } from './services/gemini';

// NEW
import { aiService } from './services/aiService';
```

#### Step 2: Update Function Calls

**Non-Streaming Generation:**
```typescript
// OLD
const result = await generateContent(tool, inputs, brandVoice, signal);

// NEW
const response = await aiService.generate({
  prompt: inputs.prompt,  // Build your prompt
  model: 'gemini-2.5-flash',
  systemInstruction: brandVoice,
  temperature: 0.7
});
const result = response.text;
```

**Streaming Generation:**
```typescript
// OLD
for await (const chunk of generateContentStream(tool, inputs)) {
  setText(prev => prev + chunk);
}

// NEW
for await (const chunk of aiService.generateStream({
  prompt: inputs.prompt,
  model: 'gemini-2.5-flash'
})) {
  setText(prev => prev + chunk);
}
```

### Components That Need Migration

The following 12 components still use the old client-side Gemini API:

1. `src/components/RichTextEditor.tsx`
2. `src/features/BrandVoiceManager.tsx`
3. `src/features/cv/CoverLetterPanel.tsx`
4. `src/features/cv/JobDescriptionPanel.tsx`
5. `src/features/cv/LinkedInPostsPanel.tsx`
6. `src/features/CvBuilder.tsx`
7. `src/features/dashboard/OverviewView.tsx`
8. `src/features/GenericTool.tsx`
9. `src/features/LiveInterview.tsx`
10. `src/features/SmartEditor.tsx`
11. `src/features/Translator.tsx`
12. `src/hooks/useAudioPlayer.ts`

## API Reference

### aiService.generate()

Generate AI content (non-streaming).

```typescript
interface AIGenerateRequest {
  prompt: string;                    // Required: Your prompt
  model?: string;                    // Optional: Model name (default: gemini-2.5-flash)
  systemInstruction?: string;        // Optional: System instruction/context
  maxTokens?: number;               // Optional: Max output tokens
  temperature?: number;              // Optional: 0-1, creativity level
  templateId?: string;              // Optional: For usage tracking
}

const response = await aiService.generate({
  prompt: 'Write a blog post about AI',
  model: 'gemini-2.5-flash',
  systemInstruction: 'You are a professional tech writer',
  temperature: 0.7
});

console.log(response.text);        // Generated text
console.log(response.usage);       // Token usage stats
console.log(response.userUsage);   // User's remaining quota
```

### aiService.generateStream()

Generate AI content with real-time streaming.

```typescript
let fullText = '';

for await (const chunk of aiService.generateStream({
  prompt: 'Write a story',
  model: 'gemini-2.5-flash'
})) {
  fullText += chunk;
  setDisplayText(fullText);  // Update UI in real-time
}
```

### aiService.getUsage()

Get current usage statistics.

```typescript
const stats = await aiService.getUsage();

console.log(stats.usage.monthly);     // Current month usage
console.log(stats.usage.limit);       // Plan limit
console.log(stats.usage.remaining);   // Remaining generations
console.log(stats.usage.percentage);  // Usage percentage
console.log(stats.plan);             // User's plan (FREE, PRO, etc.)
```

## Available Models

- `gemini-2.0-flash-exp` - Fastest, experimental
- `gemini-2.5-flash` - Fast, production (recommended)
- `gemini-2.5-pro-preview` - Most capable, slower
- `gemini-2.5-flash-image` - Image generation

## Rate Limiting

The backend enforces rate limits:
- **Client-side:** 10 requests per minute (via aiGenerationLimiter middleware)
- **Server-side:** Plan-based monthly limits:
  - FREE: 10 generations/month
  - PRO: 100 generations/month
  - AGENCY: 500 generations/month
  - ENTERPRISE: Unlimited

## Error Handling

```typescript
try {
  const response = await aiService.generate({ prompt: 'Hello' });
  console.log(response.text);
} catch (error) {
  if (error.message.includes('Authentication required')) {
    // User not logged in
    navigate('/login');
  } else if (error.message.includes('Usage limit exceeded')) {
    // Show upgrade modal
    showUpgradeModal();
  } else {
    // Other error
    showError(error.message);
  }
}
```

## Testing

### Local Development
1. Set backend env var: `GEMINI_API_KEY=your_key`
2. Start backend: `cd backend && npm run dev`
3. Start frontend: `npm run dev`
4. Backend runs on port 3000, frontend on port 5173

### Production
1. Set `GEMINI_API_KEY` in Railway
2. Verify `VITE_API_URL` points to Railway backend in Vercel
3. Deploy both frontend and backend
4. Test AI generation through the app

## Security Checklist

- [x] Remove `API_KEY` from frontend .env files
- [x] Add `GEMINI_API_KEY` to backend .env (Railway)
- [ ] Migrate all 12 components to use aiService
- [x] Backend authentication enforced
- [x] Rate limiting configured
- [x] Usage tracking implemented
- [ ] Remove `@google/genai` from frontend package.json (optional)

## FAQ

**Q: What happens to existing code that uses the old API?**
A: It will throw a runtime error with a clear migration message. The app won't break at compile time.

**Q: Can I still use the old generateContent() function?**
A: No, it's disabled for security. You must migrate to aiService.

**Q: Do I need to change my prompts?**
A: The prompting might be simpler with the new API. Instead of using tool-specific configs, you just pass a prompt string.

**Q: What about caching and rate limiting?**
A: The backend handles rate limiting. Client-side caching is no longer needed since the backend is fast.

**Q: Will this cost more?**
A: No, you'll actually save money because usage is now tracked and limited per user plan.

## Support

If you encounter issues during migration:
1. Check backend logs in Railway
2. Check browser console for error messages
3. Verify `GEMINI_API_KEY` is set in Railway
4. Verify `VITE_API_URL` points to correct backend URL

## Next Steps

1. ✅ API key removed from client (completed)
2. ✅ Backend proxy created (completed)
3. ✅ Frontend aiService created (completed)
4. ⏳ Migrate 12 components (in progress)
5. ⏳ Remove @google/genai from frontend dependencies
6. ⏳ Test all AI features end-to-end
