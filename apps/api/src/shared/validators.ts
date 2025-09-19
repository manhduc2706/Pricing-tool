import type { QuotationRequest } from './types';
import { isValidEmail } from './utils';

/**
 * Validate quotation request data
 */
export function validateQuotationRequest(request: QuotationRequest): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Validate user info
  if (!request.userInfo.name?.trim()) {
    errors.push('Name is required');
  }

  if (!request.userInfo.email?.trim()) {
    errors.push('Email is required');
  } else if (!isValidEmail(request.userInfo.email)) {
    errors.push('Invalid email format');
  }

  // Validate location
  if (!request.location?.trim()) {
    errors.push('Location is required');
  }

  // Validate infrastructure
  if (!request.infrastructure?.trim()) {
    errors.push('Infrastructure selection is required');
  }

  // Validate services
  if (!request.services || request.services.length === 0) {
    errors.push('At least one service must be selected');
  }

  // Validate camera count if provided
  if (request.cameraCount !== undefined && request.cameraCount < 1) {
    errors.push('Camera count must be at least 1');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
