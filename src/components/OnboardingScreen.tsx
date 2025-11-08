import { motion } from "motion/react";
import { Droplet, Sun, Leaf, Heart } from "lucide-react";
import { Button } from "./ui/button";

interface OnboardingScreenProps {
  onNext: () => void;
}

export function OnboardingScreen({ onNext }: OnboardingScreenProps) {
  return (
    <div className="relative h-full bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 overflow-hidden p-6 flex flex-col">
      {/* Background blur circles */}
      <motion.div
        className="absolute top-20 left-10 w-40 h-40 bg-blue-300/30 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute bottom-20 right-10 w-40 h-40 bg-purple-300/30 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.3, 0.4, 0.3],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
      />

      <div className="flex-1 flex flex-col items-center justify-center z-10">
        {/* Lumi device illustration */}
        <motion.div
          className="relative w-32 h-32 mb-8"
          animate={{
            y: [0, -8, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {/* Outer glow */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-blue-400 via-yellow-400 to-green-400 rounded-full blur-2xl opacity-50"
            animate={{
              scale: [1, 1.3, 1],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "linear",
            }}
          />
          
          {/* Device body */}
          <div className="relative w-full h-full bg-gradient-to-br from-white/90 to-gray-100/90 backdrop-blur-xl rounded-full shadow-2xl flex items-center justify-center border border-white/50">
            {/* Inner glow ring */}
            <motion.div
              className="w-20 h-20 rounded-full"
              style={{
                background: "linear-gradient(135deg, #60A5FA, #FBBF24, #34D399)",
              }}
              animate={{
                rotate: [0, 360],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "linear",
              }}
            />
          </div>
          
          {/* Metal loop */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-8 border-4 border-gray-300 rounded-t-full" />
        </motion.div>

        <motion.h1
          className="text-center mb-3 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          Welcome to Lumi
        </motion.h1>

        <motion.p
          className="text-center text-gray-600 mb-8 max-w-xs"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          Your light of self-care
        </motion.p>

        {/* Color meanings */}
        <div className="space-y-4 w-full max-w-xs mb-8">
          <motion.div
            className="flex items-center gap-3 bg-white/60 backdrop-blur-md rounded-2xl p-3 border border-white/50"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <div className="w-10 h-10 bg-blue-400 rounded-full flex items-center justify-center">
              <Droplet className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-700">Blue = Hydration reminder</p>
            </div>
          </motion.div>

          <motion.div
            className="flex items-center gap-3 bg-white/60 backdrop-blur-md rounded-2xl p-3 border border-white/50"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
          >
            <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center">
              <Sun className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-700">Yellow = Need for rest or energy</p>
            </div>
          </motion.div>

          <motion.div
            className="flex items-center gap-3 bg-white/60 backdrop-blur-md rounded-2xl p-3 border border-white/50"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 }}
          >
            <div className="w-10 h-10 bg-green-400 rounded-full flex items-center justify-center">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-700">Green = Balance achieved</p>
            </div>
          </motion.div>

          <motion.div
            className="flex items-center gap-3 bg-white/60 backdrop-blur-md rounded-2xl p-3 border border-white/50"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.9 }}
          >
            <div className="w-10 h-10 bg-pink-400 rounded-full flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-700">Pink = Emotional pause</p>
            </div>
          </motion.div>
        </div>

        <Button 
          className="w-full max-w-xs bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-full"
          onClick={onNext}
        >
          Get Started
        </Button>
      </div>
    </div>
  );
}
