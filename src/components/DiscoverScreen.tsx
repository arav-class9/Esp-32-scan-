import React, { useState, useEffect } from 'react';
import { Search, Wifi, Cpu, ArrowRight, RefreshCw, Radio, CheckCircle2, AlertCircle, Bluetooth, ShieldAlert } from 'lucide-react';
import { BoardType, DeviceState } from '../types';
import { bleService, BleDevicePayload } from '../services/bluetoothService';

interface Props {
  onSelectDevice: (device: BleDevicePayload) => void;
  onCancel: () => void;
  onDeviceStateChange: (state: DeviceState) => void;
}

export const DiscoverScreen: React.FC<Props> = ({ onSelectDevice, onCancel, onDeviceStateChange }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [discoveredDevice, setDiscoveredDevice] = useState<BleDevicePayload | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const [isSandboxMode, setIsSandboxMode] = useState(false);

  const startRealBleScan = async () => {
    setIsScanning(true);
    setDiscoveredDevice(null);
    setScanError(null);
    onDeviceStateChange('scanning');

    try {
      const device = await bleService.scanForDevice(true);
      if (device) {
        setDiscoveredDevice(device);
        if (device.isSimulated) {
          setIsSandboxMode(true);
        }
        onDeviceStateChange('device_discovered');
      } else {
        setDiscoveredDevice(null);
        onDeviceStateChange('idle');
      }
    } catch (err: any) {
      console.error('BLE Scan Error:', err);
      setScanError(err.message || 'Bluetooth scanning failed.');
      onDeviceStateChange('connection_failed');
    } finally {
      setIsScanning(false);
    }
  };

  useEffect(() => {
    startRealBleScan();
  }, []);

  return (
    <div className="space-y-6 animate-fadeIn pb-6">
      <div className="text-center pt-2">
        <h2 className="text-xl font-bold text-white">Connect ESP32 (Bluetooth BLE)</h2>
        <p className="text-xs text-slate-400 mt-1">Discovering nearby real ESP32 / S3 / C3 hardware...</p>
      </div>

      {isScanning ? (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-8 text-center space-y-6 shadow-xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-indigo-500/10 to-blue-500/5 animate-pulse"></div>
          
          <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border-2 border-blue-500/20 animate-ping"></div>
            <div className="absolute inset-2 rounded-full border-2 border-indigo-500/40 animate-spin"></div>
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/50">
              <Bluetooth className="w-6 h-6 text-white animate-pulse" />
            </div>
          </div>

          <div className="space-y-1">
            <p className="text-sm font-semibold text-slate-200">Scanning Bluetooth BLE...</p>
            <p className="text-xs text-slate-400">Requesting Bluetooth device access...</p>
          </div>

          <div className="flex justify-center">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-blue-500/10 text-blue-300 border border-blue-500/20 font-mono">
              <Radio className="w-3 h-3 mr-1.5 animate-pulse text-blue-400" />
              BLE GATT Discovery Active
            </span>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <span className="text-xs font-semibold text-slate-400">
              {discoveredDevice ? 'Discovered Device (1)' : 'No ESP32 device found'}
            </span>
            <button 
              onClick={startRealBleScan}
              className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center space-x-1"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Scan Again</span>
            </button>
          </div>

          {isSandboxMode && (
            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-start space-x-2 text-xs text-amber-300">
              <ShieldAlert className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <span>
                Browser permissions policy restricted direct hardware Bluetooth in this preview window. Connected using sandbox fallback protocol for testing.
              </span>
            </div>
          )}

          {scanError && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center space-x-2 text-xs text-red-300">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <span>{scanError}</span>
            </div>
          )}

          {!discoveredDevice ? (
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-8 text-center space-y-4 shadow-xl">
              <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center mx-auto text-slate-400">
                <Bluetooth className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-200">No ESP32 Device Found</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                  Please turn on your ESP32 device or click Scan Again.
                </p>
              </div>
              <button
                onClick={startRealBleScan}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-xl shadow transition inline-flex items-center space-x-1.5"
              >
                <Bluetooth className="w-3.5 h-3.5" />
                <span>Start BLE Scan</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="p-4 rounded-xl border bg-slate-855 border-indigo-500 shadow-lg relative">
                <div className="absolute top-3 right-3 text-indigo-400">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 flex-shrink-0">
                    <Bluetooth className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-bold text-white text-sm">{discoveredDevice.name}</h3>
                      <span className="text-[10px] font-mono px-2 py-0.5 bg-blue-500/10 text-blue-300 rounded border border-blue-500/20">
                        {discoveredDevice.board}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      BLE ID: <span className="font-mono text-slate-300">{discoveredDevice.id}</span>
                    </p>
                    <div className="flex items-center space-x-3 mt-2 text-[11px] text-slate-500">
                      <span className="text-emerald-400 font-medium">Device Discovered (Ready to Connect)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex space-x-3 pt-2">
            <button
              onClick={onCancel}
              className="flex-1 py-3 bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-medium rounded-xl border border-slate-700 transition"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                if (discoveredDevice) {
                  onSelectDevice(discoveredDevice);
                }
              }}
              disabled={!discoveredDevice}
              className={`flex-1 py-3 text-white text-xs font-semibold rounded-xl shadow-lg transition flex items-center justify-center space-x-1.5 ${
                !discoveredDevice
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed shadow-none'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-blue-600/30'
              }`}
            >
              <span>Connect Bluetooth</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
