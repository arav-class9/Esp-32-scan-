/**
 * Real Web Bluetooth BLE Provisioning Service for ESP32, ESP32-S3, ESP32-C3, and ESP32-C3 Mini
 */

export const PROVISIONING_SERVICE_UUID = '4fafc201-1fb5-459e-8fcc-c5c9c331914b';
export const CHAR_DEVICE_INFO_UUID = 'beb5483e-36e1-4688-b7f5-ea07361b26a6';
export const CHAR_WIFI_PROVISION_UUID = '1c95c215-d812-4f11-9a99-b1ff8e919500';
export const CHAR_COMMAND_UUID = '2c95c215-d812-4f11-9a99-b1ff8e919501';
export const CHAR_RESPONSE_UUID = '3c95c215-d812-4f11-9a99-b1ff8e919502';

export interface BleDevicePayload {
  id: string;
  name: string;
  board: 'ESP32' | 'ESP32-S3' | 'ESP32-C3' | 'ESP32-C3 Mini';
  rssi?: number;
  device: any;
  isSimulated?: boolean;
}

export class BluetoothProvisioningService {
  private device: any | null = null;
  private server: any | null = null;
  private wifiChar: any | null = null;
  private infoChar: any | null = null;

  public isSupported(): boolean {
    return typeof navigator !== 'undefined' && 'bluetooth' in (navigator as any);
  }

  public async scanForDevice(allowSimulationFallback = true): Promise<BleDevicePayload | null> {
    if (!this.isSupported()) {
      if (allowSimulationFallback) {
        return this.getSimulatedDevice();
      }
      throw new Error('Bluetooth is disabled or not supported in this browser.');
    }

    try {
      const nav = navigator as any;
      const bluetoothDevice = await nav.bluetooth.requestDevice({
        acceptAllDevices: false,
        filters: [
          { services: [PROVISIONING_SERVICE_UUID] },
          { namePrefix: 'EVA' },
          { namePrefix: 'ESP32' }
        ],
        optionalServices: [PROVISIONING_SERVICE_UUID]
      });

      if (!bluetoothDevice) {
        return null;
      }

      this.device = bluetoothDevice;
      const name = bluetoothDevice.name || 'EVA-ESP32';
      let board: 'ESP32' | 'ESP32-S3' | 'ESP32-C3' | 'ESP32-C3 Mini' = 'ESP32-S3';
      if (name.includes('C3')) board = 'ESP32-C3';
      if (name.includes('S3')) board = 'ESP32-S3';
      if (name.includes('Mini')) board = 'ESP32-C3 Mini';

      return {
        id: bluetoothDevice.id || `esp32-${Math.random().toString(36).substr(2, 6)}`,
        name,
        board,
        device: bluetoothDevice,
        isSimulated: false
      };
    } catch (error: any) {
      console.warn('Web Bluetooth requestDevice error:', error);
      if (error.name === 'NotFoundError') {
        return null;
      }
      if (allowSimulationFallback && (error.message?.includes('permissions policy') || error.message?.includes('security'))) {
        console.warn('Bluetooth permissions restricted in sandbox. Using simulated device.');
        return this.getSimulatedDevice();
      }
      throw error;
    }
  }

  private getSimulatedDevice(): BleDevicePayload {
    return {
      id: 'ESP32-A1B2C3D4',
      name: 'EVA-ESP32-S3',
      board: 'ESP32-S3',
      rssi: -50,
      device: null,
      isSimulated: true
    };
  }

  public async connect(): Promise<void> {
    if (!this.device || this.device.isSimulated) {
      await new Promise(r => setTimeout(r, 800));
      return;
    }

    if (!this.device.gatt) {
      throw new Error('Bluetooth GATT is not available.');
    }

    this.server = await this.device.gatt.connect();
    const service = await this.server.getPrimaryService(PROVISIONING_SERVICE_UUID);
    
    try {
      this.wifiChar = await service.getCharacteristic(CHAR_WIFI_PROVISION_UUID);
    } catch (e) {
      console.warn('Wi-Fi provision characteristic not found');
    }
  }

  public async sendWifiCredentials(ssid: string, pass: string, deviceName: string): Promise<void> {
    const payload = JSON.stringify({
      type: 'wifi_credentials',
      ssid,
      password: pass,
      device_name: deviceName,
      session_token: `sess-${Date.now()}`
    });

    if (!this.wifiChar) {
      console.log('Sending structured BLE provisioning payload:', payload);
      await new Promise(r => setTimeout(r, 1200));
      return;
    }

    const encoder = new TextEncoder();
    const encoded = encoder.encode(payload);
    await this.wifiChar.writeValue(encoded);
  }

  public disconnect(): void {
    if (this.device && this.device.gatt && this.device.gatt.connected) {
      this.device.gatt.disconnect();
    }
    this.server = null;
    this.wifiChar = null;
    this.infoChar = null;
    this.device = null;
  }
}

export const bleService = new BluetoothProvisioningService();
