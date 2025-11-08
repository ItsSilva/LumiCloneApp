import { motion } from "motion/react";
import { Bluetooth, Check, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "../components/ui/button";
import { useState, useEffect } from "react";
import {
  connectToArduino,
  disconnectFromArduino,
  isBluetoothSupported,
  setBluetoothCallbacks,
  BluetoothDevice,
} from "../utils/bluetooth";

interface BluetoothScreenProps {
  onNext: () => void;
}

type ConnectionState = "idle" | "searching" | "connecting" | "connected" | "error";

export function BluetoothScreen({ onNext }: BluetoothScreenProps) {
  const [connectionState, setConnectionState] = useState<ConnectionState>("idle");
  const [connectedDevice, setConnectedDevice] = useState<BluetoothDevice | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [bluetoothAvailable, setBluetoothAvailable] = useState(true);

  // Check Bluetooth support on mount
  useEffect(() => {
    setBluetoothAvailable(isBluetoothSupported());
  }, []);

  // Setup Bluetooth callbacks
  useEffect(() => {
    setBluetoothCallbacks({
      onConnected: (device) => {
        console.log("Connected to device:", device);
        setConnectedDevice(device);
        setConnectionState("connected");
        setError(null);
      },
      onDisconnected: () => {
        console.log("Device disconnected");
        setConnectionState("idle");
        setConnectedDevice(null);
      },
      onError: (err) => {
        console.error("Bluetooth error:", err);
        setError(err.message);
        setConnectionState("error");
      },
    });
  }, []);

  // Auto advance after successful connection
  useEffect(() => {
    if (connectionState === "connected") {
      const timer = setTimeout(() => {
        onNext();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [connectionState, onNext]);

  const handleConnect = async () => {
    setConnectionState("searching");
    setError(null);

    try {
      await connectToArduino();
      setConnectionState("connecting");
    } catch (err) {
      console.error("Connection error:", err);
      setError((err as Error).message);
      setConnectionState("error");
    }
  };

  const handleDisconnect = async () => {
    await disconnectFromArduino();
    setConnectionState("idle");
    setConnectedDevice(null);
  };

  const handleSkip = () => {
    onNext();
  };

  const getStatusText = () => {
    switch (connectionState) {
      case "idle":
        return "Ready to connect";
      case "searching":
        return "Searching for devices...";
      case "connecting":
        return "Connecting to Lumi...";
      case "connected":
        return "Connected ✨";
      case "error":
        return "Connection failed";
      default:
        return "";
    }
  };

  const getStatusSubtext = () => {
    switch (connectionState) {
      case "idle":
        return "Make sure your Lumi is nearby and powered on";
      case "searching":
        return "Select your device from the list";
      case "connecting":
        return "Establishing secure connection...";
      case "connected":
        return connectedDevice ? `Connected to ${connectedDevice.name}` : "Your Lumi is ready to glow";
      case "error":
        return error || "Please try again";
      default:
        return "";
    }
  };

  return (
    <div className="relative h-full bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 overflow-hidden p-6 flex flex-col">
      {/* Animated background */}
      <motion.div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 w-48 h-48 bg-blue-400/20 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
        }}
      />

      <div className="flex-1 flex flex-col items-center justify-center z-10">
        {/* Connection animation */}
        <div className="relative mb-8">
          {/* Pulse rings - only show when searching/connecting */}
          {(connectionState === "searching" || connectionState === "connecting") && (
            <>
              <motion.div
                className="absolute inset-0 w-48 h-48 -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2 border-2 border-blue-400/30 rounded-full"
                animate={{
                  scale: [1, 1.5, 2],
                  opacity: [0.5, 0.2, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeOut",
                }}
              />
              <motion.div
                className="absolute inset-0 w-48 h-48 -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2 border-2 border-blue-400/30 rounded-full"
                animate={{
                  scale: [1, 1.5, 2],
                  opacity: [0.5, 0.2, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeOut",
                  delay: 0.7,
                }}
              />
            </>
          )}

          {/* Device illustration */}
          <motion.div
            className="relative w-32 h-32"
            animate={{
              scale: connectionState === "connected" ? [1, 1.1, 1] : 1,
            }}
            transition={{
              duration: 0.5,
            }}
          >
            {/* Glow effect */}
            <motion.div
              className={`absolute inset-0 rounded-full blur-xl ${
                connectionState === "connected"
                  ? "bg-gradient-to-br from-green-400 to-emerald-500"
                  : connectionState === "error"
                  ? "bg-gradient-to-br from-red-400 to-rose-500"
                  : "bg-gradient-to-br from-blue-400 to-purple-500"
              }`}
              animate={{
                opacity: connectionState === "connected" ? [0.6, 0.8, 0.6] : 0.4,
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
              }}
            />

            {/* Device */}
            <div className="relative w-full h-full bg-white/90 backdrop-blur-xl rounded-full shadow-2xl flex items-center justify-center border-2 border-white/50">
              <motion.div
                className="w-20 h-20 rounded-full flex items-center justify-center"
                style={{
                  background:
                    connectionState === "connected"
                      ? "linear-gradient(135deg, #34D399, #10B981)"
                      : connectionState === "error"
                      ? "linear-gradient(135deg, #F87171, #EF4444)"
                      : "linear-gradient(135deg, #60A5FA, #A78BFA)",
                }}
                animate={{
                  rotate:
                    connectionState === "searching" || connectionState === "connecting"
                      ? [0, 360]
                      : 0,
                }}
                transition={{
                  duration: 3,
                  repeat:
                    connectionState === "searching" || connectionState === "connecting"
                      ? Infinity
                      : 0,
                  ease: "linear",
                }}
              >
                {connectionState === "connected" && <Check className="w-8 h-8 text-white" />}
                {connectionState === "error" && <AlertCircle className="w-8 h-8 text-white" />}
                {(connectionState === "searching" || connectionState === "connecting") && (
                  <Loader2 className="w-8 h-8 text-white animate-spin" />
                )}
              </motion.div>
            </div>
          </motion.div>

          {/* Connection line to phone */}
          {(connectionState === "searching" || connectionState === "connecting") && (
            <motion.div
              className="absolute -bottom-16 left-1/2 -translate-x-1/2 w-0.5 h-12 bg-gradient-to-b from-blue-400 to-transparent"
              animate={{
                opacity: [0.3, 0.7, 0.3],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
              }}
            />
          )}
        </div>

        {/* Status text */}
        <motion.div
          className="text-center mb-8"
          key={connectionState}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-gray-800 mb-2">{getStatusText()}</h2>
          <p className="text-sm text-gray-500">{getStatusSubtext()}</p>
        </motion.div>

        {/* Phone icon */}
        <motion.div
          className="w-16 h-16 bg-white/80 backdrop-blur-md rounded-2xl flex items-center justify-center border border-gray-200 shadow-lg mb-8"
          animate={{
            y: [0, -4, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
          }}
        >
          <Bluetooth className="w-8 h-8 text-blue-500" />
        </motion.div>

        {/* Warning message if Bluetooth not supported */}
        {!bluetoothAvailable && (
          <motion.div
            className="bg-yellow-100 border border-yellow-300 rounded-lg p-4 mb-4 max-w-xs"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <p className="text-sm text-yellow-800 text-center">
              Bluetooth no está disponible en este navegador. Puedes continuar sin conectar tu
              dispositivo.
            </p>
          </motion.div>
        )}

        {/* Error message */}
        {connectionState === "error" && error && (
          <motion.div
            className="bg-red-100 border border-red-300 rounded-lg p-4 mb-4 max-w-xs"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <p className="text-sm text-red-800 text-center">{error}</p>
          </motion.div>
        )}

        {/* Action buttons */}
        <div className="space-y-3 w-full max-w-xs">
          {connectionState === "connected" ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-3"
            >
              <p className="text-sm text-center text-gray-600">
                Entering your wellness space...
              </p>
              <Button
                className="w-full bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-full"
                onClick={handleDisconnect}
                variant="outline"
              >
                Disconnect
              </Button>
            </motion.div>
          ) : connectionState === "searching" || connectionState === "connecting" ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <p className="text-sm text-center text-gray-600 mb-3">
                Searching for your Lumi device...
              </p>
              <Button
                className="w-full bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-full"
                onClick={() => setConnectionState("idle")}
                variant="outline"
              >
                Cancel
              </Button>
            </motion.div>
          ) : (
            <>
              <Button
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full"
                onClick={handleConnect}
                disabled={!bluetoothAvailable}
              >
                <Bluetooth className="w-5 h-5 mr-2" />
                Connect to Lumi
              </Button>
              <Button
                className="w-full bg-white/80 backdrop-blur-md text-gray-700 rounded-full border border-gray-200"
                onClick={handleSkip}
                variant="outline"
              >
                Skip for now
              </Button>
            </>
          )}
        </div>

        {/* Help text */}
        <p className="text-xs text-gray-400 text-center mt-4 max-w-xs">
          You can connect your Lumi device later from Settings
        </p>
      </div>
    </div>
  );
}