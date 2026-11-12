import { ParsedRequest, GeneratedPoc, PocFormat } from '../../types';
import { PocGeneratorOptions } from './types';
import { generateHtmlFormPoc } from './htmlFormGenerator';
import { generateFetchPoc, generateXhrPoc } from './fetchXhrGenerator';
import { generateImageBeaconPoc } from './imageBeaconGenerator';
import { generatePythonScriptPoc } from './pythonScriptGenerator';
import { generateJsonCsrfPoc } from './jsonCsrfGenerator';
import { generateWebSocketCsrfPoc } from './websocketGenerator';
import { generateNavigationPoc } from './navigationGenerator';

/**
 * Compiles a CSRF Proof-of-Concept based on format and user options.
 */
export function compilePoc(
  request: ParsedRequest,
  format: PocFormat | 'html-xhr' | 'json-trick',
  options: Partial<PocGeneratorOptions> = {}
): GeneratedPoc {
  let code = '';
  let description = '';

  switch (format) {
    case 'html-form':
      code = generateHtmlFormPoc(request, options);
      description = 'Standard HTML form with automatic submission and hidden inputs';
      break;

    case 'html-navigation':
      code = generateNavigationPoc(request, options);
      description = 'Top-level window.location navigation payload (SameSite=Lax bypass)';
      break;

    case 'html-fetch':
      code = generateFetchPoc(request, options);
      description = 'Asynchronous Fetch API payload with credentials: "include"';
      break;

    case 'html-ajax':
    case 'html-xhr':
      code = generateXhrPoc(request, options);
      description = 'XMLHttpRequest payload with withCredentials = true';
      break;

    case 'html-img':
      code = generateImageBeaconPoc(request, options);
      description = 'Zero-interaction <img> beacon for GET state-changing endpoints';
      break;

    case 'python':
      code = generatePythonScriptPoc(request, options);
      description = 'Standalone Python 3 regression test script using requests';
      break;

    case 'json-trick':
      code = generateJsonCsrfPoc(request, options);
      description = 'JSON CSRF bypass using enctype="text/plain" form trick';
      break;

    case 'websocket':
      code = generateWebSocketCsrfPoc(request, options);
      description = 'Cross-Site WebSocket Hijacking (CSWSH) connection payload';
      break;

    default:
      code = generateHtmlFormPoc(request, options);
      description = 'Auto-submitting HTML form';
      break;
  }

  return {
    id: `poc_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    requestId: request.id,
    format: format as PocFormat,
    code,
    description,
    timestamp: Date.now(),
  };
}
