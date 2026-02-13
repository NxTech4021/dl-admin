import { describe, it, expect } from 'vitest';
import {
  getStatusBadgeVariant,
  getStatusBadgeColor,
  getStatusBadgeProps,
  getGameTypeLabel,
  getDivisionLevelLabel,
  getGenderCategoryLabel,
  formatTableDate,
  formatDateTime,
  formatCurrency,
  formatLocation,
  getInitials,
  renderValue,
  formatCount,
  getGameTypeOptionsForSport,
  getMatchStatusLabel,
  getCancellationReasonLabel,
  getWalkoverReasonLabel,
  TABLE_CONFIG,
  COLUMN_WIDTHS,
  STATUS_BADGE_VARIANTS,
  STATUS_BADGE_COLORS,
} from '@/components/data-table/constants';

// ===== STATUS BADGE FUNCTIONS =====

describe('getStatusBadgeVariant', () => {
  it('should return correct variant for SEASON ACTIVE', () => {
    expect(getStatusBadgeVariant('SEASON', 'ACTIVE')).toBe('default');
  });

  it('should return correct variant for SEASON UPCOMING', () => {
    expect(getStatusBadgeVariant('SEASON', 'UPCOMING')).toBe('secondary');
  });

  it('should return correct variant for SEASON CANCELLED', () => {
    expect(getStatusBadgeVariant('SEASON', 'CANCELLED')).toBe('destructive');
  });

  it('should return correct variant for LEAGUE SUSPENDED', () => {
    expect(getStatusBadgeVariant('LEAGUE', 'SUSPENDED')).toBe('destructive');
  });

  it('should return correct variant for ADMIN PENDING', () => {
    expect(getStatusBadgeVariant('ADMIN', 'PENDING')).toBe('secondary');
  });

  it('should return correct variant for MATCH COMPLETED', () => {
    expect(getStatusBadgeVariant('MATCH', 'COMPLETED')).toBe('outline');
  });

  it('should return "outline" for unknown status', () => {
    expect(getStatusBadgeVariant('SEASON', 'NONEXISTENT')).toBe('outline');
  });
});

describe('getStatusBadgeColor', () => {
  it('should return correct color classes for SEASON ACTIVE', () => {
    const color = getStatusBadgeColor('SEASON', 'ACTIVE');
    expect(color).toContain('bg-green-500');
    expect(color).toContain('text-white');
  });

  it('should return correct color classes for ADMIN SUSPENDED', () => {
    const color = getStatusBadgeColor('ADMIN', 'SUSPENDED');
    expect(color).toContain('bg-red-400');
  });

  it('should return empty string for unknown status', () => {
    expect(getStatusBadgeColor('SEASON', 'NONEXISTENT')).toBe('');
  });
});

describe('getStatusBadgeProps', () => {
  it('should return both variant and className', () => {
    const props = getStatusBadgeProps('SEASON', 'ACTIVE');
    expect(props).toHaveProperty('variant', 'default');
    expect(props).toHaveProperty('className');
    expect(props.className).toContain('bg-green-500');
  });

  it('should return fallback props for unknown status', () => {
    const props = getStatusBadgeProps('SEASON', 'UNKNOWN');
    expect(props.variant).toBe('outline');
    expect(props.className).toBe('');
  });
});

// ===== LABEL FUNCTIONS =====

describe('getGameTypeLabel', () => {
  it('should return "Singles" for SINGLES', () => {
    expect(getGameTypeLabel('SINGLES')).toBe('Singles');
  });

  it('should return "Doubles" for DOUBLES', () => {
    expect(getGameTypeLabel('DOUBLES')).toBe('Doubles');
  });

  it('should return "Mixed Doubles" for MIXED', () => {
    expect(getGameTypeLabel('MIXED')).toBe('Mixed Doubles');
  });

  it('should handle lowercase keys', () => {
    expect(getGameTypeLabel('singles')).toBe('Singles');
    expect(getGameTypeLabel('doubles')).toBe('Doubles');
    expect(getGameTypeLabel('mixed')).toBe('Mixed Doubles');
  });

  it('should return the input for unknown game types', () => {
    expect(getGameTypeLabel('UNKNOWN')).toBe('UNKNOWN');
  });
});

