const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * Plan Limits Configuration
 * Keep this in sync with frontend src/config/pricing.ts
 */
const PLAN_LIMITS = {
  FREE: {
    aiGenerations: 10,
    documentsPerMonth: 5,
    storageGB: 0.1,
    exportFormats: ['PDF'],
    collaborators: 0,
    brands: 1
  },
  PRO: {
    aiGenerations: 100,
    documentsPerMonth: 50,
    storageGB: 5,
    exportFormats: ['PDF', 'DOCX', 'HTML'],
    collaborators: 0,
    brands: 3
  },
  AGENCY: {
    aiGenerations: 500,
    documentsPerMonth: 200,
    storageGB: 50,
    exportFormats: ['PDF', 'DOCX', 'HTML', 'MD', 'TXT'],
    collaborators: 5,
    brands: 10
  },
  ENTERPRISE: {
    aiGenerations: -1, // Unlimited
    documentsPerMonth: -1, // Unlimited
    storageGB: 500,
    exportFormats: ['PDF', 'DOCX', 'HTML', 'MD', 'TXT', 'JSON'],
    collaborators: -1, // Unlimited
    brands: -1 // Unlimited
  }
};

/**
 * Middleware to attach user plan information to request
 * Use this before checkPlanLimit middleware
 */
async function attachPlanInfo(req, res, next) {
  try {
    if (!req.userId) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'Please login to continue'
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: {
        id: true,
        plan: true,
        email: true,
        name: true
      }
    });

    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: 'User account does not exist'
      });
    }

    req.userPlan = user.plan;
    req.planLimits = PLAN_LIMITS[user.plan] || PLAN_LIMITS.FREE;
    req.user = user;

    next();
  } catch (error) {
    console.error('[PLAN MIDDLEWARE] Error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to verify plan access'
    });
  }
}

/**
 * Check if user has reached their monthly document limit
 */
async function checkDocumentLimit(req, res, next) {
  try {
    const limit = req.planLimits.documentsPerMonth;

    // Unlimited for some plans
    if (limit === -1) {
      return next();
    }

    // Get documents created this month
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const monthlyDocs = await prisma.document.count({
      where: {
        userId: req.userId,
        createdAt: {
          gte: firstDayOfMonth
        },
        deletedAt: null // Don't count deleted documents
      }
    });

    if (monthlyDocs >= limit) {
      return res.status(429).json({
        error: 'Document limit reached',
        message: `You have reached your monthly limit of ${limit} documents. Please upgrade your plan to create more.`,
        currentUsage: monthlyDocs,
        limit,
        plan: req.userPlan,
        upgradeUrl: '/pricing'
      });
    }

    // Attach usage info to request for response
    req.documentUsage = {
      current: monthlyDocs,
      limit,
      remaining: limit - monthlyDocs
    };

    next();
  } catch (error) {
    console.error('[DOCUMENT LIMIT] Check error:', error);
    // Don't block request on error, just log it
    next();
  }
}

/**
 * Check if user has exceeded their storage limit
 */
async function checkStorageLimit(req, res, next) {
  try {
    const limitGB = req.planLimits.storageGB;
    const limitBytes = limitGB * 1024 * 1024 * 1024; // Convert GB to bytes

    // Get total storage used
    const documents = await prisma.document.findMany({
      where: {
        userId: req.userId,
        deletedAt: null
      },
      select: {
        content: true
      }
    });

    // Calculate total size (approximate - using character count as bytes)
    const totalBytes = documents.reduce((sum, doc) => {
      return sum + (doc.content?.length || 0);
    }, 0);

    const usedGB = totalBytes / (1024 * 1024 * 1024);

    if (totalBytes >= limitBytes) {
      return res.status(429).json({
        error: 'Storage limit reached',
        message: `You have reached your storage limit of ${limitGB}GB. Please upgrade your plan or delete some documents.`,
        currentUsage: `${usedGB.toFixed(2)}GB`,
        limit: `${limitGB}GB`,
        plan: req.userPlan,
        upgradeUrl: '/pricing'
      });
    }

    // Attach storage info to request
    req.storageUsage = {
      current: totalBytes,
      currentGB: usedGB.toFixed(2),
      limit: limitBytes,
      limitGB,
      percentage: Math.round((totalBytes / limitBytes) * 100)
    };

    next();
  } catch (error) {
    console.error('[STORAGE LIMIT] Check error:', error);
    // Don't block request on error
    next();
  }
}

/**
 * Check if user's plan allows a specific export format
 */
function checkExportFormat(req, res, next) {
  try {
    const requestedFormat = req.body.format || req.query.format;

    if (!requestedFormat) {
      // No format specified, allow request to continue
      return next();
    }

    const allowedFormats = req.planLimits.exportFormats;
    const formatUpper = requestedFormat.toUpperCase();

    if (!allowedFormats.includes(formatUpper)) {
      return res.status(403).json({
        error: 'Export format not allowed',
        message: `Your ${req.userPlan} plan does not support ${formatUpper} export. Allowed formats: ${allowedFormats.join(', ')}.`,
        allowedFormats,
        requestedFormat: formatUpper,
        plan: req.userPlan,
        upgradeUrl: '/pricing'
      });
    }

    next();
  } catch (error) {
    console.error('[EXPORT FORMAT] Check error:', error);
    next();
  }
}

