
// Security utilities and environment validation
export const validateEnvironment = () => {
  const requiredEnvVars = [
    'NODE_ENV',
  ];

  const missing = requiredEnvVars.filter(envVar => !process.env[envVar]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
};

// Rate limiting utility
export class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  
  constructor(
    private maxRequests: number = 10,
    private windowMs: number = 60000 // 1 minute
  ) {}
  
  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const requests = this.requests.get(identifier) || [];
    
    // Remove old requests outside the window
    const validRequests = requests.filter(time => now - time < this.windowMs);
    
    if (validRequests.length >= this.maxRequests) {
      return false;
    }
    
    validRequests.push(now);
    this.requests.set(identifier, validRequests);
    return true;
  }
}

// Enhanced input sanitization
export const sanitizeInput = (input: string): string => {
  if (typeof input !== 'string') return '';
  
  return input
    .replace(/[<>'"]/g, '') // Remove potential HTML/script tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim()
    .substring(0, 50); // Limit length for numeric inputs
};

// Validate numeric input specifically for amounts
export const sanitizeNumericInput = (input: string): string => {
  if (typeof input !== 'string') return '';
  
  // Only allow numbers, decimal points, and basic arithmetic
  return input
    .replace(/[^0-9.]/g, '')
    .replace(/(\..*)\./g, '$1') // Only one decimal point
    .substring(0, 20); // Reasonable length limit
};

// Validate hex string
export const isValidHex = (hex: string): boolean => {
  return /^0x[a-fA-F0-9]+$/.test(hex);
};
