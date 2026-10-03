import React from 'react';
import { Cpu, Plus, Wifi, Settings, Sparkles, Activity, ShieldCheck, ArrowRight, RefreshCw } from 'lucide-react';
import { EvaDevice } from '../types';

interface Props {
  device: EvaDevice | null;
  onAddDevice: () => void;
  onOpenDevice: () => void;
  onOpenSettings: () => void;
  onReset: () => void;
}

export const HomeScreen: React.FC<Props> = ({
  device,
  onAddDevice,
  onOpenDevice,
  onOpenSettings,
  onReset
}) => {
  return (
    <div className="space-y-6 animate-fadeIn pb-6">
      {/* Hero Branding */}
      <div className="text-center pt-4 pb-2">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-600 shadow-xl shadow-indigo-500/20 mb-4 relative group">
          <Cpu className="w-10 h-10 text-white animate-pulse" />
          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full border-2 border-slate-950 flex items-center justify-center">
            <span className="w-2 h-2 bg-white rounded-full animate-ping"></span>
          </div>
        </div>
        <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-indigo-300 bg-clip-text text-transparent">
          EVA Device Setup
        </h1>
        <p className="text-sm text-slate-400 mt-1">Your Physical AI Assistant</p>
      </div>

      {/* Main Content Area */}
      {!device || device.status === 'provisioning' ? (
        <div className="bg-slate-900/80 backdrop-blur border border-slate-800/80 rounded-2xl p-6 text-center space-y-4 shadow-xl">
          <div className="w-12 h-12 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-center justify-center mx-auto text-indigo-400">
            <Wifi className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-100">No EVA Device Configured</h2>
            <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
              Connect your ESP32 WROOM, S3, or C3 Mini hardware to Wi-Fi and pair with the EVA backend.
            </p>
          </div>
          <button
            onClick={onAddDevice}
            className="w-full py-3.5 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center space-x-2 text-sm group cursor-pointer"
          >
            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
            <span>Add EVA Device</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-slate-900 to-slate-900/90 border border-indigo-500/30 rounded-2xl p-5 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none"></div>

            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="text-[10px] font-mono tracking-wider text-indigo-400 uppercase bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20">
                  {device.board}
                </span>
                <h3 className="text-lg font-bold text-white mt-2 flex items-center space-x-2">
                  <span>{device.device_id}</span>
                </h3>
              </div>
              <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Online</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 py-3 border-y border-slate-800 text-xs">
              <div>
                <span className="text-slate-500 block">Wi-Fi SSID</span>
                <span className="font-medium text-slate-200 flex items-center mt-0.5">
                  <Wifi className="w-3.5 h-3.5 mr-1.5 text-indigo-400" />
                  {device.ssid || 'Not Connected'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">IP Address</span>
                <span className="font-medium text-slate-200 font-mono mt-0.5">
                  {device.ip || '0.0.0.0'}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4">
              <span className="text-xs text-slate-400 flex items-center">
                <ShieldCheck className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                Backend Synced
              </span>
              <div className="flex space-x-2">
                <button
                  onClick={onOpenSettings}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-medium rounded-lg transition border border-slate-700 flex items-center space-x-1"
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>Settings</span>
                </button>
                <button
                  onClick={onOpenDevice}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-lg transition shadow-md shadow-indigo-600/30 flex items-center space-x-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Open EVA</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center px-1">
            <button
              onClick={onAddDevice}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center space-x-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Pair Another ESP32 Device</span>
            </button>
            <button
              onClick={onReset}
              className="text-xs text-slate-500 hover:text-red-400 transition"
            >
              Reset All
            </button>
          </div>
        </div>
      )}

      {/* Quick Info Box */}
      <div className="bg-slate-900/50 border border-slate-800/80 rounded-xl p-4 space-y-2">
        <div className="flex items-center space-x-2 text-xs font-semibold text-slate-300">
          <Activity className="w-4 h-4 text-purple-400" />
          <span>Supported ESP32 Hardware</span>
        </div>
        <div className="grid grid-cols-3 gap-2 pt-1 text-center">
          <div className="bg-slate-850 p-2 rounded-lg border border-slate-800">
            <span className="text-[11px] font-bold text-slate-200 block">WROOM</span>
            <span className="text-[10px] text-slate-400">DevKit V1</span>
          </div>
          <div className="bg-slate-850 p-2 rounded-lg border border-slate-800">
            <span className="text-[11px] font-bold text-slate-200 block">ESP32-S3</span>
            <span className="text-[10px] text-slate-400">AI / Cam</span>
          </div>
          <div className="bg-slate-850 p-2 rounded-lg border border-slate-800">
            <span className="text-[11px] font-bold text-slate-200 block">C3 Mini</span>
            <span className="text-[10px] text-slate-400">Compact</span>
          </div>
        </div>
      </div>
    </div>
  );
};
