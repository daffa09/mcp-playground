import { Request, Response, NextFunction } from "express";

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

/**
 * Simple in-memory rate limiter
 * Limits requests per IP address
 */
export function rateLimiter(
  maxRequests: number = 100,
  windowMs: number = 60000 // 1 minute
) {
  return (req: Request, res: Response, next: NextFunction) => {
    const key = req.ip || "unknown";
    const now = Date.now();

    if (!store[key] || store[key].resetTime < now) {
      // Reset the counter
      store[key] = {
        count: 1,
        resetTime: now + windowMs,
      };
      return next();
    }

    store[key].count++;

    if (store[key].count > maxRequests) {
      return res.status(429).json({
        error: "Too many requests",
        message: `Rate limit exceeded. Try again in ${Math.ceil(
          (store[key].resetTime - now) / 1000
        )} seconds.`,
      });
    }

    next();
  };
}

/**
 * Cleanup old entries from the store periodically
 */
setInterval(() => {
  const now = Date.now();
  for (const key in store) {
    if (store[key].resetTime < now) {
      delete store[key];
    }
  }
}, 60000); // Clean up every minute
