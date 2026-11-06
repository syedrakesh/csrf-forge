import { describe, it, expect } from 'vitest';
import { calculateRiskScore } from '../../lib/analyzer/riskScorer';

describe('Risk Scorer (riskScorer.ts)', () => {
  it('returns SECURE / 0.0 when no findings exist', () => {
    const res = calculateRiskScore([]);
    expect(res.score).toBe(0.0);
    expect(res.severity).toBe('info');
    expect(res.label).toBe('SECURE');
  });

  it('calculates CRITICAL severity when critical finding is present', () => {
    const res = calculateRiskScore(['critical', 'high', 'medium']);
    expect(res.score).toBeGreaterThanOrEqual(8.5);
    expect(res.severity).toBe('critical');
    expect(res.label).toBe('CRITICAL RISK');
  });

  it('calculates HIGH severity when highest finding is high', () => {
    const res = calculateRiskScore(['high', 'medium']);
    expect(res.score).toBeGreaterThanOrEqual(6.5);
    expect(res.severity).toBe('high');
    expect(res.label).toBe('HIGH RISK');
  });

  it('calculates MEDIUM severity when highest finding is medium', () => {
    const res = calculateRiskScore(['medium']);
    expect(res.score).toBeGreaterThanOrEqual(4.0);
    expect(res.severity).toBe('medium');
    expect(res.label).toBe('MEDIUM RISK');
  });

  it('caps the final score at 10.0', () => {
    const res = calculateRiskScore(['critical', 'critical', 'critical', 'critical']);
    expect(res.score).toBeLessThanOrEqual(10.0);
  });
});
