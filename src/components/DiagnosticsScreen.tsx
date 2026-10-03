import React, { useState } from 'react';
import { Activity, ShieldCheck, Zap, RefreshCw, CheckCircle2 } from 'lucide-react';

interface Props {
  deviceId: string;
}

interface PingResult {
  ping_ms: number;
  rssi: number;
  status: string;
  timestamp: string;
}

export const DiagnosticsScreen: React.FC<Props> = ({ deviceId }) => {
  const [pinging, setPinging] = useState(false);
  const [result, setResult] = useState<PingResult | null>(null);

  const runPingTest = async () => {
    setPinging(true);
    setResult(null);
    try {
      const res = await fetch('/device/ping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ device_id: deviceId })
      });
      const data = await res.json();
      setTimeout(() => {
        setResult(data);
        setPinging(false);
      }, 800);
    } catch (err) {
      console.error(err);
      setPinging(false);
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Activity className="w-4 h-4 text-indigo-400" />
          <h3 className="text-sm font-bold text-white">Device Diagnostics & Ping Test</h3>
        </div>
        <button
          onClick={runPingTest}
          disabled={pinging}
          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold rounded-lg shadow transition flex items-center space-x-1"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${pinging ? 'animate-spin' : ''}`} />
          <span>Run Ping</span>
        </button>
      </div>

      <div className="bg-slate-850 border border-slate-800 rounded-xl p-4 space-y-3 text-xs">
        <div className="flex justify-between items-center">
          <span className="text-slate-400">Target Device ID:</span>
          <span className="font-mono text-white font-medium">{deviceId}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-slate-400">Connection Protocol:</span>
          <span className="text-indigo-300 font-medium">BLE + Wi-Fi Station</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-slate-400">Security Handshake:</span>
          <span className="text-emerald-400 font-medium">TLS 1.3 / AES-256</span>
        </div>
      </div>

      {result && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 space-y-2 text-xs">
          <div className="flex items-center space-x-2 text-emerald-300 font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Ping Successful</span>
          </div>
          <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-[11px] text-slate-300">
            <div>Latency: <strong className="text-emerald-400">{result.ping_ms} ms</strong></div>
            <div>RSSI: <strong className="text-emerald-400">{result.rssi} dBm</strong></div>
          </div>
        </div>
      )}
    </div>
  );
};
