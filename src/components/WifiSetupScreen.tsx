import React, { useState } from 'react';
import { Wifi, ArrowRight, ArrowLeft, Smartphone, AlertCircle, ShieldCheck } from 'lucide-react';
import { BoardType } from '../types';

interface Props {
  deviceId: string;
  board: BoardType;
  onConnect: (ssid: string, pass: string) => void;
  onCancel: () => void;
}

export const WifiSetupScreen: React.FC<Props> = ({ deviceId, board, onConnect, onCancel }) => {
  const [ssid, setSsid] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ssid.trim()) {
      setError('Please enter your phone hotspot SSID.');
      return;
    }
    setError(null);
    onConnect(ssid.trim(), password);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-6">
      <div className="flex items-center justify-between">
        <button
          onClick={onCancel}
          className="text-xs text-slate-400 hover:text-white flex items-center space-x-1 p-2 bg-slate-900 rounded-lg border border-slate-800"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
        <span className="text-[10px] font-mono px-2 py-0.5 bg-blue-500/10 text-blue-300 rounded border border-blue-500/20">
          {board}
        </span>
      </div>

      <div className="text-center space-y-1">
        <h2 className="text-xl font-bold text-white">Phone Hotspot Provisioning</h2>
        <p className="text-xs text-slate-400">Turn ON your phone hotspot, then enter credentials below.</p>
      </div>

      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
        <div className="p-3 bg-blue-500/10 border border-blue-500/25 rounded-xl flex items-start space-x-2.5 text-xs text-blue-200">
          <Smartphone className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            Android security prevents apps from reading hotspot passwords automatically. Please check your phone settings and enter the exact Hotspot SSID and Password.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center space-x-2 text-xs text-red-300">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300 flex items-center">
              <Wifi className="w-3.5 h-3.5 mr-1.5 text-indigo-400" />
              Hotspot Name (SSID)
            </label>
            <input
              type="text"
              value={ssid}
              onChange={(e) => setSsid(e.target.value)}
              placeholder="e.g. MyPhone_Hotspot"
              className="w-full bg-slate-850 border border-slate-750 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300 flex items-center">
              <ShieldCheck className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
              Hotspot Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-850 border border-slate-750 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-blue-600/30 transition flex items-center justify-center space-x-2 mt-2"
          >
            <span>Send Credentials to ESP32</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>

      <div className="text-[11px] text-slate-500 text-center font-mono">
        Target: <span className="text-slate-300">{deviceId}</span>
      </div>
    </div>
  );
};
