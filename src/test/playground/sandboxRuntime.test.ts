import { describe, it, expect } from 'vitest';
import { instrumentPocForSandbox } from '../../lib/playground/sandboxRuntime';

describe('Sandbox Runtime Instrumentation', () => {
  it('injects instrumentation script after <head>', () => {
    const raw = `<!DOCTYPE html><html><head><title>Test</title></head><body>Hello</body></html>`;
    const instrumented = instrumentPocForSandbox(raw);

    expect(instrumented).toContain('csrf-forge-sandbox');
    expect(instrumented).toContain('HTMLFormElement.prototype.submit');
    expect(instrumented).toContain('window.parent.postMessage');
  });

  it('injects inside <html> if no <head> exists', () => {
    const raw = `<html><body><form id="f"></form></body></html>`;
    const instrumented = instrumentPocForSandbox(raw);

    expect(instrumented).toContain('<head>');
    expect(instrumented).toContain('csrf-forge-sandbox');
  });

  it('prepends script if neither <html> nor <head> exist', () => {
    const raw = `<form action="http://target.com"></form>`;
    const instrumented = instrumentPocForSandbox(raw);

    expect(instrumented).toContain('csrf-forge-sandbox');
    expect(instrumented).toContain('<form action="http://target.com"></form>');
  });
});
