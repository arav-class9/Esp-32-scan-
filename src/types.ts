export type ScreenState = 
  | 'home'
  | 'discover'
  | 'wifi_setup'
  | 'connecting'
  | 'success'
  | 'device_details'
  | 'change_wifi'
  | 'forget_wifi_modal';

export type BoardType = 'ESP32' | 'ESP32-S3' | 'ESP32-C3' | 'ESP32-C3 Mini';

export type DeviceState =
  | 'idle'
  | 'scanning'
  | 'device_discovered'
  | 'bluetooth_connecting'
  | 'bluetooth_connected'
  | 'sending_credentials'
  | 'wifi_connecting'
  | 'wifi_connected'
  | 'internet_checking'
  | 'internet_ready'
  | 'connection_failed'
  | 'disconnected';

export interface EvaDevice {
  device_id: string;
  board: BoardType;
  firmware: string;
  wifi: boolean;
  ssid: string;
  ip: string;
  rssi: number;
  status: 'online' | 'offline' | 'connecting' | 'provisioning';
  last_seen: string;
  backend_connected: boolean;
  userId?: string;
  uptime?: number;
}

export interface ProtocolLog {
  id: string;
  timestamp: string;
  direction: 'APP_TO_ESP32' | 'ESP32_TO_APP';
  payload: any;
}
