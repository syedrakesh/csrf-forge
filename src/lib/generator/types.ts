import { PocFormat } from '../../types';

export interface PreflightPayloadOption {
  enabled: boolean;
  url: string;
  triggerMode?: 'onerror' | 'onload' | 'fetch';
}

export interface PocGeneratorOptions {
  format: PocFormat;
  autoSubmit?: boolean;
  stealthIframe?: boolean;
  delayMs?: number;
  buttonText?: string;
  comments?: boolean;
  customParameters?: Record<string, string>;
  preflight?: PreflightPayloadOption;
}

export function extractPreflightUrl(input: string): string {
  const trimmed = input.trim();
  const match = trimmed.match(/src=["']([^"']+)["']/i);
  if (match && match[1]) {
    return match[1];
  }
  return trimmed;
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
