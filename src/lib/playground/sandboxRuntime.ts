export interface PlaygroundLogEvent {
  id: string;
  type: 'form-submit' | 'network-call' | 'console' | 'error' | 'system';
  message: string;
  details?: Record<string, unknown> | string;
  timestamp: number;
}

/**
 * Instruments raw PoC HTML to intercept actions (form submissions, fetch, XHR, console)
 * and safely postMessage telemetry back to the parent window.
 */
export function instrumentPocForSandbox(rawHtml: string): string {
  const instrumentationScript = `
    <script>
      (function() {
        function emit(type, message, details) {
          try {
            window.parent.postMessage({
              source: 'csrf-forge-sandbox',
              type: type,
              message: message,
              details: details || null,
              timestamp: Date.now()
            }, '*');
          } catch(e) {}
        }

        emit('system', 'Sandbox runtime initialized with strict isolation.');

        // Intercept form submissions
        document.addEventListener('submit', function(e) {
          var form = e.target;
          var formData = {};
          if (window.FormData && form instanceof HTMLFormElement) {
            try {
              var fd = new FormData(form);
              fd.forEach(function(val, key) {
                formData[key] = val;
              });
            } catch(err) {}
          }

          emit('form-submit', 'Form submission dispatched to ' + (form.action || window.location.href), {
            action: form.action,
            method: form.method || 'GET',
            fields: formData
          });
        }, true);

        // Intercept programmatic form.submit()
        var originalSubmit = HTMLFormElement.prototype.submit;
        HTMLFormElement.prototype.submit = function() {
          var form = this;
          var formData = {};
          if (window.FormData) {
            try {
              var fd = new FormData(form);
              fd.forEach(function(val, key) {
                formData[key] = val;
              });
            } catch(err) {}
          }

          emit('form-submit', 'Programmatic form.submit() called for ' + (form.action || 'target'), {
            action: form.action,
            method: form.method || 'GET',
            fields: formData
          });

          return originalSubmit.apply(this, arguments);
        };

        // Intercept fetch
        if (window.fetch) {
          var originalFetch = window.fetch;
          window.fetch = function(input, init) {
            var url = typeof input === 'string' ? input : (input && input.url ? input.url : 'unknown');
            var method = (init && init.method) || 'GET';
            emit('network-call', 'fetch() called: ' + method + ' ' + url, {
              url: url,
              method: method,
              credentials: init && init.credentials
            });
            return originalFetch.apply(this, arguments);
          };
        }

        // Intercept console.log
        var originalLog = console.log;
        console.log = function() {
          var msg = Array.prototype.slice.call(arguments).join(' ');
          emit('console', msg);
          if (originalLog) originalLog.apply(console, arguments);
        };

        // Global error listener
        window.addEventListener('error', function(e) {
          emit('error', 'Runtime Script Error: ' + (e.message || 'Unknown error'));
        });
      })();
    </script>
  `;

  // Inject right after <head> or at the beginning of <html>
  if (rawHtml.includes('<head>')) {
    return rawHtml.replace('<head>', '<head>' + instrumentationScript);
  } else if (rawHtml.includes('<html>')) {
    return rawHtml.replace('<html>', '<html><head>' + instrumentationScript + '</head>');
  } else {
    return instrumentationScript + rawHtml;
  }
}