describe('getDivisionLevelLabel', () => {
  it('should return "Beginner" for beginner', () => {
    expect(getDivisionLevelLabel('beginner')).toBe('Beginner');
  });

  it('should return "Upper Intermediate" for upper_intermediate', () => {
    expect(getDivisionLevelLabel('upper_intermediate')).toBe('Upper Intermediate');
  });

  it('should return "Expert" for expert', () => {
    expect(getDivisionLevelLabel('expert')).toBe('Expert');
  });

  it('should return the input for unknown levels', () => {
    expect(getDivisionLevelLabel('unknown_level')).toBe('unknown_level');
  });
});

describe('getGenderCategoryLabel', () => {
  it('should return "Male" for male', () => {
    expect(getGenderCategoryLabel('male')).toBe('Male');
  });

  it('should return "Female" for female', () => {
    expect(getGenderCategoryLabel('female')).toBe('Female');
  });

  it('should return "Mixed" for mixed', () => {
    expect(getGenderCategoryLabel('mixed')).toBe('Mixed');
  });

  it('should return "Missing Category" for null', () => {
    expect(getGenderCategoryLabel(null)).toBe('Missing Category');
  });

  it('should return "Missing Category" for undefined', () => {
    expect(getGenderCategoryLabel(undefined)).toBe('Missing Category');
  });

  it('should return the input for unknown categories', () => {
    expect(getGenderCategoryLabel('other')).toBe('other');
  });
});

// ===== DATE FORMATTING =====

describe('formatTableDate', () => {
  it('should format a valid date string', () => {
    const result = formatTableDate('2024-06-15');
    expect(result).toContain('Jun');
    expect(result).toContain('15');
    expect(result).toContain('2024');
  });

  it('should format a Date object', () => {
    const date = new Date(2024, 5, 15); // June 15, 2024
    const result = formatTableDate(date);
    expect(result).toContain('Jun');
    expect(result).toContain('15');
    expect(result).toContain('2024');
  });

  it('should return "Not set" for null', () => {
    expect(formatTableDate(null)).toBe('Not set');
  });

  it('should return "Not set" for undefined', () => {
    expect(formatTableDate(undefined)).toBe('Not set');
  });

  it('should return "Invalid date" for invalid date string', () => {
    expect(formatTableDate('not-a-date')).toBe('Invalid date');
  });
});

describe('formatDateTime', () => {
  it('should format a valid date string with time', () => {
    const result = formatDateTime('2024-06-15T14:30:00');
    expect(result).toContain('Jun');
    expect(result).toContain('15');
    expect(result).toContain('2024');
  });

  it('should format a Date object with time', () => {
    const date = new Date(2024, 5, 15, 14, 30); // June 15, 2024, 2:30 PM
    const result = formatDateTime(date);
    expect(result).toContain('Jun');
    expect(result).toContain('15');
    expect(result).toContain('2024');
  });

  it('should return "Not set" for null', () => {
    expect(formatDateTime(null)).toBe('Not set');
  });

  it('should return "Not set" for undefined', () => {
    expect(formatDateTime(undefined)).toBe('Not set');
  });

  it('should return "Invalid date" for invalid date string', () => {
    expect(formatDateTime('not-a-date')).toBe('Invalid date');
  });
});

// ===== CURRENCY FORMATTING =====

describe('formatCurrency (data-table)', () => {
  it('should format MYR currency', () => {
    const result = formatCurrency(1500, 'MYR');
    expect(result).toContain('RM');
    expect(result).toContain('1,500');
  });

  it('should return "Free" for null', () => {
    expect(formatCurrency(null, 'MYR')).toBe('Free');
  });

  it('should return "Free" for undefined', () => {
    expect(formatCurrency(undefined, 'MYR')).toBe('Free');
  });

  it('should return "Free" for 0', () => {
    expect(formatCurrency(0, 'MYR')).toBe('Free');
  });

  it('should parse string amounts', () => {
    const result = formatCurrency('2500', 'MYR');
    expect(result).toContain('RM');
    expect(result).toContain('2,500');
  });

  it('should return the string for unparseable string values', () => {
    expect(formatCurrency('free-entry', 'MYR')).toBe('free-entry');
  });
});

// ===== STRING FORMATTING =====

