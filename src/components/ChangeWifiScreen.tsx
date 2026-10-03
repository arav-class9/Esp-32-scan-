import React, { useState } from 'react';
import { Wifi, Lock, Eye, EyeOff, ArrowRight, ArrowLeft } from 'lucide-react';
import { BoardType } from '../types';

interface Props {
  deviceId: string;
  board: BoardType;
  currentSsid: string;
  onUpdateWifi: (ssid: string, pass: string) => void;
  onCancel: () => void;
}

export const ChangeWifiScreen: React.FC<Props> = ({ deviceId, board, currentSsid, onUpdateWifi, onCancel }) => {
  const [ssid, setSsid] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ssid.trim()) {
      setError('Please enter the new Wi-Fi name.');
      return;
    }
    setError('');
    onUpdateWifi(ssid.trim(), password);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 animate-fadeIn pb-6">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onCancel}
          className="text-xs text-slate-400 hover:text-white flex items-center space-x-1 p-2 bg-slate-900 rounded-lg border border-slate-800"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
        <span className="text-xs font-mono text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20">
          {deviceId}
        </span>
      </div>

      <div className="text-center pt-2">
        <h2 className="text-xl font-bold text-white">Change Wi-Fi Network</h2>
        <p className="text-xs text-slate-400 mt-1">Currently connected to: <span className="text-slate-200 font-medium">{currentSsid || 'None'}</span></p>
      </div>

      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-300">
            {error}
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-300 block">New Wi-Fi / Hotspot Name</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
              <Wifi className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={ssid}
              onChange={(e) => setSsid(e.target.value)}
              placeholder="Enter new SSID"
              className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-indigo-500 transition"
              required
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-300 block">New Wi-Fi Password</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
              <Lock className="w-4 h-4" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="w-full pl-10 pr-10 py-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-indigo-500 transition"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      <div className="flex space-x-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-3 bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-medium rounded-xl border border-slate-700 transition"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-indigo-600/30 transition flex items-center justify-center space-x-1.5"
        >
          <span>Update Wi-Fi</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </form>
  );
};
