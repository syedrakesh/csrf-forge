import { ReportData, ReportOptions } from './types';
import { DEFAULT_REPORT_OPTIONS } from './markdownReport';
import { Severity } from '../../types';

function mapSeverityToSarifLevel(sev: Severity): 'error' | 'warning' | 'note' | 'none' {
  switch (sev) {
    case 'critical':
    case 'high':
      return 'error';
    case 'medium':
      return 'warning';
    case 'low':
      return 'note';
    case 'info':
    default:
      return 'none';
  }
}

/**
 * Generates an OASIS SARIF v2.1.0 report compliant with GitHub Code Scanning
 * and static application security testing (SAST) engines.
 */
export function generateSarifReport(
  data: ReportData,
  options: Partial<ReportOptions> = {}
): string {
  const opts: ReportOptions = { ...DEFAULT_REPORT_OPTIONS, ...options };
  const { request, analysis, riskMetrics } = data;

  const rules = analysis.findings.map((f) => ({
    id: f.id,
    name: f.title.replace(/[^a-zA-Z0-9]/g, ''),
    shortDescription: {
      text: f.title,
    },
    fullDescription: {
      text: f.description,
    },
    defaultConfiguration: {
      level: mapSeverityToSarifLevel(f.severity),
    },
    help: {
      text: opts.includeRemediations && f.recommendation ? f.recommendation : f.description,
    },
    properties: {
      category: f.category,
      precision: 'very-high',
      tags: ['security', 'cwe-352', 'csrf', 'broken-access-control'],
    },
  }));

  const results = analysis.findings.map((f) => ({
    ruleId: f.id,
    level: mapSeverityToSarifLevel(f.severity),
    message: {
      text: `${f.title}: ${f.description}`,
    },
    locations: [
      {
        physicalLocation: {
          artifactLocation: {
            uri: request.url,
          },
          region: {
            startLine: 1,
            startColumn: 1,
          },
        },
      },
    ],
    properties: {
      severity: f.severity,
      cvssScore: riskMetrics.score,
      targetMethod: request.method,
      recommendation: opts.includeRemediations ? f.recommendation : undefined,
    },
  }));

  const sarif = {
    $schema:
      'https://raw.githubusercontent.com/oasis-tcs/sarif-spec/master/Schemata/sarif-schema-2.1.0.json',
    version: '2.1.0',
    runs: [
      {
        tool: {
          driver: {
            name: 'CSRF Forge',
            version: '1.0.0',
            informationUri: 'https://syedrakesh.github.io/csrf-forge/',
            rules,
          },
        },
        results,
        invocations: [
          {
            executionSuccessful: true,
            endTimeUtc: new Date().toISOString(),
          },
        ],
      },
    ],
  };

  return JSON.stringify(sarif, null, 2);
}

