import { describe, it, expect } from 'vitest';
import { cn, formatDivisionLevel } from '@/lib/utils';

describe('cn utility function', () => {
  it('should merge class names correctly', () => {
    const result = cn('text-red-500', 'bg-blue-500');
    expect(result).toBe('text-red-500 bg-blue-500');
  });

  it('should handle conditional classes', () => {
    const isActive = true;
    const result = cn('base-class', isActive && 'active-class');
    expect(result).toBe('base-class active-class');
  });

  it('should handle falsy values', () => {
    const isFalsy = false;
    const result = cn('base-class', isFalsy && 'hidden', null, undefined);
    expect(result).toBe('base-class');
  });

  it('should merge Tailwind classes correctly (last wins)', () => {
    const result = cn('text-red-500', 'text-blue-500');
    expect(result).toBe('text-blue-500');
  });

  it('should handle empty input', () => {
    const result = cn();
    expect(result).toBe('');
  });
});

describe('formatDivisionLevel', () => {
  it('should format underscore-separated uppercase values', () => {
    expect(formatDivisionLevel('UPPER_INTERMEDIATE')).toBe('Upper Intermediate');
  });

  it('should format single lowercase word', () => {
    expect(formatDivisionLevel('beginner')).toBe('Beginner');
  });

  it('should format single uppercase word', () => {
    expect(formatDivisionLevel('ADVANCED')).toBe('Advanced');
  });

  it('should return "Unknown" for null', () => {
    expect(formatDivisionLevel(null)).toBe('Unknown');
  });

  it('should return "Unknown" for undefined', () => {
    expect(formatDivisionLevel(undefined)).toBe('Unknown');
  });

  it('should return "Unknown" for empty string', () => {
    expect(formatDivisionLevel('')).toBe('Unknown');
  });
});
