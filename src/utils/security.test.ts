import { describe, it, expect } from 'vitest';
import { sanitizeHtml, validateImageFile } from './security';

describe('Security Utilities', () => {
  describe('sanitizeHtml', () => {
    it('should allow safe HTML tags', () => {
      const html = '<p>Hello <strong>World</strong></p>';
      const result = sanitizeHtml(html);

      expect(result).toContain('<p>');
      expect(result).toContain('<strong>');
      expect(result).toContain('Hello');
      expect(result).toContain('World');
    });

    it('should remove script tags', () => {
      const html = '<p>Content</p><script>alert("XSS")</script>';
      const result = sanitizeHtml(html);

      expect(result).toContain('<p>');
      expect(result).toContain('Content');
      expect(result).not.toContain('<script>');
      expect(result).not.toContain('alert');
    });

    it('should remove onclick handlers', () => {
      const html = '<button onclick="alert(\'XSS\')">Click</button>';
      const result = sanitizeHtml(html);

      expect(result).not.toContain('onclick');
      expect(result).not.toContain('alert');
      expect(result).toContain('Click');
    });

    it('should remove javascript: URLs', () => {
      const html = '<a href="javascript:alert(\'XSS\')">Link</a>';
      const result = sanitizeHtml(html);

      expect(result).not.toContain('javascript:');
      expect(result).not.toContain('alert');
    });

    it('should allow safe links', () => {
      const html = '<a href="https://example.com">Link</a>';
      const result = sanitizeHtml(html);

      expect(result).toContain('href');
      expect(result).toContain('https://example.com');
      expect(result).toContain('Link');
    });

    it('should remove iframe tags', () => {
      const html = '<p>Content</p><iframe src="evil.com"></iframe>';
      const result = sanitizeHtml(html);

      expect(result).toContain('Content');
      expect(result).not.toContain('<iframe');
      expect(result).not.toContain('evil.com');
    });

    it('should allow lists and formatting', () => {
      const html = '<ul><li>Item 1</li><li>Item 2</li></ul><em>Emphasis</em>';
      const result = sanitizeHtml(html);

      expect(result).toContain('<ul>');
      expect(result).toContain('<li>');
      expect(result).toContain('<em>');
      expect(result).toContain('Item 1');
      expect(result).toContain('Item 2');
    });

    it('should handle empty strings', () => {
      const result = sanitizeHtml('');
      expect(result).toBe('');
    });

    it('should handle plain text', () => {
      const text = 'Plain text without HTML';
      const result = sanitizeHtml(text);
      expect(result).toBe(text);
    });

    it('should remove style tags', () => {
      const html = '<p>Content</p><style>body{display:none}</style>';
      const result = sanitizeHtml(html);

      expect(result).toContain('Content');
      expect(result).not.toContain('<style>');
      expect(result).not.toContain('display:none');
    });
  });

  describe('validateImageFile', () => {
    it('should accept valid image files under size limit', () => {
      const file = new File(['x'.repeat(1024)], 'test.jpg', { type: 'image/jpeg' });
      const result = validateImageFile(file);

      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should accept PNG files', () => {
      const file = new File(['x'.repeat(1024)], 'test.png', { type: 'image/png' });
      const result = validateImageFile(file);

      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should accept WEBP files', () => {
      const file = new File(['x'.repeat(1024)], 'test.webp', { type: 'image/webp' });
      const result = validateImageFile(file);

      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should reject files over 5MB', () => {
      const file = new File(['x'.repeat(6 * 1024 * 1024)], 'large.jpg', { type: 'image/jpeg' });
      const result = validateImageFile(file);

      expect(result.valid).toBe(false);
      expect(result.error).toContain('5MB');
    });

    it('should reject non-image files', () => {
      const file = new File(['content'], 'script.js', { type: 'application/javascript' });
      const result = validateImageFile(file);

      expect(result.valid).toBe(false);
      expect(result.error).toContain('Invalid file type');
    });

    it('should reject executable files', () => {
      const file = new File(['content'], 'malware.exe', { type: 'application/x-msdownload' });
      const result = validateImageFile(file);

      expect(result.valid).toBe(false);
    });
  });
});
