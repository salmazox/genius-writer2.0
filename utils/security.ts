
/**
 * Basic XSS sanitization. 
 * NOTE: In a production environment, use a library like DOMPurify.
 */
export const sanitizeHtml = (html: string): string => {
  if (!html) return "";
  // Basic script tag removal
  return html
    .replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gm, "")
    .replace(/on\w+="[^"]*"/g, "");
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
