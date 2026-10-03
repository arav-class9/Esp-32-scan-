import React, { useState } from 'react';
import { Upload, Download, CheckCircle2, AlertCircle, RefreshCw, Cpu, Loader2 } from 'lucide-react';

interface Props {
  deviceId: string;
  currentFirmware: string;
}

export const OtaUpdateScreen: React.FC<Props> = ({ deviceId, currentFirmware }) => {
  const [targetVersion, setTargetVersion] = useState('1.3.0');
  const [isUpdating, setIsUpdating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFileName(e.target.files[0].name);
    }
  };

  const startOtaUpdate = async () => {
    setIsUpdating(true);
    setProgress(10);
    setSuccessMsg(null);

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 20;
      });
    }, 400);

    try {
      const res = await fetch('/api/esp32/ota', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ device_id: deviceId, version: targetVersion })
      });
      const data = await res.json();

      setTimeout(() => {
        clearInterval(interval);
        setProgress(100);
        setIsUpdating(false);
        setSuccessMsg(data.message || 'OTA firmware update completed successfully.');
      }, 2500);
    } catch (err) {
      console.error(err);
      setIsUpdating(false);
      clearInterval(interval);
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
      <div className="flex items-center space-x-2">
        <Upload className="w-4 h-4 text-indigo-400" />
        <h3 className="text-sm font-bold text-white">OTA Firmware Update (.bin)</h3>
      </div>

      <div className="bg-slate-850 border border-slate-800 rounded-xl p-3 text-xs space-y-1">
        <div className="flex justify-between">
          <span className="text-slate-400">Current Version:</span>
          <span className="font-mono text-white font-medium">v{currentFirmware}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Target Firmware:</span>
          <span className="font-mono text-indigo-300 font-medium">v{targetVersion}</span>
        </div>
      </div>

      {!isUpdating && progress === 0 && (
        <div className="space-y-3">
          <div className="border-2 border-dashed border-slate-700 hover:border-indigo-500 rounded-xl p-4 text-center cursor-pointer transition">
            <input 
              type="file" 
              accept=".bin" 
              onChange={handleFileUpload} 
              className="hidden" 
              id="firmware-file" 
            />
            <label htmlFor="firmware-file" className="cursor-pointer space-y-2 block">
              <div className="w-10 h-10 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto text-indigo-400">
                <Upload className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-200">
                  {fileName ? fileName : 'Upload Firmware (.bin)'}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">Drag & drop or browse compiled ESP32 binary</p>
              </div>
            </label>
          </div>

          <button
            onClick={startOtaUpdate}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow transition flex items-center justify-center space-x-1.5"
          >
            <Download className="w-4 h-4" />
            <span>Flash Firmware OTA</span>
          </button>
        </div>
      )}

      {isUpdating && (
        <div className="space-y-3 text-center py-4">
          <Loader2 className="w-8 h-8 text-indigo-400 animate-spin mx-auto" />
          <div>
            <p className="text-xs font-semibold text-white">Flashing ESP32 Memory...</p>
            <p className="text-[11px] text-slate-400 mt-1">{progress}% Complete</p>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
            <div className="bg-indigo-500 h-2 transition-all duration-300" style={{ width: `${progress}%` }}></div>
          </div>
        </div>
      )}

      {successMsg && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center space-x-2 text-xs text-emerald-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}
    </div>
  );
};
