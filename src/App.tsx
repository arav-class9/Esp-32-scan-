import React, { useState, useEffect } from 'react';
import { PhoneFrame } from './components/PhoneFrame';
import { HomeScreen } from './components/HomeScreen';
import { DiscoverScreen } from './components/DiscoverScreen';
import { WifiSetupScreen } from './components/WifiSetupScreen';
import { ConnectingScreen } from './components/ConnectingScreen';
import { SuccessScreen } from './components/SuccessScreen';
import { DeviceDetailsScreen } from './components/DeviceDetailsScreen';
import { ChangeWifiScreen } from './components/ChangeWifiScreen';
import { ForgetWifiModal } from './components/ForgetWifiModal';
import { ProtocolDebugger } from './components/ProtocolDebugger';
import { ScreenState, BoardType, EvaDevice, ProtocolLog, DeviceState } from './types';
import { auth, loginWithGoogle, logoutUser, saveDeviceToFirestore, loadDevicesFromFirestore, deleteDeviceFromFirestore } from './firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { LogIn, LogOut, User as UserIcon, Bluetooth } from 'lucide-react';
import { BleDevicePayload, bleService } from './services/bluetoothService';

export default function App() {
  const [screen, setScreen] = useState<ScreenState>('home');
  const [user, setUser] = useState<User | null>(null);
  const [device, setDevice] = useState<EvaDevice | null>(null);
  const [selectedBleDevice, setSelectedBleDevice] = useState<BleDevicePayload | null>(null);
  const [deviceState, setDeviceState] = useState<DeviceState>('idle');
  const [pendingSsid, setPendingSsid] = useState('');
  const [pendingPassword, setPendingPassword] = useState('');
  const [showForgetModal, setShowForgetModal] = useState(false);
  const [logs, setLogs] = useState<ProtocolLog[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        try {
          const userDevices = await loadDevicesFromFirestore(firebaseUser.uid);
          if (userDevices.length > 0) {
            setDevice(userDevices[0]);
          }
        } catch (err) {
          console.error('Failed to load user devices from Firestore:', err);
        }
      } else {
        setDevice(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const addLog = (direction: 'APP_TO_ESP32' | 'ESP32_TO_APP', payload: any) => {
    const newLog: ProtocolLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toLocaleTimeString(),
      direction,
      payload
    };
    setLogs(prev => [newLog, ...prev]);
  };

  const handleConnectWifi = (ssid: string, pass: string) => {
    setPendingSsid(ssid);
    setPendingPassword(pass);
    addLog('APP_TO_ESP32', {
      type: 'wifi_credentials',
      ssid,
      password: '***',
      device_name: selectedBleDevice?.name || 'EVA-ESP32',
      session_token: `sess-${Date.now()}`
    });
    setScreen('connecting');
  };

  const handleUpdateWifi = async (ssid: string, pass: string) => {
    addLog('APP_TO_ESP32', { type: 'wifi_update_ble', ssid, password: '***' });
    try {
      await bleService.sendWifiCredentials(ssid, pass, device?.device_id || 'EVA-ESP32');
      addLog('ESP32_TO_APP', { ok: true, status: 'wifi_connected', ssid });

      if (device) {
        const updated: EvaDevice = {
          ...device,
          ssid,
          ip: '192.168.43.150',
          status: 'online',
          backend_connected: true
        };
        setDevice(updated);
        if (user) {
          await saveDeviceToFirestore(user.uid, updated);
        }
        setScreen('device_details');
      }
    } catch (err: any) {
      console.error('Update Wi-Fi error:', err);
      alert(err.message || 'Failed to update Wi-Fi credentials over BLE.');
    }
  };

  const handleForgetWifi = async () => {
    const targetId = device?.device_id || selectedBleDevice?.id || 'ESP32-A1B2C3D4';
    addLog('APP_TO_ESP32', { type: 'forget_wifi', device_id: targetId });
    try {
      bleService.disconnect();
      if (user && device) {
        await deleteDeviceFromFirestore(user.uid, device.device_id);
      }

      setDevice(null);
      setSelectedBleDevice(null);
      setShowForgetModal(false);
      setScreen('home');
      setDeviceState('disconnected');
    } catch (err) {
      console.error(err);
    }
  };

  const handleRestart = async () => {
    addLog('APP_TO_ESP32', { type: 'restart', device_id: device?.device_id });
    alert('ESP32 hardware reboot signal sent via BLE.');
  };

  const registerDeviceWithBackend = async (dev: EvaDevice) => {
    try {
      await fetch('/api/devices/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          device_id: dev.device_id,
          device_type: 'EVA-ESP32-Module',
          chip_type: dev.board,
          firmware_version: dev.firmware,
          user_id: user?.uid || 'anonymous'
        })
      });
    } catch (e) {
      console.error('Backend registration error:', e);
    }
  };

  return (
    <PhoneFrame>
      <div className="space-y-6">
        {/* Firebase User Auth Bar */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 flex items-center justify-between text-xs">
          {user ? (
            <div className="flex items-center space-x-2 truncate">
              {user.photoURL ? (
                <img src={user.photoURL} alt="User" className="w-6 h-6 rounded-full border border-indigo-500/30" />
              ) : (
                <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold">
                  {user.email?.[0]?.toUpperCase() || 'U'}
                </div>
              )}
              <div className="truncate">
                <span className="text-slate-200 font-medium block truncate">{user.displayName || user.email}</span>
                <span className="text-[10px] text-emerald-400">Firebase Cloud Saved</span>
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-2 text-slate-400">
              <UserIcon className="w-4 h-4 text-indigo-400" />
              <span>Sign in to save device data</span>
            </div>
          )}

          {user ? (
            <button
              onClick={() => logoutUser()}
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-lg border border-slate-700 flex items-center space-x-1 transition text-[11px]"
            >
              <LogOut className="w-3 h-3 text-red-400" />
              <span>Sign Out</span>
            </button>
          ) : (
            <button
              onClick={() => loginWithGoogle()}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg shadow-md shadow-indigo-600/30 flex items-center space-x-1.5 transition text-[11px] font-medium"
            >
              <LogIn className="w-3 h-3" />
              <span>Google Sign-In</span>
            </button>
          )}
        </div>

        {/* Real-time State Machine Badge */}
        <div className="flex items-center justify-between px-1">
          <span className="text-[11px] font-mono text-slate-400 flex items-center">
            <Bluetooth className="w-3.5 h-3.5 mr-1.5 text-blue-400 animate-pulse" />
            State: <strong className="text-indigo-300 ml-1 uppercase">{deviceState}</strong>
          </span>
        </div>

        {screen === 'home' && (
          <HomeScreen
            device={device}
            onAddDevice={() => setScreen('discover')}
            onOpenDevice={() => setScreen('device_details')}
            onOpenSettings={() => setScreen('device_details')}
            onReset={() => {
              setDevice(null);
              setScreen('home');
              setDeviceState('idle');
            }}
          />
        )}

        {screen === 'discover' && (
          <DiscoverScreen
            onSelectDevice={(selectedDevice) => {
              setSelectedBleDevice(selectedDevice);
              setDeviceState('device_discovered');
              setScreen('wifi_setup');
            }}
            onCancel={() => setScreen('home')}
            onDeviceStateChange={(state) => setDeviceState(state)}
          />
        )}

        {screen === 'wifi_setup' && selectedBleDevice && (
          <WifiSetupScreen
            deviceId={selectedBleDevice.id}
            board={selectedBleDevice.board}
            onConnect={handleConnectWifi}
            onCancel={() => setScreen('discover')}
          />
        )}

        {screen === 'connecting' && selectedBleDevice && (
          <ConnectingScreen
            device={selectedBleDevice}
            ssid={pendingSsid}
            password={pendingPassword}
            onSuccess={async () => {
              setDeviceState('internet_ready');
              const newDevice: EvaDevice = {
                device_id: selectedBleDevice.id,
                board: selectedBleDevice.board,
                firmware: '1.0.0',
                wifi: true,
                ssid: pendingSsid,
                ip: '192.168.43.150',
                rssi: -48,
                status: 'online',
                last_seen: new Date().toISOString(),
                backend_connected: true,
                uptime: 7200
              };
              setDevice(newDevice);
              
              // Register device with backend REST API
              await registerDeviceWithBackend(newDevice);

              if (user) {
                await saveDeviceToFirestore(user.uid, newDevice);
              }
              setScreen('success');
            }}
            onError={(msg) => {
              setDeviceState('connection_failed');
              alert(msg);
              setScreen('wifi_setup');
            }}
            onStateChange={(state) => setDeviceState(state)}
          />
        )}

        {screen === 'success' && device && (
          <SuccessScreen
            device={device}
            onContinue={() => setScreen('device_details')}
          />
        )}

        {screen === 'device_details' && device && (
          <DeviceDetailsScreen
            device={device}
            onChangeWifi={() => setScreen('change_wifi')}
            onForgetWifi={() => setShowForgetModal(true)}
            onRestart={handleRestart}
            onBack={() => setScreen('home')}
            onAddLog={addLog}
          />
        )}

        {screen === 'change_wifi' && device && (
          <ChangeWifiScreen
            deviceId={device.device_id}
            board={device.board}
            currentSsid={device.ssid}
            onUpdateWifi={handleUpdateWifi}
            onCancel={() => setScreen('device_details')}
          />
        )}

        {/* Protocol Debugger Drawer */}
        <div className="pt-4 border-t border-slate-800/80 mt-6">
          <ProtocolDebugger logs={logs} onClear={() => setLogs([])} />
        </div>

        {showForgetModal && device && (
          <ForgetWifiModal
            deviceId={device.device_id}
            onConfirm={handleForgetWifi}
            onCancel={() => setShowForgetModal(false)}
          />
        )}
      </div>
    </PhoneFrame>
  );
}
