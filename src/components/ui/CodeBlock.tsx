import React, { useState } from 'react';
import { Copy, Check, Terminal } from 'lucide-react';

export interface CodeBlockProps {
  code: string;
  language?: string;
  title?: string;
  showLineNumbers?: boolean;
  maxHeight?: string;
  className?: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({
  code,
  language = 'html',
  title,
  showLineNumbers = false,
  maxHeight = '400px',
  className = '',
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const textarea = document.createElement('textarea');
      textarea.value = code;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const lines = code.split('\n');

  return (
    <div className={`rounded-lg border border-dark-800 bg-dark-950 overflow-hidden text-sm font-mono ${className}`}>
      <div className="flex items-center justify-between px-4 py-2 border-b border-dark-800 bg-dark-900/60 text-xs text-dark-400">
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-cyber-400" />
          <span className="font-semibold text-dark-200">{title || language.toUpperCase()}</span>
        </div>
        <button
          onClick={handleCopy}
          aria-label={copied ? 'Code copied' : 'Copy code to clipboard'}
          className="flex items-center gap-1.5 px-2 py-1 rounded text-xs text-dark-300 hover:text-cyber-400 hover:bg-dark-800 transition-colors"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-cyber-400" />
              <span className="text-cyber-400">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      <div
        className="p-4 overflow-x-auto text-dark-200 select-text font-mono text-xs leading-relaxed"
        style={{ maxHeight }}
      >
        {showLineNumbers ? (
          <table className="w-full border-collapse">
            <tbody>
              {lines.map((line, index) => (
                <tr key={index} className="hover:bg-dark-900/40">
                  <td className="pr-4 text-right text-dark-600 select-none w-8 align-top">
                    {index + 1}
                  </td>
                  <td className="whitespace-pre align-top">{line}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <pre className="whitespace-pre">{code}</pre>
        )}
      </div>
    </div>
  );
};
