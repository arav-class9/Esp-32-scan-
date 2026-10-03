import React, { useState } from 'react';
import { Smartphone, Monitor, Wifi, Battery, Signal, Cpu } from 'lucide-react';

interface Props {
  children: React.ReactNode;
}

export const PhoneFrame: React.FC<Props> = ({ children }) => {
  const [isPhoneMode, setIsPhoneMode] = useState(true);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-start p-2 sm:p-6 relative overflow-x-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-indigo-500/10 blur-[120px] pointer-events-none"></div>

      {/* Top Bar Controls */}
      <header className="w-full max-w-3xl flex items-center justify-between py-4 px-4 z-10 mb-2">
        <div className="flex items-center space-x-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 text-white">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-white flex items-center space-x-1.5">
              <span>EVA Device Setup</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                ESP32 Manager
              </span>
            </h1>
            <p className="text-[11px] text-slate-400">Android-First Provisioning App</p>
          </div>
        </div>

        <div className="flex items-center space-x-2 bg-slate-900/80 backdrop-blur border border-slate-800 p-1 rounded-xl shadow-lg">
          <button
            onClick={() => setIsPhoneMode(true)}
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              isPhoneMode ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Phone View</span>
          </button>
          <button
            onClick={() => setIsPhoneMode(false)}
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              !isPhoneMode ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Expanded</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className={`w-full transition-all duration-300 z-10 flex justify-center ${isPhoneMode ? 'max-w-md' : 'max-w-2xl'}`}>
        {isPhoneMode ? (
          <div className="w-full bg-slate-900 border-4 border-slate-800 rounded-[40px] shadow-2xl shadow-indigo-500/10 overflow-hidden relative flex flex-col min-h-[720px]">
            {/* Phone Status Bar */}
            <div className="bg-slate-950 px-6 py-2.5 flex justify-between items-center text-xs text-slate-400 border-b border-slate-800/80">
              <span className="font-mono font-medium text-slate-200">03:07</span>
              {/* Camera punch hole */}
              <div className="w-3.5 h-3.5 bg-slate-900 rounded-full border border-slate-800"></div>
              <div className="flex items-center space-x-2">
                <Signal className="w-3.5 h-3.5" />
                <Wifi className="w-3.5 h-3.5" />
                <Battery className="w-3.5 h-3.5 text-emerald-400" />
              </div>
            </div>

            {/* App Content inside Phone */}
            <div className="flex-1 p-5 overflow-y-auto bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900">
              {children}
            </div>

            {/* Android Navigation Bar Indicator */}
            <div className="bg-slate-950 py-2.5 flex justify-center border-t border-slate-900">
              <div className="w-32 h-1 bg-slate-700 rounded-full"></div>
            </div>
          </div>
        ) : (
          <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl bg-gradient-to-b from-slate-900 to-slate-950">
            {children}
          </div>
        )}
      </main>
    </div>
  );
};
