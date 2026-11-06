import { PocFormat } from '../../types';

export interface PocGeneratorOptions {
  format: PocFormat;
  autoSubmit?: boolean;
  stealthIframe?: boolean;
  delayMs?: number;
  buttonText?: string;
  comments?: boolean;
  customParameters?: Record<string, string>;
}

export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function escapeJsString(str: string): string {
  return JSON.stringify(str);
}
