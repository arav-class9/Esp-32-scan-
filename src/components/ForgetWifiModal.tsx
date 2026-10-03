import React from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';

interface Props {
  deviceId: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ForgetWifiModal: React.FC<Props> = ({ deviceId, onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl">
        <div className="w-12 h-12 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center justify-center text-red-400 mx-auto">
          <AlertTriangle className="w-6 h-6" />
        </div>

        <div className="text-center space-y-1">
          <h3 className="text-lg font-bold text-white">Forget Saved Wi-Fi?</h3>
          <p className="text-xs text-slate-400">
            This will clear stored Wi-Fi credentials from ESP32 device <span className="text-slate-200 font-mono">{deviceId}</span> and return it to Setup AP mode.
          </p>
        </div>

        <div className="flex space-x-3 pt-2">
          <button
            onClick={onCancel}
            className="flex-1 py-3 bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-medium rounded-xl border border-slate-700 transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-3 bg-red-600 hover:bg-red-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-red-600/30 transition flex items-center justify-center space-x-1.5"
          >
            <Trash2 className="w-4 h-4" />
            <span>Forget Wi-Fi</span>
          </button>
        </div>
      </div>
    </div>
  );
};