describe('formatLocation', () => {
  it('should capitalize hyphen-separated words', () => {
    expect(formatLocation('kuala-lumpur')).toBe('Kuala Lumpur');
  });

  it('should handle single word', () => {
    expect(formatLocation('penang')).toBe('Penang');
  });

  it('should handle uppercase input', () => {
    expect(formatLocation('SHAH-ALAM')).toBe('Shah Alam');
  });

  it('should return "Not specified" for null', () => {
    expect(formatLocation(null)).toBe('Not specified');
  });

  it('should return "Not specified" for undefined', () => {
    expect(formatLocation(undefined)).toBe('Not specified');
  });
});

describe('getInitials', () => {
  it('should get initials from full name', () => {
    expect(getInitials('John Doe')).toBe('JD');
  });

  it('should get initials from single name', () => {
    expect(getInitials('John')).toBe('J');
  });

  it('should get initials from three names', () => {
    expect(getInitials('John Michael Doe')).toBe('JMD');
  });

  it('should return uppercase initials', () => {
    expect(getInitials('john doe')).toBe('JD');
  });
});

// ===== RENDER HELPERS =====

describe('renderValue', () => {
  it('should return the string for valid values', () => {
    expect(renderValue('hello')).toBe('hello');
  });

  it('should return string for numbers', () => {
    expect(renderValue(42)).toBe('42');
  });

  it('should return "-" for null', () => {
    expect(renderValue(null)).toBe('-');
  });

  it('should return "-" for undefined', () => {
    expect(renderValue(undefined)).toBe('-');
  });

  it('should return "-" for empty string', () => {
    expect(renderValue('')).toBe('-');
  });
});

describe('formatCount', () => {
  it('should return string for valid numbers', () => {
    expect(formatCount(42)).toBe('42');
  });

  it('should return string for zero', () => {
    expect(formatCount(0)).toBe('0');
  });

  it('should return "-" for null', () => {
    expect(formatCount(null)).toBe('-');
  });

  it('should return "-" for undefined', () => {
    expect(formatCount(undefined)).toBe('-');
  });
});

// ===== SPORT-SPECIFIC OPTIONS =====

describe('getGameTypeOptionsForSport', () => {
  it('should return correct options for TENNIS', () => {
    const options = getGameTypeOptionsForSport('TENNIS');
    expect(options).toHaveLength(3);
    expect(options[0]).toEqual({ value: 'SINGLES', label: 'Singles' });
    expect(options[1]).toEqual({ value: 'DOUBLES', label: 'Doubles' });
    expect(options[2]).toEqual({ value: 'MIXED', label: 'Mixed Doubles' });
  });

  it('should return correct options for PADEL', () => {
    const options = getGameTypeOptionsForSport('PADEL');
    expect(options).toHaveLength(3);
    // PADEL puts DOUBLES first
    expect(options[0]).toEqual({ value: 'DOUBLES', label: 'Doubles' });
    expect(options[1]).toEqual({ value: 'MIXED', label: 'Mixed Doubles' });
    expect(options[2]).toEqual({ value: 'SINGLES', label: 'Singles' });
  });

  it('should return correct options for PICKLEBALL', () => {
    const options = getGameTypeOptionsForSport('PICKLEBALL');
    expect(options).toHaveLength(3);
    expect(options[0]).toEqual({ value: 'SINGLES', label: 'Singles' });
  });

  it('should return default options for unknown sport', () => {
    const options = getGameTypeOptionsForSport('UNKNOWN');
    expect(options).toHaveLength(3);
    expect(options[0]).toEqual({ value: 'SINGLES', label: 'Singles' });
  });
});

// ===== MATCH-SPECIFIC LABELS =====

describe('getMatchStatusLabel', () => {
  it('should return "Draft" for DRAFT', () => {
    expect(getMatchStatusLabel('DRAFT')).toBe('Draft');
  });

  it('should return "Scheduled" for SCHEDULED', () => {
    expect(getMatchStatusLabel('SCHEDULED')).toBe('Scheduled');
  });

  it('should return "In Progress" for ONGOING', () => {
    expect(getMatchStatusLabel('ONGOING')).toBe('In Progress');
  });

  it('should return "Completed" for COMPLETED', () => {
    expect(getMatchStatusLabel('COMPLETED')).toBe('Completed');
  });

  it('should return "Voided" for VOID', () => {
    expect(getMatchStatusLabel('VOID')).toBe('Voided');
  });

  it('should return the input for unknown statuses', () => {
    expect(getMatchStatusLabel('UNKNOWN')).toBe('UNKNOWN');
  });
});

