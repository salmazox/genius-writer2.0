/**
 * AI Service - Backend API Client
 *
 * This service provides a secure interface to the Gemini AI through our backend proxy.
 * All API calls are authenticated and rate-limited server-side.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://genius-writer.up.railway.app';

export interface AIGenerateRequest {
  prompt: string;
  model?: 'gemini-2.0-flash-exp' | 'gemini-2.5-pro-preview' | 'gemini-2.5-flash' | 'gemini-2.5-flash-image';
  systemInstruction?: string;
  maxTokens?: number;
  temperature?: number;
  templateId?: string;
}

export interface AIGenerateResponse {
  text: string;
  model: string;
  usage: {
    totalTokens: number;
    promptTokens: number;
    responseTokens: number;
  };
  userUsage: {
    current: number;
    limit: number | 'unlimited';
    remaining: number | 'unlimited';
  };
}

export interface AIUsageStats {
  usage: {
    monthly: number;
    total: number;
    limit: number | 'unlimited';
    remaining: number | 'unlimited';
    percentage: number;
  };
  byModel: Array<{
    model: string;
    count: number;
    tokens: number;
  }>;
  plan: string;
}

class AIService {
  private getAuthHeaders() {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      throw new Error('Authentication required');
    }
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  /**
   * Generate AI content using the backend proxy
   */
  async generate(request: AIGenerateRequest): Promise<AIGenerateResponse> {
    const response = await fetch(`${API_BASE_URL}/api/ai/generate`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(request)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'AI generation failed');
    }

    return data;
  }

  /**
   * Generate streaming AI content
   * Returns an async generator that yields text chunks
   */
  async *generateStream(request: AIGenerateRequest): AsyncGenerator<string, void, unknown> {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_BASE_URL}/api/ai/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || 'AI generation failed');
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('Stream not available');
    }

    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = JSON.parse(line.slice(6));
            if (data.error) {
              throw new Error(data.error);
            }
            if (data.done) {
              return;
            }
            if (data.text) {
              yield data.text;
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  /**
   * Get current usage statistics
   */
  async getUsage(): Promise<AIUsageStats> {
    const response = await fetch(`${API_BASE_URL}/api/ai/usage`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch usage');
    }

    return data;
  }

  /**
   * Check if user has remaining AI generations
   */
  async hasRemainingGenerations(): Promise<boolean> {
    try {
      const stats = await this.getUsage();
      return stats.usage.remaining === 'unlimited' || stats.usage.remaining > 0;
    } catch (error) {
      console.error('Failed to check AI usage:', error);
      return false;
    }
  }
}

export const aiService = new AIService();
export default aiService;
