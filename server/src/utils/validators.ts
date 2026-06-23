import {
  integrationProviders,
  taskCategories,
  taskPriorities,
  taskSources,
  taskStatuses,
} from '../types/domain';
import { HttpError } from './http-error';

export const requireString = (body: Record<string, unknown>, key: string, max = 255) => {
  const value = body[key];
  if (typeof value !== 'string' || !value.trim()) {
    throw new HttpError(400, `${key} is required`);
  }
  if (value.length > max) {
    throw new HttpError(400, `${key} must be ${max} characters or fewer`);
  }
  return value.trim();
};

export const optionalString = (body: Record<string, unknown>, key: string, max = 5000) => {
  const value = body[key];
  if (value === undefined || value === null || value === '') return null;
  if (typeof value !== 'string') {
    throw new HttpError(400, `${key} must be a string`);
  }
  if (value.length > max) {
    throw new HttpError(400, `${key} must be ${max} characters or fewer`);
  }
  return value.trim();
};

export const enumValue = <T extends readonly string[]>(
  body: Record<string, unknown>,
  key: string,
  allowed: T,
  fallback?: T[number],
) => {
  const value = body[key];
  if (value === undefined || value === null || value === '') {
    if (fallback) return fallback;
    throw new HttpError(400, `${key} is required`);
  }
  if (typeof value !== 'string' || !allowed.includes(value)) {
    throw new HttpError(400, `${key} must be one of: ${allowed.join(', ')}`);
  }
  return value as T[number];
};

export const optionalDate = (body: Record<string, unknown>, key: string) => {
  const value = body[key];
  if (value === undefined || value === null || value === '') return null;
  if (typeof value !== 'string') {
    throw new HttpError(400, `${key} must be an ISO date string`);
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new HttpError(400, `${key} must be a valid ISO date string`);
  }
  return date;
};

export const validators = {
  integrationProviders,
  taskCategories,
  taskPriorities,
  taskSources,
  taskStatuses,
};
