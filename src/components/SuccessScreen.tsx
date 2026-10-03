import React from 'react';
import { CheckCircle2, Wifi, ShieldCheck, ArrowRight, Cpu, Globe } from 'lucide-react';
import { BoardType, EvaDevice } from '../types';

interface Props {
  device: EvaDevice;
  onContinue: () => void;
}

export const SuccessScreen: React.FC<Props> = ({ device, onContinue }) => {
  return (
    <div className="space-y-6 text-center py-4 animate-fadeIn">
      <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl mx-auto flex items-center justify-center shadow-xl shadow-emerald-500/30 text-white animate-bounce">
        <CheckCircle2 className="w-10 h-10" />
      </div>

      <div>
        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 uppercase">
          Pairing Successful
        </span>
        <h2 className="text-2xl font-bold text-white mt-2">🎉 EVA Connected!</h2>
        <p className="text-xs text-slate-400 mt-1">Your ESP32 assistant is online and linked to the backend.</p>
      </div>

      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 text-left space-y-3.5 shadow-xl max-w-sm mx-auto">
        <div className="flex justify-between items-center pb-2.5 border-b border-slate-800 text-xs">
          <span className="text-slate-400 flex items-center">
            <Cpu className="w-4 h-4 mr-2 text-indigo-400" />
            Device ID
          </span>
          <span className="font-bold text-white font-mono">{device.device_id}</span>
        </div>

        <div className="flex justify-between items-center pb-2.5 border-b border-slate-800 text-xs">
          <span className="text-slate-400 flex items-center">
            <Globe className="w-4 h-4 mr-2 text-indigo-400" />
            Board Variant
          </span>
          <span className="font-semibold text-slate-200">{device.board}</span>
        </div>

        <div className="flex justify-between items-center pb-2.5 border-b border-slate-800 text-xs">
          <span className="text-slate-400 flex items-center">
            <Wifi className="w-4 h-4 mr-2 text-emerald-400" />
            Wi-Fi SSID
          </span>
          <span className="font-semibold text-slate-200">{device.ssid}</span>
        </div>

        <div className="flex justify-between items-center pb-2.5 border-b border-slate-800 text-xs">
          <span className="text-slate-400">IP Address</span>
          <span className="font-mono text-indigo-300 font-medium">{device.ip}</span>
        </div>

        <div className="flex justify-between items-center text-xs">
          <span className="text-slate-400">Backend Status</span>
          <span className="flex items-center text-emerald-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 mr-1.5 animate-pulse"></span>
            Connected
          </span>
        </div>
      </div>

      <button
        onClick={onContinue}
        className="w-full max-w-sm mx-auto py-3.5 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium rounded-xl shadow-lg shadow-indigo-600/30 transition flex items-center justify-center space-x-2 text-sm cursor-pointer"
      >
        <span>Open EVA Control Panel</span>
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
};
