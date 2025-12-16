import { Request, Response, NextFunction } from 'express';

export interface ValidationError {
  field: string;
  message: string;
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength
 * Requirements: min 8 chars, 1 uppercase, 1 lowercase, 1 number
 */
export function isValidPassword(password: string): boolean {
  if (password.length < 8) return false;
  if (!/[A-Z]/.test(password)) return false;
  if (!/[a-z]/.test(password)) return false;
  if (!/[0-9]/.test(password)) return false;
  return true;
}

/**
 * Validate user input
 */
export function validateUser(req: Request, res: Response, next: NextFunction) {
  const errors: ValidationError[] = [];
  const { email, password, name } = req.body;

  if (!email || !isValidEmail(email)) {
    errors.push({ field: 'email', message: 'Invalid email format' });
  }

  if (!password || !isValidPassword(password)) {
    errors.push({
      field: 'password',
      message: 'Password must be at least 8 characters with uppercase, lowercase, and number',
    });
  }

  if (!name || name.trim().length < 2) {
    errors.push({ field: 'name', message: 'Name must be at least 2 characters' });
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors });
  }

  next();
}

/**
 * Validate product input
 */
export function validateProduct(req: Request, res: Response, next: NextFunction) {
  const errors: ValidationError[] = [];
  const { name, price, stock, category } = req.body;

  if (!name || name.trim().length < 3) {
    errors.push({ field: 'name', message: 'Product name must be at least 3 characters' });
  }

  if (!price || price <= 0) {
    errors.push({ field: 'price', message: 'Price must be greater than 0' });
  }

  if (stock !== undefined && stock < 0) {
    errors.push({ field: 'stock', message: 'Stock cannot be negative' });
  }

  if (!category || category.trim().length === 0) {
    errors.push({ field: 'category', message: 'Category is required' });
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors });
  }

  next();
}
