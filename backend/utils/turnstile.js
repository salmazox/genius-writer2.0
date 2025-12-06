/**
 * Cloudflare Turnstile Verification Utility
 *
 * Verifies Turnstile tokens on the server side
 */

/**
 * Verify a Turnstile token with Cloudflare
 * @param {string} token - The Turnstile token from the client
 * @param {string} remoteIp - Optional: User's IP address
 * @returns {Promise<{success: boolean, error?: string}>}
 */
async function verifyTurnstileToken(token, remoteIp = null) {
  const secretKey = process.env.TURNSTILE_SECRET_KEY;

  // If Turnstile is not configured, skip verification (development)
  if (!secretKey) {
    console.warn('[TURNSTILE] Secret key not configured - skipping verification (development mode)');
    return { success: true };
  }

  // Validate token format
  if (!token || typeof token !== 'string') {
    return { success: false, error: 'Invalid token format' };
  }

  try {
    // Make request to Cloudflare Turnstile API
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        secret: secretKey,
        response: token,
        remoteip: remoteIp
      })
    });

    const data = await response.json();

    if (data.success) {
      console.log('[TURNSTILE] Verification successful');
      return { success: true };
    } else {
      console.warn('[TURNSTILE] Verification failed:', data['error-codes']);
      return {
        success: false,
        error: data['error-codes']?.join(', ') || 'Verification failed'
      };
    }
  } catch (error) {
    console.error('[TURNSTILE] Verification error:', error);
    return {
      success: false,
      error: 'Failed to verify with Cloudflare'
    };
  }
}

/**
 * Express middleware to verify Turnstile token
 * Expects token in req.body.turnstileToken
 */
function turnstileMiddleware(req, res, next) {
  const token = req.body.turnstileToken;
  const remoteIp = req.ip || req.connection.remoteAddress;

  verifyTurnstileToken(token, remoteIp)
    .then(result => {
      if (result.success) {
        next();
      } else {
        res.status(400).json({
          error: 'Bot verification failed',
          message: 'Please complete the security check',
          details: result.error
        });
      }
    })
    .catch(error => {
      console.error('[TURNSTILE] Middleware error:', error);
      res.status(500).json({
        error: 'Verification error',
        message: 'Could not verify security check'
      });
    });
}

module.exports = {
  verifyTurnstileToken,
  turnstileMiddleware
};
