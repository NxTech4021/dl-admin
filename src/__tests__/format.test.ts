import { describe, it, expect } from 'vitest';
import {
  formatValue,
  formatCurrency,
  formatPercentage,
  formatNumber,
  CHART_CONSTANTS,
} from '@/lib/utils/format';

describe('formatValue', () => {
  describe('number format', () => {
    it('should format numbers with thousand separators', () => {
      expect(formatValue(1284, 'number')).toBe('1,284');
    });

    it('should format zero', () => {
      expect(formatValue(0, 'number')).toBe('0');
    });

    it('should format large numbers', () => {
      expect(formatValue(1000000, 'number')).toBe('1,000,000');
    });

    it('should parse string values', () => {
      expect(formatValue('1500', 'number')).toBe('1,500');
    });

    it('should default to number format', () => {
      expect(formatValue(1500)).toBe('1,500');
    });

    it('should return "0" for NaN number input', () => {
      expect(formatValue('not-a-number', 'number')).toBe('0');
    });
  });

  describe('currency format', () => {
    it('should format currency with RM prefix', () => {
      const result = formatValue(1500, 'currency');
      expect(result).toContain('RM');
      expect(result).toContain('1,500');
    });

    it('should format zero currency', () => {
      const result = formatValue(0, 'currency');
      expect(result).toContain('RM');
      expect(result).toContain('0');
    });

    it('should format with no decimals', () => {
      const result = formatValue(1500.75, 'currency');
      // maximumFractionDigits: 0 means no decimals, rounds to 1,501
      expect(result).toContain('RM');
      expect(result).not.toContain('.');
    });

    it('should parse string values for currency', () => {
      const result = formatValue('2500', 'currency');
      expect(result).toContain('RM');
      expect(result).toContain('2,500');
    });

    it('should return "RM0" for NaN currency input', () => {
      expect(formatValue('invalid', 'currency')).toBe('RM0');
    });
  });

  describe('percentage format', () => {
    it('should format percentage with one decimal place', () => {
      expect(formatValue(46.5, 'percentage')).toBe('46.5%');
    });

    it('should format zero percentage', () => {
      expect(formatValue(0, 'percentage')).toBe('0.0%');
    });

    it('should format 100 percent', () => {
      expect(formatValue(100, 'percentage')).toBe('100.0%');
    });

    it('should round to one decimal place', () => {
      expect(formatValue(33.333, 'percentage')).toBe('33.3%');
    });

    it('should parse string values for percentage', () => {
      expect(formatValue('75.5', 'percentage')).toBe('75.5%');
    });

    it('should return "0.0%" for NaN percentage input', () => {
      expect(formatValue('invalid', 'percentage')).toBe('0.0%');
    });
  });
});

describe('formatCurrency', () => {
  it('should format currency using formatValue', () => {
    const result = formatCurrency(1500);
    expect(result).toContain('RM');
    expect(result).toContain('1,500');
  });

  it('should handle zero', () => {
    const result = formatCurrency(0);
    expect(result).toContain('RM');
    expect(result).toContain('0');
  });

  it('should handle negative values', () => {
    const result = formatCurrency(-500);
    expect(result).toContain('RM');
    expect(result).toContain('500');
  });
});

describe('formatPercentage', () => {
  it('should format percentage with one decimal', () => {
    expect(formatPercentage(46.5)).toBe('46.5%');
  });

  it('should handle whole numbers', () => {
    expect(formatPercentage(50)).toBe('50.0%');
  });

  it('should handle zero', () => {
    expect(formatPercentage(0)).toBe('0.0%');
  });
});

describe('formatNumber', () => {
  it('should format number with thousand separators', () => {
    expect(formatNumber(1284)).toBe('1,284');
  });

  it('should handle zero', () => {
    expect(formatNumber(0)).toBe('0');
  });

  it('should handle small numbers', () => {
    expect(formatNumber(42)).toBe('42');
  });
});

describe('CHART_CONSTANTS', () => {
  it('should have correct WEEKS_PER_MONTH value', () => {
    expect(CHART_CONSTANTS.WEEKS_PER_MONTH).toBe(4.3);
  });

  it('should have correct Y_AXIS_PADDING value', () => {
    expect(CHART_CONSTANTS.Y_AXIS_PADDING).toBe(1.1);
  });

  it('should have correct CHART_MARGIN value', () => {
    expect(CHART_CONSTANTS.CHART_MARGIN).toBe(12);
  });

  it('should have correct Y_AXIS_OFFSET value', () => {
    expect(CHART_CONSTANTS.Y_AXIS_OFFSET).toBe(10);
  });
});
