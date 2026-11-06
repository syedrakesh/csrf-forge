import { Severity } from '../../types';

export interface RiskMetrics {
  score: number; // 0.0 to 10.0
  severity: Severity;
  label: 'CRITICAL RISK' | 'HIGH RISK' | 'MEDIUM RISK' | 'LOW RISK' | 'SECURE';
  summary: string;
}

/**
 * Calculates overall risk score based on individual weighted finding severities
 */
export function calculateRiskScore(severities: Severity[]): RiskMetrics {
  if (severities.length === 0) {
    return {
      score: 0.0,
      severity: 'info',
      label: 'SECURE',
      summary: 'No CSRF vulnerability indicators detected.',
    };
  }

  const weights: Record<Severity, number> = {
    critical: 9.5,
    high: 7.5,
    medium: 5.0,
    low: 2.5,
    info: 0.5,
  };

  let maxScore = 0;
  let accumulated = 0;

  for (const s of severities) {
    const w = weights[s] ?? 0;
    if (w > maxScore) maxScore = w;
    accumulated += w * 0.15;
  }

  // Combined score capped at 10.0
  const finalScore = Math.min(10.0, Number((maxScore + accumulated * 0.4).toFixed(1)));

  let severity: Severity = 'low';
  let label: RiskMetrics['label'] = 'LOW RISK';

  if (finalScore >= 8.5) {
    severity = 'critical';
    label = 'CRITICAL RISK';
  } else if (finalScore >= 6.5) {
    severity = 'high';
    label = 'HIGH RISK';
  } else if (finalScore >= 4.0) {
    severity = 'medium';
    label = 'MEDIUM RISK';
  } else if (finalScore > 1.0) {
    severity = 'low';
    label = 'LOW RISK';
  } else {
    severity = 'info';
    label = 'SECURE';
  }

  return {
    score: finalScore,
    severity,
    label,
    summary:
      severity === 'critical' || severity === 'high'
        ? 'High probability of exploitable Cross-Site Request Forgery. Immediate remediation recommended.'
        : severity === 'medium'
        ? 'Potential vulnerability depending on cross-origin environment and browser policies.'
        : 'Low exploitability or request utilizes protective defense headers.',
  };
}
