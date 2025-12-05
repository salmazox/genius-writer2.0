const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('../middleware/auth');

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

module.exports = router;
