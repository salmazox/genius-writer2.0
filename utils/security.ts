import DOMPurify from 'dompurify';

/**
 * XSS sanitization using DOMPurify.
 * This removes malicious scripts and event handlers from HTML content.
 */
export const sanitizeHtml = (html: string): string => {
  if (!html) return "";
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'ul', 'ol', 'li', 'br', 'u', 'span', 'div'],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'class', 'style'],
  });
};

/**
 * Validates file upload for images.
 * Max size: 5MB
 * Allowed types: JPEG, PNG, WEBP
 */
export const validateImageFile = (file: File): { valid: boolean; error?: string } => {
  const MAX_SIZE = 5 * 1024 * 1024; // 5MB
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

  if (!ALLOWED_TYPES.includes(file.type)) {
    return { valid: false, error: "Invalid file type. Please upload JPG, PNG, or WEBP." };
  }

  if (file.size > MAX_SIZE) {
    return { valid: false, error: "File too large. Maximum size is 5MB." };
  }

  return { valid: true };
};