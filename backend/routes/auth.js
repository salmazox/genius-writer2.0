const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('../middleware/auth');
const emailService = require('../services/emailService');

const router = express.Router();
const prisma = new PrismaClient();

// JWT token expiration (7 days)
const TOKEN_EXPIRATION = '7d';
const TOKEN_EXPIRATION_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * POST /api/auth/signup
 * Register a new user
 */
router.post('/signup', async (req, res) => {
  try {
    const {
      email,
      password,
      name,
      street,
      city,
      state,
      postalCode,
      country,
      termsAccepted
    } = req.body;

    console.log('[SIGNUP] Attempt for email:', email);

    // Validation
    if (!email || !password || !name) {
      console.log('[SIGNUP] Missing required fields');
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Email, password, and name are required'
      });
    }

    // Terms acceptance validation
    if (!termsAccepted) {
      console.log('[SIGNUP] Terms not accepted');
      return res.status(400).json({
        error: 'Terms not accepted',
        message: 'You must accept the Terms of Service and Privacy Policy'
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log('[SIGNUP] Invalid email format:', email);
      return res.status(400).json({
        error: 'Invalid email',
        message: 'Please provide a valid email address'
      });
    }

    // Password validation (min 10 characters with complexity)
    if (password.length < 10) {
      console.log('[SIGNUP] Password too short');
      return res.status(400).json({
        error: 'Weak password',
        message: 'Password must be at least 10 characters long'
      });
    }

    // Password complexity check
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);

    if (!hasUpperCase || !hasLowerCase || !hasNumber) {
      console.log('[SIGNUP] Password lacks complexity');
      return res.status(400).json({
        error: 'Weak password',
        message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
      });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (existingUser) {
      console.log('[SIGNUP] User already exists:', email);
      return res.status(409).json({
        error: 'User already exists',
        message: 'An account with this email already exists'
      });
    }

    console.log('[SIGNUP] Hashing password...');

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log('[SIGNUP] Creating user in database...');

    // Create user
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        name,
        street: street || null,
        city: city || null,
        state: state || null,
        postalCode: postalCode || null,
        country: country || null,
        termsAcceptedAt: new Date(),
        plan: 'FREE'
      }
    });

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: TOKEN_EXPIRATION }
    );

    // Create session in database
    const expiresAt = new Date(Date.now() + TOKEN_EXPIRATION_MS);
    await prisma.session.create({
      data: {
        userId: user.id,
        token,
        expiresAt
      }
    });

    console.log('[SIGNUP] User created successfully:', user.email);

    // Return user data (without password)
    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        plan: user.plan,
        avatar: user.avatar,
        bio: user.bio,
        street: user.street,
        city: user.city,
        postalCode: user.postalCode,
        country: user.country,
        createdAt: user.createdAt
      },
      token
    });
  } catch (error) {
    console.error('[SIGNUP] Error:', error);
    res.status(500).json({
      error: 'Signup failed',
      message: 'An error occurred during registration'
    });
  }
});

/**
 * POST /api/auth/login
 * Authenticate user and return JWT token
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('[LOGIN] Attempt for email:', email);

    // Validation
    if (!email || !password) {
      console.log('[LOGIN] Missing credentials');
      return res.status(400).json({
        error: 'Missing credentials',
        message: 'Email and password are required'
      });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (!user) {
      console.log('[LOGIN] User not found:', email);
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'Email or password is incorrect'
      });
    }

    console.log('[LOGIN] User found, verifying password...');

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);

    console.log('[LOGIN] Password valid:', isValidPassword);

    if (!isValidPassword) {
      console.log('[LOGIN] Invalid password for:', email);
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'Email or password is incorrect'
      });
    }

    console.log('[LOGIN] Login successful for:', email);

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: TOKEN_EXPIRATION }
    );

    // Create session in database
    const expiresAt = new Date(Date.now() + TOKEN_EXPIRATION_MS);
    await prisma.session.create({
      data: {
        userId: user.id,
        token,
        expiresAt
      }
    });

    // Return user data (without password)
    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        plan: user.plan,
        avatar: user.avatar,
        bio: user.bio,
        street: user.street,
        city: user.city,
        postalCode: user.postalCode,
        country: user.country,
        createdAt: user.createdAt
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Login failed',
      message: 'An error occurred during login'
    });
  }
});

/**
 * POST /api/auth/logout
 * Invalidate current session
 */
router.post('/logout', authenticate, async (req, res) => {
  try {
    const token = req.headers.authorization.substring(7);

    // Delete session from database
    await prisma.session.deleteMany({
      where: {
        token,
        userId: req.userId
      }
    });

    res.json({
      message: 'Logout successful'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      error: 'Logout failed',
      message: 'An error occurred during logout'
    });
  }
});

