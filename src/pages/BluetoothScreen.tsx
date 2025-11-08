import { motion } from "motion/react";
import { Bluetooth, Check } from "lucide-react";
import { Button } from "../components/ui/button";
import { useState, useEffect } from "react";

interface BluetoothScreenProps {
  onNext: () => void;
}

export function BluetoothScreen({ onNext }: BluetoothScreenProps) {
  const [connected, setConnected] = useState(false);
  
  // Auto advance after connection
  useEffect(() => {
    if (connected) {
      const timer = setTimeout(() => {
        onNext();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [connected, onNext]);

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
          {/* Pulse rings */}
          {!connected && (
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
              scale: connected ? [1, 1.1, 1] : 1,
            }}
            transition={{
              duration: 0.5,
            }}
          >
            {/* Glow effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full blur-xl opacity-60"
              animate={{
                opacity: connected ? [0.6, 0.8, 0.6] : 0.4,
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
                  background: connected
                    ? "linear-gradient(135deg, #34D399, #10B981)"
                    : "linear-gradient(135deg, #60A5FA, #A78BFA)",
                }}
                animate={{
                  rotate: connected ? 0 : [0, 360],
                }}
                transition={{
                  duration: 3,
                  repeat: connected ? 0 : Infinity,
                  ease: "linear",
                }}
              >
                {connected && <Check className="w-8 h-8 text-white" />}
              </motion.div>
            </div>
          </motion.div>

          {/* Connection line to phone */}
          {!connected && (
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
          key={connected ? "connected" : "searching"}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-gray-800 mb-2">
            {connected ? "Connected ✨" : "Searching for Lumi..."}
          </h2>
          <p className="text-sm text-gray-500">
            {connected
              ? "Your Lumi is ready to glow"
              : "Make sure your device is nearby"}
          </p>
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

        {/* Action buttons */}
        <div className="space-y-3 w-full max-w-xs">
          {connected ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <p className="text-sm text-center text-gray-600">
                Entering your wellness space...
              </p>
            </motion.div>
          ) : (
            <Button
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full"
              onClick={() => setConnected(true)}
            >
              Connect to Lumi
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
