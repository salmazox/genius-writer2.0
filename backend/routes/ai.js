const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('../middleware/auth');
const { aiGenerationLimiter } = require('../middleware/rateLimiter');

const router = express.Router();
const prisma = new PrismaClient();

// Note: You'll need to install @google/genai in backend
// Run: npm install @google/genai

let GoogleGenerativeAI;
try {
  const genaiModule = require('@google/genai');
  GoogleGenerativeAI = genaiModule.GoogleGenerativeAI;
} catch (error) {
  console.warn('[AI PROXY] @google/genai not installed. AI proxy will not work.');
  console.warn('[AI PROXY] Run: npm install @google/genai');
}

/**
 * POST /api/ai/generate
 * Proxy endpoint for AI content generation
 * This keeps the API key secure on the server side
 */
router.post('/generate', authenticate, aiGenerationLimiter, async (req, res) => {
  try {
    const {
      prompt,
      model = 'gemini-2.5-flash',
      systemInstruction,
      maxTokens,
      temperature,
      templateId
    } = req.body;

    // Validation
    if (!prompt) {
      return res.status(400).json({
        error: 'Missing prompt',
        message: 'A prompt is required for AI generation'
      });
    }

    if (!process.env.GEMINI_API_KEY || !GoogleGenerativeAI) {
      return res.status(503).json({
        error: 'Service unavailable',
        message: 'AI generation service is not configured'
      });
    }

    // Check user plan and usage limits
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { plan: true }
    });

    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: 'User account does not exist'
      });
    }

    // Get user's usage for current month
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const monthlyUsage = await prisma.apiUsage.count({
      where: {
        userId: req.userId,
        createdAt: {
          gte: firstDayOfMonth
        }
      }
    });

    // Define plan limits
    const planLimits = {
      FREE: 10,
      PRO: 100,
      AGENCY: 500,
      ENTERPRISE: -1 // Unlimited
    };

    const limit = planLimits[user.plan] || 10;

    if (limit !== -1 && monthlyUsage >= limit) {
      return res.status(429).json({
        error: 'Usage limit exceeded',
        message: `You have reached your monthly limit of ${limit} AI generations. Please upgrade your plan.`,
        currentUsage: monthlyUsage,
        limit
      });
    }

    // Initialize Gemini AI
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const modelInstance = genAI.getGenerativeModel({
      model,
      ...(systemInstruction && { systemInstruction })
    });

    // Generate content
    const generationConfig = {
      ...(temperature && { temperature }),
      ...(maxTokens && { maxOutputTokens: maxTokens })
    };

    const result = await modelInstance.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig
    });

    const response = result.response;
    const text = response.text();

    // Track usage
    const usageMetadata = response.usageMetadata || {};
    await prisma.apiUsage.create({
      data: {
        userId: req.userId,
        endpoint: templateId || 'ai-generate',
        model,
        tokens: usageMetadata.totalTokenCount || 0,
        cost: calculateCost(model, usageMetadata.totalTokenCount || 0),
        date: new Date()
      }
    });

    res.json({
      text,
      model,
      usage: {
        totalTokens: usageMetadata.totalTokenCount,
        promptTokens: usageMetadata.promptTokenCount,
        responseTokens: usageMetadata.candidatesTokenCount
      },
      userUsage: {
        current: monthlyUsage + 1,
        limit: limit === -1 ? 'unlimited' : limit,
        remaining: limit === -1 ? 'unlimited' : Math.max(0, limit - monthlyUsage - 1)
      }
    });
  } catch (error) {
    console.error('[AI PROXY] Generation error:', error);

    // Handle specific Gemini errors
    if (error.status === 429) {
      return res.status(429).json({
        error: 'Rate limit exceeded',
        message: 'AI service rate limit exceeded. Please try again in a moment.'
      });
    }

    if (error.status === 400) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'The AI service could not process your request. Please check your prompt.'
      });
    }

    res.status(500).json({
      error: 'AI generation failed',
      message: 'An error occurred while generating content'
    });
  }
});

/**
 * POST /api/ai/stream
 * Streaming endpoint for AI content generation
 * This provides real-time responses as they're generated
 */