/**
 * GET /api/auth/me
 * Get current authenticated user
 */
router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        bio: true,
        plan: true,
        street: true,
        city: true,
        postalCode: true,
        country: true,
        createdAt: true,
        updatedAt: true,
        // Don't return password
        password: false
      }
    });

    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: 'User account no longer exists'
      });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      error: 'Failed to get user',
      message: 'An error occurred while fetching user data'
    });
  }
});

/**
 * PUT /api/auth/profile
 * Update user profile information
 */
router.put('/profile', authenticate, async (req, res) => {
  try {
    const {
      name,
      bio,
      street,
      city,
      postalCode,
      country
    } = req.body;

    console.log('[UPDATE PROFILE] Updating profile for user:', req.userId);

    // Update user
    const user = await prisma.user.update({
      where: { id: req.userId },
      data: {
        ...(name && { name }),
        ...(bio !== undefined && { bio }),
        ...(street !== undefined && { street }),
        ...(city !== undefined && { city }),
        ...(postalCode !== undefined && { postalCode }),
        ...(country !== undefined && { country }),
        updatedAt: new Date()
      },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        bio: true,
        plan: true,
        street: true,
        city: true,
        postalCode: true,
        country: true,
        createdAt: true,
        updatedAt: true
      }
    });

    console.log('[UPDATE PROFILE] Profile updated successfully');

    res.json({
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    console.error('[UPDATE PROFILE] Error:', error);
    res.status(500).json({
      error: 'Update failed',
      message: 'An error occurred while updating your profile'
    });
  }
});

/**
 * POST /api/auth/change-password
 * Change user password
 */
router.post('/change-password', authenticate, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    console.log('[CHANGE PASSWORD] Attempt for user:', req.userId);

    // Validation
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Current password and new password are required'
      });
    }

    // Get user with password
    const user = await prisma.user.findUnique({
      where: { id: req.userId }
    });

    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: 'User account no longer exists'
      });
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.password);

    if (!isValidPassword) {
      console.log('[CHANGE PASSWORD] Invalid current password');
      return res.status(401).json({
        error: 'Invalid password',
        message: 'Current password is incorrect'
      });
    }

    // Validate new password (min 10 characters with complexity)
    if (newPassword.length < 10) {
      return res.status(400).json({
        error: 'Weak password',
        message: 'Password must be at least 10 characters long'
      });
    }

    const hasUpperCase = /[A-Z]/.test(newPassword);
    const hasLowerCase = /[a-z]/.test(newPassword);
    const hasNumber = /[0-9]/.test(newPassword);

    if (!hasUpperCase || !hasLowerCase || !hasNumber) {
      return res.status(400).json({
        error: 'Weak password',
        message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await prisma.user.update({
      where: { id: req.userId },
      data: { password: hashedPassword }
    });

    console.log('[CHANGE PASSWORD] Password changed successfully');

    res.json({
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('[CHANGE PASSWORD] Error:', error);
    res.status(500).json({
      error: 'Password change failed',
      message: 'An error occurred while changing your password'
    });
  }
});

/**
 * DELETE /api/auth/account
 * Delete user account permanently
 */
router.delete('/account', authenticate, async (req, res) => {
  try {
    const { password } = req.body;

    console.log('[DELETE ACCOUNT] Attempt for user:', req.userId);

    if (!password) {
      return res.status(400).json({
        error: 'Password required',
        message: 'Password confirmation is required to delete your account'
      });
    }

    // Get user with password
    const user = await prisma.user.findUnique({
      where: { id: req.userId }
    });

    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: 'User account no longer exists'
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({
        error: 'Invalid password',
        message: 'Password is incorrect'
      });
    }

    // Delete user (cascading deletes will handle related records)
    await prisma.user.delete({
      where: { id: req.userId }
    });

    console.log('[DELETE ACCOUNT] Account deleted successfully:', user.email);

    res.json({
      message: 'Account deleted successfully'
    });
  } catch (error) {
    console.error('[DELETE ACCOUNT] Error:', error);
    res.status(500).json({
      error: 'Account deletion failed',
      message: 'An error occurred while deleting your account'
    });
  }
});

/**
 * DELETE /api/auth/sessions
 * Clear all sessions for current user (logout from all devices)
 */
router.delete('/sessions', authenticate, async (req, res) => {
  try {
    const result = await prisma.session.deleteMany({
      where: { userId: req.userId }
    });

    res.json({
      message: 'All sessions cleared',
      count: result.count
    });
  } catch (error) {
    console.error('Clear sessions error:', error);
    res.status(500).json({
      error: 'Failed to clear sessions',
      message: 'An error occurred while clearing sessions'
    });
  }
});

/**
 * GET /api/auth/debug/users
 * Debug endpoint - list all users (remove in production)
 * This helps verify user creation and password hashing
 */
router.get('/debug/users', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        plan: true,
        createdAt: true,
        // Show first 10 chars of password hash for verification
        password: true
      }
    });

    // Show password hash info (for debugging only)
    const usersWithHashInfo = users.map(user => ({
      id: user.id,
      email: user.email,
      name: user.name,
      plan: user.plan,
      createdAt: user.createdAt,
      passwordHashPrefix: user.password ? user.password.substring(0, 20) + '...' : 'NULL',
      passwordHashLength: user.password ? user.password.length : 0,
      isBcryptHash: user.password ? user.password.startsWith('$2a$') || user.password.startsWith('$2b$') : false
    }));

    res.json({
      count: users.length,
      users: usersWithHashInfo
    });
  } catch (error) {
    console.error('[DEBUG] Error fetching users:', error);
    res.status(500).json({
      error: 'Debug failed',
      message: error.message
    });
  }
});

