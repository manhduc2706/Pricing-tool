import type { QuotationRequest, SelectedFeature } from './types';

/**
 * Calculate total price from selected features
 */
export function calculateTotalPrice(features: SelectedFeature[]): number {
  return features.reduce((total, feature) => {
    return total + (feature.price * feature.quantity);
  }, 0);
}

/**
 * Format price to currency string
 */
export function formatPrice(price: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(price);
}

/**
 * Generate unique ID
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Create quotation expiry date (default 30 days from now)
 */
export function createExpiryDate(days = 30): Date {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}
