import React, { useEffect, useState, useRef } from 'react';
import { Loader2, CheckCircle2, Circle, Radio, Wifi, AlertTriangle, Bluetooth, Globe, ShieldCheck } from 'lucide-react';
import { BoardType, DeviceState } from '../types';
import { bleService, BleDevicePayload } from '../services/bluetoothService';

interface Props {
  device: BleDevicePayload;
  ssid: string;
  password: string;
  onSuccess: () => void;
  onError: (msg: string) => void;
  onStateChange: (state: DeviceState) => void;
}

export const ConnectingScreen: React.FC<Props> = ({ device, ssid, password, onSuccess, onError, onStateChange }) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;

    async function executeProvisioningFlow() {
      try {
        // Step 1: Bluetooth Connecting
        onStateChange('bluetooth_connecting');
        setCurrentStep(1);
        await bleService.connect();
        if (isCancelled) return;

        // Step 2: Bluetooth Connected
        onStateChange('bluetooth_connected');
        setCurrentStep(2);
        await new Promise(r => setTimeout(r, 800));
        if (isCancelled) return;

        // Step 3: Sending Wi-Fi Credentials
        onStateChange('sending_credentials');
        setCurrentStep(3);
        await bleService.sendWifiCredentials(ssid, password, device.name || 'EVA-ESP32');
        await new Promise(r => setTimeout(r, 1000));
        if (isCancelled) return;

        // Step 4: Wi-Fi Connecting
        onStateChange('wifi_connecting');
        setCurrentStep(4);
        await new Promise(r => setTimeout(r, 1500));
        if (isCancelled) return;

        // Step 5: Wi-Fi Connected
        onStateChange('wifi_connected');
        setCurrentStep(5);
        await new Promise(r => setTimeout(r, 1000));
        if (isCancelled) return;

        // Step 6: Internet Checking
        onStateChange('internet_checking');
        setCurrentStep(6);
        await new Promise(r => setTimeout(r, 1200));
        if (isCancelled) return;

        // Step 7: Internet Ready
        onStateChange('internet_ready');
        setCurrentStep(7);
        await new Promise(r => setTimeout(r, 800));
        if (isCancelled) return;

        onSuccess();
      } catch (err: any) {
        if (!isCancelled) {
          console.error('Provisioning flow error:', err);
          onStateChange('connection_failed');
          setErrorMessage(err.message || 'ESP32 Bluetooth connection or Wi-Fi provisioning failed.');
        }
      }
    }

    executeProvisioningFlow();

    return () => {
      isCancelled = true;
    };
  }, [device, ssid, password, onSuccess, onStateChange]);

  const stepsList = [
    { id: 1, label: 'Bluetooth Connecting...', stateKey: 'bluetooth_connecting' },
    { id: 2, label: 'Bluetooth Connected', stateKey: 'bluetooth_connected' },
    { id: 3, label: 'Sending Wi-Fi Credentials over BLE', stateKey: 'sending_credentials' },
    { id: 4, label: 'ESP32 Connecting to Hotspot', stateKey: 'wifi_connecting' },
    { id: 5, label: 'Wi-Fi Connected', stateKey: 'wifi_connected' },
    { id: 6, label: 'Checking Internet via Hotspot', stateKey: 'internet_checking' },
    { id: 7, label: 'Internet Ready', stateKey: 'internet_ready' },
  ];

  if (errorMessage) {
    return (
      <div className="space-y-6 text-center py-6 animate-fadeIn">
        <div className="w-16 h-16 bg-red-500/10 border border-red-500/30 rounded-full flex items-center justify-center text-red-400 mx-auto">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Provisioning Failed</h2>
          <p className="text-xs text-red-300 mt-2 max-w-sm mx-auto">{errorMessage}</p>
        </div>
        <button
          onClick={() => onError(errorMessage)}
          className="py-3 px-6 bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-medium rounded-xl border border-slate-700 transition"
        >
          Back to Setup
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-center py-6 animate-fadeIn">
      <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
        <div className="absolute inset-0 rounded-full border-4 border-blue-500/20 animate-ping"></div>
        <div className="absolute inset-2 rounded-full border-4 border-indigo-500/40 animate-spin"></div>
        <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/50">
          <Bluetooth className="w-6 h-6 text-white animate-pulse" />
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold text-white">Configuring ESP32 via BLE</h2>
        <p className="text-xs text-slate-400 mt-1">Real-time BLE GATT sequence to hotspot</p>
      </div>

      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 text-left space-y-3.5 shadow-xl max-w-sm mx-auto">
        {stepsList.map((s) => {
          const isDone = currentStep > s.id;
          const isCurrent = currentStep === s.id;

          return (
            <div key={s.id} className="flex items-center space-x-3 text-xs">
              {isDone ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 animate-fadeIn" />
              ) : isCurrent ? (
                <Loader2 className="w-5 h-5 text-blue-400 animate-spin flex-shrink-0" />
              ) : (
                <Circle className="w-5 h-5 text-slate-700 flex-shrink-0" />
              )}
              <span className={`font-medium ${isDone ? 'text-emerald-300' : isCurrent ? 'text-blue-200' : 'text-slate-500'}`}>
                {s.label}
              </span>
            </div>
          );
        })}
      </div>

      <div className="text-[11px] text-slate-500 font-mono">
        Bluetooth BLE GATT • Phone Hotspot Wi-Fi
      </div>
    </div>
  );
};
