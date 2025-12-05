const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('../middleware/auth');
const { getUserUsageStats } = require('../middleware/planLimits');

const router = express.Router();
const prisma = new PrismaClient();

/**
 * GET /api/usage
 * Get comprehensive usage statistics for the current user
 */
router.get('/', authenticate, async (req, res) => {
  try {
    // Get user plan
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { plan: true }
    });

    const stats = await getUserUsageStats(req.userId, user?.plan || 'FREE');

    res.json({
      userId: req.userId,
      ...stats
    });
  } catch (error) {
    console.error('[USAGE] Stats error:', error);
    res.status(500).json({
      error: 'Failed to fetch usage statistics',
      message: 'An error occurred while retrieving your usage data'
    });
  }
});

/**
 * GET /api/usage/check/:feature
 * Check if user has access to a specific feature
 */
router.get('/check/:feature', authenticate, async (req, res) => {
  try {
    const { feature } = req.params;

    // Get user plan
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { plan: true }
    });

    const userPlan = user?.plan || 'FREE';

    // Define feature access by plan
    const featureAccess = {
      'collaboration': ['AGENCY', 'ENTERPRISE'],
      'advanced-analytics': ['AGENCY', 'ENTERPRISE'],
      'api-access': ['ENTERPRISE'],
      'priority-support': ['AGENCY', 'ENTERPRISE'],
      'brand-voice': ['PRO', 'AGENCY', 'ENTERPRISE'],
      'all-templates': ['PRO', 'AGENCY', 'ENTERPRISE'],
      'document-versions': ['PRO', 'AGENCY', 'ENTERPRISE'],
      'export-docx': ['PRO', 'AGENCY', 'ENTERPRISE'],
      'export-html': ['PRO', 'AGENCY', 'ENTERPRISE'],
      'export-md': ['AGENCY', 'ENTERPRISE'],
      'export-txt': ['AGENCY', 'ENTERPRISE']
    };

    const allowedPlans = featureAccess[feature];
    const hasAccess = allowedPlans ? allowedPlans.includes(userPlan) : true;

    res.json({
      feature,
      hasAccess,
      userPlan,
      requiredPlans: allowedPlans || ['All plans'],
      needsUpgrade: !hasAccess
    });
  } catch (error) {
    console.error('[USAGE] Feature check error:', error);
    res.status(500).json({
      error: 'Failed to check feature access',
      message: 'An error occurred while checking feature access'
    });
  }
});

module.exports = router;
