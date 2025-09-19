// Application constants

export const API_ENDPOINTS = {
  CATEGORIES: '/api/categories',
  DEVICES: '/api/devices',
  LICENSES: '/api/licenses',
  QUOTATIONS: '/api/quotations',
  COST_SERVER: '/api/costServer',
  ITEM_DETAIL: '/api/itemDetail',
  FILE_IMAGE: '/api/fileImage',
} as const;

export const DEFAULT_CURRENCY = 'USD';

export const QUOTATION_VALIDITY_DAYS = 30;

export const MAX_CAMERA_COUNT = 1000;

export const SUPPORTED_FILE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
] as const;
