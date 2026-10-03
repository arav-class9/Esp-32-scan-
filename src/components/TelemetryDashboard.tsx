import React, { useState, useEffect } from 'react';
import { Activity, Thermometer, Droplets, BatteryCharging, Cpu, Wifi, RefreshCw } from 'lucide-react';

interface TelemetryData {
  temperature: number;
  humidity: number;
  battery: number;
  cpu_load: number;
  rssi: number;
  timestamp: string;
}

interface Props {
  deviceId: string;
}

export const TelemetryDashboard: React.FC<Props> = ({ deviceId }) => {
  const [data, setData] = useState<TelemetryData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchTelemetry = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/esp32/telemetry');
      const json = await res.json();
      if (json.success) {
        setData(json);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTelemetry();
    const interval = setInterval(fetchTelemetry, 4000);
    return () => clearInterval(interval);
  }, [deviceId]);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
          <h3 className="text-sm font-bold text-white">Live ESP32 Telemetry</h3>
        </div>
        <button
          onClick={fetchTelemetry}
          className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center space-x-1"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Temperature */}
        <div className="bg-slate-850 border border-slate-800 rounded-xl p-3 flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
            <Thermometer className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Temperature</span>
            <span className="text-base font-bold text-white">{data ? `${data.temperature}°C` : '--'}</span>
          </div>
        </div>

        {/* Humidity */}
        <div className="bg-slate-850 border border-slate-800 rounded-xl p-3 flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Droplets className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Humidity</span>
            <span className="text-base font-bold text-white">{data ? `${data.humidity}%` : '--'}</span>
          </div>
        </div>

        {/* Battery */}
        <div className="bg-slate-850 border border-slate-800 rounded-xl p-3 flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <BatteryCharging className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Battery</span>
            <span className="text-base font-bold text-white">{data ? `${data.battery}%` : '--'}</span>
          </div>
        </div>

        {/* CPU Load */}
        <div className="bg-slate-850 border border-slate-800 rounded-xl p-3 flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">CPU Load</span>
            <span className="text-base font-bold text-white">{data ? `${data.cpu_load}%` : '--'}</span>
          </div>
        </div>
      </div>

      <div className="bg-slate-850/60 border border-slate-800 rounded-xl p-3 flex items-center justify-between text-xs">
        <span className="flex items-center text-slate-400">
          <Wifi className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
          Wi-Fi Signal (RSSI)
        </span>
        <span className="font-mono text-emerald-400 font-bold">{data ? `${data.rssi} dBm` : '--'}</span>
      </div>
    </div>
  );
};