/**
 * Check if user's plan allows access to a specific feature
 */
function checkFeatureAccess(featureName) {
  return (req, res, next) => {
    try {
      const plan = req.userPlan;

      // Define feature access by plan
      const featureAccess = {
        'collaboration': ['AGENCY', 'ENTERPRISE'],
        'advanced-analytics': ['AGENCY', 'ENTERPRISE'],
        'api-access': ['ENTERPRISE'],
        'priority-support': ['AGENCY', 'ENTERPRISE'],
        'brand-voice': ['PRO', 'AGENCY', 'ENTERPRISE'],
        'all-templates': ['PRO', 'AGENCY', 'ENTERPRISE']
      };

      const allowedPlans = featureAccess[featureName];

      if (!allowedPlans) {
        // Feature doesn't have restrictions
        return next();
      }

      if (!allowedPlans.includes(plan)) {
        return res.status(403).json({
          error: 'Feature not available',
          message: `The ${featureName.replace('-', ' ')} feature is not available on your ${plan} plan.`,
          feature: featureName,
          plan,
          requiredPlans: allowedPlans,
          upgradeUrl: '/pricing'
        });
      }

      next();
    } catch (error) {
      console.error('[FEATURE ACCESS] Check error:', error);
      next();
    }
  };
}

/**
 * Get comprehensive usage statistics for a user
 */
async function getUserUsageStats(userId, userPlan) {
  try {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const limits = PLAN_LIMITS[userPlan] || PLAN_LIMITS.FREE;

    // Get AI generation usage
    const aiUsage = await prisma.apiUsage.count({
      where: {
        userId,
        createdAt: {
          gte: firstDayOfMonth
        }
      }
    });

    // Get document count
    const documentCount = await prisma.document.count({
      where: {
        userId,
        createdAt: {
          gte: firstDayOfMonth
        },
        deletedAt: null
      }
    });

    // Get total documents (all time)
    const totalDocuments = await prisma.document.count({
      where: {
        userId,
        deletedAt: null
      }
    });

    // Calculate storage usage
    const documents = await prisma.document.findMany({
      where: {
        userId,
        deletedAt: null
      },
      select: {
        content: true
      }
    });

    const totalBytes = documents.reduce((sum, doc) => {
      return sum + (doc.content?.length || 0);
    }, 0);

    const usedGB = totalBytes / (1024 * 1024 * 1024);

    return {
      plan: userPlan,
      limits,
      usage: {
        aiGenerations: {
          current: aiUsage,
          limit: limits.aiGenerations === -1 ? 'unlimited' : limits.aiGenerations,
          remaining: limits.aiGenerations === -1 ? 'unlimited' : Math.max(0, limits.aiGenerations - aiUsage),
          percentage: limits.aiGenerations === -1 ? 0 : Math.round((aiUsage / limits.aiGenerations) * 100)
        },
        documents: {
          currentMonth: documentCount,
          total: totalDocuments,
          limit: limits.documentsPerMonth === -1 ? 'unlimited' : limits.documentsPerMonth,
          remaining: limits.documentsPerMonth === -1 ? 'unlimited' : Math.max(0, limits.documentsPerMonth - documentCount),
          percentage: limits.documentsPerMonth === -1 ? 0 : Math.round((documentCount / limits.documentsPerMonth) * 100)
        },
        storage: {
          used: `${usedGB.toFixed(2)}GB`,
          usedBytes: totalBytes,
          limit: `${limits.storageGB}GB`,
          limitBytes: limits.storageGB * 1024 * 1024 * 1024,
          percentage: Math.round((totalBytes / (limits.storageGB * 1024 * 1024 * 1024)) * 100)
        }
      },
      allowedFormats: limits.exportFormats,
      features: {
        collaboration: ['AGENCY', 'ENTERPRISE'].includes(userPlan),
        advancedAnalytics: ['AGENCY', 'ENTERPRISE'].includes(userPlan),
        apiAccess: userPlan === 'ENTERPRISE',
        prioritySupport: ['AGENCY', 'ENTERPRISE'].includes(userPlan),
        brandVoice: ['PRO', 'AGENCY', 'ENTERPRISE'].includes(userPlan)
      }
    };
  } catch (error) {
    console.error('[USAGE STATS] Error:', error);
    throw error;
  }
}

module.exports = {
  PLAN_LIMITS,
  attachPlanInfo,
  checkDocumentLimit,
  checkStorageLimit,
  checkExportFormat,
  checkFeatureAccess,
  getUserUsageStats
};
