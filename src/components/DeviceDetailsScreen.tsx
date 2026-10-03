import React, { useState } from 'react';
import { Wifi, Cpu, RefreshCw, Trash2, Send, Sparkles, Activity, ShieldCheck, ArrowLeft, Camera, Zap, Download, Upload } from 'lucide-react';
import { EvaDevice } from '../types';
import { TelemetryDashboard } from './TelemetryDashboard';
import { OtaUpdateScreen } from './OtaUpdateScreen';
import { AiAssistantTab } from './AiAssistantTab';
import { DiagnosticsScreen } from './DiagnosticsScreen';

interface Props {
  device: EvaDevice;
  onChangeWifi: () => void;
  onForgetWifi: () => void;
  onRestart: () => void;
  onBack: () => void;
  onAddLog: (direction: 'APP_TO_ESP32' | 'ESP32_TO_APP', payload: any) => void;
}

export const DeviceDetailsScreen: React.FC<Props> = ({
  device,
  onChangeWifi,
  onForgetWifi,
  onRestart,
  onBack,
  onAddLog
}) => {
  const [activeTab, setActiveTab] = useState<'info' | 'telemetry' | 'ota' | 'ai' | 'diagnostics' | 'hardware'>('info');
  const [ledState, setLedState] = useState(false);
  const [faceResult, setFaceResult] = useState<any>(null);
  const [isTestingFace, setIsTestingFace] = useState(false);

  const handleSendCommand = async (command: string, payload: any) => {
    try {
      onAddLog('APP_TO_ESP32', { type: 'command', command, payload });
      const res = await fetch('/device/command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ device_id: device.device_id, command, payload })
      });
      const data = await res.json();
      onAddLog('ESP32_TO_APP', data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleTestFaceDetect = async () => {
    setIsTestingFace(true);
    try {
      onAddLog('APP_TO_ESP32', { type: 'face_detect_request' });
      const res = await fetch('/face/detect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ device_id: device.device_id })
      });
      const data = await res.json();
      onAddLog('ESP32_TO_APP', data);
      setFaceResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsTestingFace(false);
    }
  };

  return (
    <div className="space-y-4 animate-fadeIn pb-6">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="text-xs text-slate-400 hover:text-white flex items-center space-x-1 p-2 bg-slate-900 rounded-lg border border-slate-800"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Home</span>
        </button>
        <span className="text-xs font-mono text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/25">
          {device.device_id}
        </span>
      </div>

      {/* Navigation Tabs */}
      <div className="flex overflow-x-auto space-x-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs no-scrollbar">
        <button
          onClick={() => setActiveTab('info')}
          className={`px-3 py-2 font-medium rounded-lg transition whitespace-nowrap ${
            activeTab === 'info' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          Info
        </button>
        <button
          onClick={() => setActiveTab('telemetry')}
          className={`px-3 py-2 font-medium rounded-lg transition whitespace-nowrap flex items-center space-x-1 ${
            activeTab === 'telemetry' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Activity className="w-3 h-3 text-emerald-400" />
          <span>Telemetry</span>
        </button>
        <button
          onClick={() => setActiveTab('ota')}
          className={`px-3 py-2 font-medium rounded-lg transition whitespace-nowrap flex items-center space-x-1 ${
            activeTab === 'ota' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Upload className="w-3 h-3 text-indigo-400" />
          <span>OTA Update</span>
        </button>
        <button
          onClick={() => setActiveTab('ai')}
          className={`px-3 py-2 font-medium rounded-lg transition whitespace-nowrap flex items-center space-x-1 ${
            activeTab === 'ai' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Sparkles className="w-3 h-3 text-purple-400" />
          <span>EVA AI</span>
        </button>
        <button
          onClick={() => setActiveTab('diagnostics')}
          className={`px-3 py-2 font-medium rounded-lg transition whitespace-nowrap flex items-center space-x-1 ${
            activeTab === 'diagnostics' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          <ShieldCheck className="w-3 h-3 text-blue-400" />
          <span>Diagnostics</span>
        </button>
        <button
          onClick={() => setActiveTab('hardware')}
          className={`px-3 py-2 font-medium rounded-lg transition whitespace-nowrap flex items-center space-x-1 ${
            activeTab === 'hardware' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Zap className="w-3 h-3 text-amber-400" />
          <span>Hardware</span>
        </button>
      </div>

      {activeTab === 'info' && (
        <div className="space-y-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-3.5 shadow-xl">
            <div className="flex justify-between items-center pb-2.5 border-b border-slate-800 text-xs">
              <span className="text-slate-400">Board Variant</span>
              <span className="font-semibold text-white">{device.board}</span>
            </div>
            <div className="flex justify-between items-center pb-2.5 border-b border-slate-800 text-xs">
              <span className="text-slate-400">Firmware Version</span>
              <span className="font-mono text-indigo-300">v{device.firmware}</span>
            </div>
            <div className="flex justify-between items-center pb-2.5 border-b border-slate-800 text-xs">
              <span className="text-slate-400">Wi-Fi SSID</span>
              <span className="font-medium text-slate-200">{device.ssid || 'Not Connected'}</span>
            </div>
            <div className="flex justify-between items-center pb-2.5 border-b border-slate-800 text-xs">
              <span className="text-slate-400">IP Address</span>
              <span className="font-mono text-slate-200">{device.ip}</span>
            </div>
            <div className="flex justify-between items-center pb-2.5 border-b border-slate-800 text-xs">
              <span className="text-slate-400">Signal Strength (RSSI)</span>
              <span className="text-emerald-400 font-medium">{device.rssi} dBm (Good)</span>
            </div>
            <div className="flex justify-between items-center pb-2.5 border-b border-slate-800 text-xs">
              <span className="text-slate-400">Backend Connection</span>
              <span className="text-emerald-400 font-medium flex items-center">
                <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Connected
              </span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Last Seen</span>
              <span className="text-slate-300 font-mono text-[11px]">Just now</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={onChangeWifi}
              className="py-2.5 px-3 bg-slate-850 hover:bg-slate-800 text-slate-200 text-xs font-medium rounded-xl border border-slate-750 transition flex items-center justify-center space-x-1.5"
            >
              <Wifi className="w-3.5 h-3.5 text-indigo-400" />
              <span>Change Wi-Fi</span>
            </button>
            <button
              onClick={onRestart}
              className="py-2.5 px-3 bg-slate-850 hover:bg-slate-800 text-slate-200 text-xs font-medium rounded-xl border border-slate-750 transition flex items-center justify-center space-x-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
              <span>Restart EVA</span>
            </button>
            <button
              onClick={() => setActiveTab('ota')}
              className="py-2.5 px-3 bg-slate-850 hover:bg-slate-800 text-slate-200 text-xs font-medium rounded-xl border border-slate-750 transition flex items-center justify-center space-x-1.5"
            >
              <Upload className="w-3.5 h-3.5 text-blue-400" />
              <span>OTA Update</span>
            </button>
            <button
              onClick={onForgetWifi}
              className="py-2.5 px-3 bg-red-950/20 hover:bg-red-950/40 text-red-300 text-xs font-medium rounded-xl border border-red-900/40 transition flex items-center justify-center space-x-1.5"
            >
              <Trash2 className="w-3.5 h-3.5 text-red-400" />
              <span>Forget Wi-Fi</span>
            </button>
          </div>
        </div>
      )}

      {activeTab === 'telemetry' && <TelemetryDashboard deviceId={device.device_id} />}

      {activeTab === 'ota' && <OtaUpdateScreen deviceId={device.device_id} currentFirmware={device.firmware} />}

      {activeTab === 'ai' && <AiAssistantTab deviceId={device.device_id} />}

      {activeTab === 'diagnostics' && <DiagnosticsScreen deviceId={device.device_id} />}

      {activeTab === 'hardware' && (
        <div className="space-y-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-4 shadow-xl text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="font-semibold text-slate-200">ESP32 Status LED</span>
              <button
                onClick={() => {
                  const next = !ledState;
                  setLedState(next);
                  handleSendCommand('set_led', { state: next ? 'ON' : 'OFF' });
                }}
                className={`px-3 py-1.5 rounded-lg font-medium transition ${
                  ledState ? 'bg-emerald-600 text-white shadow' : 'bg-slate-800 text-slate-400 border border-slate-700'
                }`}
              >
                {ledState ? 'LED ON' : 'LED OFF'}
              </button>
            </div>

            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="font-semibold text-slate-200">Servo / Display Expression</span>
              <div className="flex space-x-1.5">
                <button
                  onClick={() => handleSendCommand('expression', { mood: 'happy' })}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-750 text-slate-200 rounded border border-slate-700"
                >
                  😊 Happy
                </button>
                <button
                  onClick={() => handleSendCommand('expression', { mood: 'curious' })}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-750 text-slate-200 rounded border border-slate-700"
                >
                  🤔 Curious
                </button>
              </div>
            </div>

            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-200 flex items-center">
                  <Camera className="w-4 h-4 mr-1.5 text-indigo-400" />
                  Camera Face Detection
                </span>
                <button
                  onClick={handleTestFaceDetect}
                  disabled={isTestingFace}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition font-medium"
                >
                  {isTestingFace ? 'Detecting...' : 'Detect Face'}
                </button>
              </div>

              {faceResult && (
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-[11px] space-y-1">
                  <div>Faces Detected: <span className="text-emerald-400">{faceResult.faces_detected}</span></div>
                  <div>Confidence: <span className="text-indigo-300">{(faceResult.confidence * 100).toFixed(0)}%</span></div>
                  <div>Expression: <span className="text-purple-300">{faceResult.expression}</span></div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