router.post('/stream', authenticate, aiGenerationLimiter, async (req, res) => {
  try {
    const {
      prompt,
      model = 'gemini-2.5-flash',
      systemInstruction,
      templateId
    } = req.body;

    if (!prompt) {
      return res.status(400).json({
        error: 'Missing prompt',
        message: 'A prompt is required for AI generation'
      });
    }

    if (!process.env.GEMINI_API_KEY || !GoogleGenerativeAI) {
      return res.status(503).json({
        error: 'Service unavailable',
        message: 'AI generation service is not configured'
      });
    }

    // Check usage limits (same as generate endpoint)
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { plan: true }
    });

    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const monthlyUsage = await prisma.apiUsage.count({
      where: {
        userId: req.userId,
        createdAt: {
          gte: firstDayOfMonth
        }
      }
    });

    const planLimits = {
      FREE: 10,
      PRO: 100,
      AGENCY: 500,
      ENTERPRISE: -1
    };

    const limit = planLimits[user.plan] || 10;

    if (limit !== -1 && monthlyUsage >= limit) {
      return res.status(429).json({
        error: 'Usage limit exceeded',
        message: `You have reached your monthly limit of ${limit} AI generations.`
      });
    }

    // Set up SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Initialize Gemini AI
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const modelInstance = genAI.getGenerativeModel({
      model,
      ...(systemInstruction && { systemInstruction })
    });

    const result = await modelInstance.generateContentStream({
      contents: [{ role: 'user', parts: [{ text: prompt }] }]
    });

    let fullText = '';
    let tokenCount = 0;

    // Stream the response
    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      fullText += chunkText;
      res.write(`data: ${JSON.stringify({ text: chunkText })}\n\n`);
    }

    // Track usage after completion
    await prisma.apiUsage.create({
      data: {
        userId: req.userId,
        endpoint: templateId || 'ai-stream',
        model,
        tokens: tokenCount,
        cost: calculateCost(model, tokenCount),
        date: new Date()
      }
    });

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (error) {
    console.error('[AI PROXY] Stream error:', error);
    res.write(`data: ${JSON.stringify({ error: 'Generation failed' })}\n\n`);
    res.end();
  }
});

/**
 * GET /api/ai/usage
 * Get user's current AI usage statistics
 */
router.get('/usage', authenticate, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { plan: true }
    });

    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [monthlyUsage, totalUsage, usageByModel] = await Promise.all([
      prisma.apiUsage.count({
        where: {
          userId: req.userId,
          createdAt: {
            gte: firstDayOfMonth
          }
        }
      }),
      prisma.apiUsage.count({
        where: { userId: req.userId }
      }),
      prisma.apiUsage.groupBy({
        by: ['model'],
        where: {
          userId: req.userId,
          createdAt: {
            gte: firstDayOfMonth
          }
        },
        _count: true,
        _sum: {
          tokens: true
        }
      })
    ]);

    const planLimits = {
      FREE: 10,
      PRO: 100,
      AGENCY: 500,
      ENTERPRISE: -1
    };

    const limit = planLimits[user.plan] || 10;

    res.json({
      usage: {
        monthly: monthlyUsage,
        total: totalUsage,
        limit: limit === -1 ? 'unlimited' : limit,
        remaining: limit === -1 ? 'unlimited' : Math.max(0, limit - monthlyUsage),
        percentage: limit === -1 ? 0 : Math.round((monthlyUsage / limit) * 100)
      },
      byModel: usageByModel.map(item => ({
        model: item.model,
        count: item._count,
        tokens: item._sum.tokens
      })),
      plan: user.plan
    });
  } catch (error) {
    console.error('[AI PROXY] Usage stats error:', error);
    res.status(500).json({
      error: 'Failed to fetch usage',
      message: 'An error occurred while retrieving usage statistics'
    });
  }
});

/**
 * Calculate cost based on model and tokens
 * Update these rates based on actual Gemini pricing
 */
function calculateCost(model, tokens) {
  const rates = {
    'gemini-2.0-flash-exp': 0.000001, // $0.000001 per token (example)
    'gemini-2.5-pro-preview': 0.000005,
    'gemini-2.5-flash': 0.0000015,
    'gemini-2.5-flash-image': 0.000002
  };

  const rate = rates[model] || 0.000001;
  return tokens * rate;
}

module.exports = router;
