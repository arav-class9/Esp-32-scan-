import React, { useState } from 'react';
import { Terminal, ChevronDown, ChevronUp, Copy, Check, Radio } from 'lucide-react';
import { ProtocolLog } from '../types';

interface Props {
  logs: ProtocolLog[];
  onClear: () => void;
}

export const ProtocolDebugger: React.FC<Props> = ({ logs, onClear }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (id: string, payload: any) => {
    navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-3 bg-slate-850 flex items-center justify-between cursor-pointer hover:bg-slate-855 transition"
      >
        <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400">
          <Terminal className="w-4 h-4 text-cyan-400 animate-pulse" />
          <span>ESP32 JSON Protocol Monitor ({logs.length} messages)</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 animate-ping"></span>
            Live Serial Bus
          </span>
          {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </div>
      </div>

      {isOpen && (
        <div className="p-4 bg-slate-950 font-mono text-xs max-h-64 overflow-y-auto space-y-3">
          <div className="flex justify-between items-center pb-2 border-b border-slate-800">
            <span className="text-slate-500 text-[10px]">Real-time bi-directional JSON UART / Wi-Fi packets</span>
            <button 
              onClick={(e) => { e.stopPropagation(); onClear(); }}
              className="text-[10px] text-slate-400 hover:text-red-400 px-2 py-1 bg-slate-900 rounded border border-slate-800"
            >
              Clear Logs
            </button>
          </div>

          {logs.length === 0 ? (
            <div className="text-center py-6 text-slate-600">
              No protocol packets logged yet. Connect or send commands to inspect JSON frames.
            </div>
          ) : (
            logs.map((log) => (
              <div 
                key={log.id} 
                className={`p-3 rounded-lg border ${
                  log.direction === 'APP_TO_ESP32' 
                    ? 'bg-blue-950/20 border-blue-900/40 text-blue-200' 
                    : 'bg-emerald-950/20 border-emerald-900/40 text-emerald-200'
                }`}
              >
                <div className="flex justify-between items-center mb-1 text-[10px]">
                  <span className="flex items-center space-x-1 font-bold">
                    <Radio className="w-3 h-3 mr-1" />
                    {log.direction === 'APP_TO_ESP32' ? 'APP → ESP32' : 'ESP32 → APP'}
                  </span>
                  <div className="flex items-center space-x-2">
                    <span className="text-slate-500">{log.timestamp}</span>
                    <button 
                      onClick={() => handleCopy(log.id, log.payload)}
                      className="text-slate-400 hover:text-white p-1"
                      title="Copy JSON"
                    >
                      {copiedId === log.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                </div>
                <pre className="overflow-x-auto text-[11px] text-slate-300 bg-slate-900/80 p-2 rounded border border-slate-800/80">
                  {JSON.stringify(log.payload, null, 2)}
                </pre>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
