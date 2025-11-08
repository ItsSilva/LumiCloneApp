// utils/bluetooth.ts
// Bluetooth utilities for connecting to Arduino Nano

export interface BluetoothDevice {
  id: string;
  name: string;
  connected: boolean;
}

declare global {
  interface Navigator {
    // Minimal typing for the Web Bluetooth API used in this file.
    // Expand or refine these types if you need stronger typing for other Bluetooth features.
    bluetooth?: {
      requestDevice: (options?: any) => Promise<any>;
    };
  }
}

// Arduino Nano Bluetooth service UUID (debes configurar esto en tu Arduino)
const ARDUINO_SERVICE_UUID = '0000ffe0-0000-1000-8000-00805f9b34fb';
const ARDUINO_CHARACTERISTIC_UUID = '0000ffe1-0000-1000-8000-00805f9b34fb';

let bluetoothDevice: any = null;
let bluetoothServer: any = null;
let bluetoothService: any = null;
let bluetoothCharacteristic: any = null;

export interface BluetoothConnectionCallbacks {
  onConnected?: (device: BluetoothDevice) => void;
  onDisconnected?: () => void;
  onError?: (error: Error) => void;
  onDataReceived?: (data: string) => void;
}

let callbacks: BluetoothConnectionCallbacks = {};

export function setBluetoothCallbacks(newCallbacks: BluetoothConnectionCallbacks) {
  callbacks = { ...callbacks, ...newCallbacks };
}

// Check if Web Bluetooth is supported
export function isBluetoothSupported(): boolean {
  if (!navigator.bluetooth) {
    console.warn('Web Bluetooth API is not available in this browser.');
    return false;
  }
  return true;
}

// Request Bluetooth device and connect
export async function connectToArduino(): Promise<BluetoothDevice | null> {
  if (!isBluetoothSupported()) {
    const error = new Error('Bluetooth no está soportado en este navegador');
    callbacks.onError?.(error);
    throw error;
  }

  try {
    console.log('Solicitando dispositivo Bluetooth...');
    
    // Ensure navigator.bluetooth is defined (type narrowing for TS)
    const bt = navigator.bluetooth;
    if (!bt) {
      const error = new Error('Web Bluetooth API is not available in this browser.');
      callbacks.onError?.(error);
      throw error;
    }

    // Request device with filters
    bluetoothDevice = await bt.requestDevice({
      filters: [
        { namePrefix: 'Lumi' },
        { namePrefix: 'Arduino' },
        { namePrefix: 'HC-' }, // HC-05 / HC-06 modules
      ],
      optionalServices: [ARDUINO_SERVICE_UUID]
    });

    console.log('Dispositivo seleccionado:', bluetoothDevice.name);

    // Add disconnect listener
    bluetoothDevice.addEventListener('gattserverdisconnected', onDisconnected);

    // Connect to GATT server
    console.log('Conectando al servidor GATT...');
    bluetoothServer = await bluetoothDevice.gatt.connect();
    
    console.log('Obteniendo servicio...');
    bluetoothService = await bluetoothServer.getPrimaryService(ARDUINO_SERVICE_UUID);
    
    console.log('Obteniendo característica...');
    bluetoothCharacteristic = await bluetoothService.getCharacteristic(ARDUINO_CHARACTERISTIC_UUID);
    
    // Subscribe to notifications
    await bluetoothCharacteristic.startNotifications();
    bluetoothCharacteristic.addEventListener('characteristicvaluechanged', handleCharacteristicValueChanged);

    const device: BluetoothDevice = {
      id: bluetoothDevice.id,
      name: bluetoothDevice.name || 'Arduino',
      connected: true,
    };

    console.log('✅ Conexión Bluetooth exitosa');
    callbacks.onConnected?.(device);

    return device;
  } catch (error) {
    console.error('Error conectando a Arduino:', error);
    callbacks.onError?.(error as Error);
    throw error;
  }
}

// Disconnect from device
export async function disconnectFromArduino(): Promise<void> {
  if (bluetoothDevice && bluetoothDevice.gatt.connected) {
    console.log('Desconectando dispositivo Bluetooth...');
    bluetoothDevice.gatt.disconnect();
  }
  
  bluetoothDevice = null;
  bluetoothServer = null;
  bluetoothService = null;
  bluetoothCharacteristic = null;
}

// Check if connected
export function isConnected(): boolean {
  return bluetoothDevice && bluetoothDevice.gatt.connected;
}

// Send data to Arduino
export async function sendToArduino(data: string): Promise<void> {
  if (!bluetoothCharacteristic) {
    throw new Error('No hay conexión con el dispositivo');
  }

  try {
    const encoder = new TextEncoder();
    const dataArray = encoder.encode(data);
    await bluetoothCharacteristic.writeValue(dataArray);
    console.log('Datos enviados:', data);
  } catch (error) {
    console.error('Error enviando datos:', error);
    throw error;
  }
}

// Handle incoming data from Arduino
function handleCharacteristicValueChanged(event: any) {
  const value = event.target.value;
  const decoder = new TextDecoder('utf-8');
  const data = decoder.decode(value);
  
  console.log('Datos recibidos:', data);
  callbacks.onDataReceived?.(data);
}

// Handle disconnection
function onDisconnected() {
  console.log('Dispositivo Bluetooth desconectado');
  callbacks.onDisconnected?.();
  
  bluetoothDevice = null;
  bluetoothServer = null;
  bluetoothService = null;
  bluetoothCharacteristic = null;
}

// Get current device info
export function getCurrentDevice(): BluetoothDevice | null {
  if (!bluetoothDevice) return null;
  
  return {
    id: bluetoothDevice.id,
    name: bluetoothDevice.name || 'Arduino',
    connected: bluetoothDevice.gatt?.connected || false,
  };
}

// Reconnect to previously connected device
export async function reconnectToArduino(): Promise<BluetoothDevice | null> {
  if (!bluetoothDevice) {
    throw new Error('No hay dispositivo previo para reconectar');
  }

  try {
    console.log('Reconectando...');
    bluetoothServer = await bluetoothDevice.gatt.connect();
    bluetoothService = await bluetoothServer.getPrimaryService(ARDUINO_SERVICE_UUID);
    bluetoothCharacteristic = await bluetoothService.getCharacteristic(ARDUINO_CHARACTERISTIC_UUID);
    
    await bluetoothCharacteristic.startNotifications();
    bluetoothCharacteristic.addEventListener('characteristicvaluechanged', handleCharacteristicValueChanged);

    const device: BluetoothDevice = {
      id: bluetoothDevice.id,
      name: bluetoothDevice.name || 'Arduino',
      connected: true,
    };

    callbacks.onConnected?.(device);
    return device;
  } catch (error) {
    console.error('Error reconectando:', error);
    callbacks.onError?.(error as Error);
    throw error;
  }
}