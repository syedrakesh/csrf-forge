import { describe, it, expect } from 'vitest';
import { generateWebSocketCsrfPoc } from '../../lib/generator/websocketGenerator';
import { compilePoc } from '../../lib/generator/pocCompiler';
import { ParsedRequest } from '../../types';

describe('WebSocket CSRF (CSWSH) Generator', () => {
  const req: ParsedRequest = {
    id: 'ws-req',
    method: 'GET',
    url: 'https://chat.target.internal/ws/feed',
    headers: {
      Host: 'chat.target.internal',
      Upgrade: 'websocket',
      Connection: 'Upgrade',
      Cookie: 'session=auth_token_456',
    },
    body: '{"action": "subscribe", "channel": "internal_finances"}',
    contentType: 'application/json',
    cookies: { session: 'auth_token_456' },
    timestamp: Date.now(),
  };

  it('converts https URL to wss URL protocol and creates socket connection', () => {
    const code = generateWebSocketCsrfPoc(req);

    expect(code).toContain('const targetWsUrl = "wss://chat.target.internal/ws/feed";');
    expect(code).toContain('new WebSocket(targetWsUrl)');
    expect(code).toContain('Cross-Site WebSocket Hijacking');
    expect(code).toContain('ws.onopen');
    expect(code).toContain('ws.onmessage');
    expect(code).toContain('subscribe');
  });

  it('is compiled properly via compilePoc dispatcher', () => {
    const poc = compilePoc(req, 'websocket');

    expect(poc.format).toBe('websocket');
    expect(poc.code).toContain('wss://chat.target.internal/ws/feed');
    expect(poc.description).toContain('Cross-Site WebSocket Hijacking');
  });
});