describe('getCancellationReasonLabel', () => {
  it('should return "Personal Emergency" for PERSONAL_EMERGENCY', () => {
    expect(getCancellationReasonLabel('PERSONAL_EMERGENCY')).toBe('Personal Emergency');
  });

  it('should return "Injury" for INJURY', () => {
    expect(getCancellationReasonLabel('INJURY')).toBe('Injury');
  });

  it('should return "Weather" for WEATHER', () => {
    expect(getCancellationReasonLabel('WEATHER')).toBe('Weather');
  });

  it('should return the input for unknown reasons', () => {
    expect(getCancellationReasonLabel('UNKNOWN')).toBe('UNKNOWN');
  });
});

describe('getWalkoverReasonLabel', () => {
  it('should return "No Show" for NO_SHOW', () => {
    expect(getWalkoverReasonLabel('NO_SHOW')).toBe('No Show');
  });

  it('should return "Late Cancellation" for LATE_CANCELLATION', () => {
    expect(getWalkoverReasonLabel('LATE_CANCELLATION')).toBe('Late Cancellation');
  });

  it('should return the input for unknown reasons', () => {
    expect(getWalkoverReasonLabel('UNKNOWN')).toBe('UNKNOWN');
  });
});

// ===== CONSTANTS =====

describe('TABLE_CONFIG', () => {
  it('should have correct default page size', () => {
    expect(TABLE_CONFIG.DEFAULT_PAGE_SIZE).toBe(10);
  });

  it('should have correct page sizes', () => {
    expect(TABLE_CONFIG.PAGE_SIZES).toEqual([10, 20, 30, 40, 50]);
  });

  it('should have correct search debounce', () => {
    expect(TABLE_CONFIG.SEARCH_DEBOUNCE).toBe(300);
  });
});

describe('COLUMN_WIDTHS', () => {
  it('should have expected width classes', () => {
    expect(COLUMN_WIDTHS.CHECKBOX).toBe('w-12');
    expect(COLUMN_WIDTHS.AVATAR).toBe('w-16');
    expect(COLUMN_WIDTHS.ACTIONS).toBe('w-20');
    expect(COLUMN_WIDTHS.SMALL).toBe('w-24');
    expect(COLUMN_WIDTHS.MEDIUM).toBe('w-32');
    expect(COLUMN_WIDTHS.LARGE).toBe('w-48');
    expect(COLUMN_WIDTHS.EXTRA_LARGE).toBe('w-64');
  });
});

describe('STATUS_BADGE_VARIANTS', () => {
  it('should have entries for all entity types', () => {
    expect(STATUS_BADGE_VARIANTS).toHaveProperty('SEASON');
    expect(STATUS_BADGE_VARIANTS).toHaveProperty('LEAGUE');
    expect(STATUS_BADGE_VARIANTS).toHaveProperty('ADMIN');
    expect(STATUS_BADGE_VARIANTS).toHaveProperty('DIVISION');
    expect(STATUS_BADGE_VARIANTS).toHaveProperty('WITHDRAWAL');
    expect(STATUS_BADGE_VARIANTS).toHaveProperty('MATCH');
    expect(STATUS_BADGE_VARIANTS).toHaveProperty('INVITATION');
    expect(STATUS_BADGE_VARIANTS).toHaveProperty('DISPUTE');
  });
});

describe('STATUS_BADGE_COLORS', () => {
  it('should have entries for all entity types', () => {
    expect(STATUS_BADGE_COLORS).toHaveProperty('SEASON');
    expect(STATUS_BADGE_COLORS).toHaveProperty('LEAGUE');
    expect(STATUS_BADGE_COLORS).toHaveProperty('ADMIN');
    expect(STATUS_BADGE_COLORS).toHaveProperty('DIVISION');
    expect(STATUS_BADGE_COLORS).toHaveProperty('WITHDRAWAL');
    expect(STATUS_BADGE_COLORS).toHaveProperty('MATCH');
    expect(STATUS_BADGE_COLORS).toHaveProperty('INVITATION');
    expect(STATUS_BADGE_COLORS).toHaveProperty('DISPUTE');
  });
});