/**
 * POST /api/auth/debug/verify-password
 * Debug endpoint - verify password hashing works
 */
router.post('/debug/verify-password', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (!user) {
      return res.json({
        found: false,
        message: 'User not found'
      });
    }

    const isValid = await bcrypt.compare(password, user.password);

    res.json({
      found: true,
      email: user.email,
      passwordHashPrefix: user.password.substring(0, 20) + '...',
      passwordHashLength: user.password.length,
      isBcryptHash: user.password.startsWith('$2a$') || user.password.startsWith('$2b$'),
      passwordMatches: isValid,
      bcryptVersion: user.password.substring(0, 4)
    });
  } catch (error) {
    console.error('[DEBUG] Password verification error:', error);
    res.status(500).json({
      error: 'Debug failed',
      message: error.message
    });
  }
});

/**
 * POST /api/auth/forgot-password
 * Request password reset - generates token and sends email
 */
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    console.log('[FORGOT PASSWORD] Request for email:', email);

    // Validation
    if (!email) {
      return res.status(400).json({
        error: 'Missing email',
        message: 'Email address is required'
      });
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    // Always return success to prevent email enumeration
    // But only send email if user exists
    if (!user) {
      console.log('[FORGOT PASSWORD] User not found:', email);
      return res.json({
        message: 'If an account with that email exists, a password reset link has been sent.'
      });
    }

    // Generate secure random token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    console.log('[FORGOT PASSWORD] Generated reset token for:', email);

    // Save token to database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry
      }
    });

    // Send password reset email
    try {
      await emailService.sendPasswordResetEmail(email, resetToken, user.name);
      console.log('[FORGOT PASSWORD] Reset email sent to:', email);
    } catch (emailError) {
      console.error('[FORGOT PASSWORD] Failed to send email:', emailError);
      // Don't expose email sending errors to user
    }

    res.json({
      message: 'If an account with that email exists, a password reset link has been sent.'
    });
  } catch (error) {
    console.error('[FORGOT PASSWORD] Error:', error);
    res.status(500).json({
      error: 'Request failed',
      message: 'An error occurred while processing your request'
    });
  }
});

/**
 * POST /api/auth/reset-password
 * Reset password using token from email
 */
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    console.log('[RESET PASSWORD] Attempt with token');

    // Validation
    if (!token || !newPassword) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Reset token and new password are required'
      });
    }

    // Password validation (same as signup)
    if (newPassword.length < 10) {
      return res.status(400).json({
        error: 'Weak password',
        message: 'Password must be at least 10 characters long'
      });
    }

    const hasUpperCase = /[A-Z]/.test(newPassword);
    const hasLowerCase = /[a-z]/.test(newPassword);
    const hasNumber = /[0-9]/.test(newPassword);

    if (!hasUpperCase || !hasLowerCase || !hasNumber) {
      return res.status(400).json({
        error: 'Weak password',
        message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
      });
    }

    // Find user with valid reset token
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: {
          gt: new Date() // Token must not be expired
        }
      }
    });

    if (!user) {
      console.log('[RESET PASSWORD] Invalid or expired token');
      return res.status(400).json({
        error: 'Invalid token',
        message: 'Password reset link is invalid or has expired'
      });
    }

    console.log('[RESET PASSWORD] Valid token for user:', user.email);

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password and clear reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
        updatedAt: new Date()
      }
    });

    // Invalidate all existing sessions for security
    await prisma.session.deleteMany({
      where: { userId: user.id }
    });

    console.log('[RESET PASSWORD] Password reset successful for:', user.email);

    res.json({
      message: 'Password has been reset successfully. You can now log in with your new password.'
    });
  } catch (error) {
    console.error('[RESET PASSWORD] Error:', error);
    res.status(500).json({
      error: 'Reset failed',
      message: 'An error occurred while resetting your password'
    });
  }
});

module.exports = router;
