// Authentication Service - API Integration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://genius-writer.up.railway.app';

export interface SignupData {
  name: string;
  email: string;
  password: string;
  passwordConfirm?: string;
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  termsAccepted: boolean;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  message: string;
  user: {
    id: string;
    email: string;
    name: string;
    plan: string;
    avatar?: string;
    bio?: string;
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
    createdAt: string;
  };
  token: string;
}

export interface ApiError {
  error: string;
  message: string;
}

class AuthService {
  private token: string | null = null;

  constructor() {
    // Load token from localStorage on init
    this.token = localStorage.getItem('auth_token');
  }

  /**
   * Register a new user account
   */
  async signup(data: SignupData): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: data.name,
        email: data.email,
        password: data.password,
        street: data.street,
        city: data.city,
        state: data.state,
        postalCode: data.postalCode,
        country: data.country,
        termsAccepted: data.termsAccepted,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Signup failed');
    }

    // Save token and user data
    this.token = result.token;
    localStorage.setItem('auth_token', result.token);
    localStorage.setItem('ai_writer_user', JSON.stringify(result.user));

    return result;
  }

  /**
   * Login with existing credentials
   */
  async login(data: LoginData): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Login failed');
    }

    // Save token and user data
    this.token = result.token;
    localStorage.setItem('auth_token', result.token);
    localStorage.setItem('ai_writer_user', JSON.stringify(result.user));

    return result;
  }

  /**
   * Logout - clear session
   */
  async logout(): Promise<void> {
    if (this.token) {
      try {
        await fetch(`${API_BASE_URL}/api/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.token}`,
          },
        });
      } catch (error) {
        console.error('Logout error:', error);
      }
    }

    // Clear local data
    this.token = null;
    localStorage.removeItem('auth_token');
    localStorage.removeItem('ai_writer_user');
  }

  /**
   * Get current authenticated user
   */
  async getCurrentUser() {
    if (!this.token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
      headers: {
        'Authorization': `Bearer ${this.token}`,
      },
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Failed to get user');
    }

    return result.user;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.token;
  }

  /**
   * Get the current auth token
   */
  getToken(): string | null {
    return this.token;
  }

  /**
   * Validate password strength
   */
  validatePassword(password: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (password.length < 10) {
      errors.push('Password must be at least 10 characters long');
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (!/[0-9]/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Calculate password strength (0-100)
   */
  getPasswordStrength(password: string): number {
    let strength = 0;

    if (password.length >= 10) strength += 25;
    if (password.length >= 12) strength += 10;
    if (password.length >= 16) strength += 10;

    if (/[a-z]/.test(password)) strength += 15;
    if (/[A-Z]/.test(password)) strength += 15;
    if (/[0-9]/.test(password)) strength += 15;
    if (/[^a-zA-Z0-9]/.test(password)) strength += 10;

    return Math.min(strength, 100);
  }
}

// Export singleton instance
export const authService = new AuthService();
