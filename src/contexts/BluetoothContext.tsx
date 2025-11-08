import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import {
  connectToArduino,
  disconnectFromArduino,
  isConnected,
  sendToArduino,
  setBluetoothCallbacks,
  getCurrentDevice,
  reconnectToArduino,
  BluetoothDevice,
} from "../utils/bluetooth";

interface BluetoothContextType {
  device: BluetoothDevice | null;
  isConnected: boolean;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  reconnect: () => Promise<void>;
  sendData: (data: string) => Promise<void>;
  lastReceivedData: string | null;
}

const BluetoothContext = createContext<BluetoothContextType | undefined>(undefined);

export function BluetoothProvider({ children }: { children: ReactNode }) {
  const [device, setDevice] = useState<BluetoothDevice | null>(null);
  const [connected, setConnected] = useState(false);
  const [lastReceivedData, setLastReceivedData] = useState<string | null>(null);

  useEffect(() => {
    // Setup callbacks
    setBluetoothCallbacks({
      onConnected: (dev) => {
        setDevice(dev);
        setConnected(true);
        console.log("Bluetooth connected:", dev);
      },
      onDisconnected: () => {
        setDevice(null);
        setConnected(false);
        console.log("Bluetooth disconnected");
      },
      onError: (error) => {
        console.error("Bluetooth error:", error);
        setConnected(false);
      },
      onDataReceived: (data) => {
        setLastReceivedData(data);
        console.log("Data received from Arduino:", data);
      },
    });

    // Check if already connected on mount
    const currentDevice = getCurrentDevice();
    if (currentDevice && currentDevice.connected) {
      setDevice(currentDevice);
      setConnected(true);
    }
  }, []);

  const connect = async () => {
    try {
      const connectedDevice = await connectToArduino();
      if (connectedDevice) {
        setDevice(connectedDevice);
        setConnected(true);
      }
    } catch (error) {
      console.error("Failed to connect:", error);
      throw error;
    }
  };

  const disconnect = async () => {
    try {
      await disconnectFromArduino();
      setDevice(null);
      setConnected(false);
    } catch (error) {
      console.error("Failed to disconnect:", error);
      throw error;
    }
  };

  const reconnect = async () => {
    try {
      const reconnectedDevice = await reconnectToArduino();
      if (reconnectedDevice) {
        setDevice(reconnectedDevice);
        setConnected(true);
      }
    } catch (error) {
      console.error("Failed to reconnect:", error);
      throw error;
    }
  };

  const sendData = async (data: string) => {
    try {
      await sendToArduino(data);
    } catch (error) {
      console.error("Failed to send data:", error);
      throw error;
    }
  };

  return (
    <BluetoothContext.Provider
      value={{
        device,
        isConnected: connected,
        connect,
        disconnect,
        reconnect,
        sendData,
        lastReceivedData,
      }}
    >
      {children}
    </BluetoothContext.Provider>
  );
}

export function useBluetooth() {
  const context = useContext(BluetoothContext);
  if (context === undefined) {
    throw new Error("useBluetooth must be used within a BluetoothProvider");
  }
  return context;
}