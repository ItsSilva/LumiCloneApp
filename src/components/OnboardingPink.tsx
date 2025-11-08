import { motion } from "motion/react";
import { Heart } from "lucide-react";
import { Button } from "./ui/button";

interface OnboardingPinkProps {
  onNext: () => void;
}

export function OnboardingPink({ onNext }: OnboardingPinkProps) {
  return (
    <div className="relative h-full bg-gradient-to-br from-pink-100 via-rose-50 to-purple-50 overflow-hidden p-6 flex flex-col">
      {/* Background elements */}
      <motion.div
        className="absolute top-1/4 right-10 w-48 h-48 bg-pink-400/30 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
        }}
      />

      <div className="flex-1 flex flex-col items-center justify-center z-10">
        {/* Lumi device - PINK */}
        <motion.div
          className="relative w-44 h-44 mb-8"
          animate={{
            y: [0, -12, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {/* Pink glow */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-pink-400 to-rose-600 rounded-full blur-3xl opacity-60"
            animate={{
              scale: [1, 1.4, 1],
              opacity: [0.4, 0.7, 0.4],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
            }}
          />
          
          {/* Device body */}
          <div className="relative w-full h-full bg-gradient-to-br from-white/90 to-gray-100/90 backdrop-blur-xl rounded-full shadow-2xl flex items-center justify-center border border-white/50">
            {/* Pink inner glow */}
            <motion.div
              className="w-28 h-28 rounded-full bg-gradient-to-br from-pink-400 to-rose-600"
              animate={{
                boxShadow: [
                  "0 0 30px rgba(244, 114, 182, 0.5)",
                  "0 0 50px rgba(244, 114, 182, 0.8)",
                  "0 0 30px rgba(244, 114, 182, 0.5)",
                ],
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
              }}
            >
              <div className="w-full h-full flex items-center justify-center">
                <motion.div
                  animate={{
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                  }}
                >
                  <Heart className="w-12 h-12 text-white" fill="white" />
                </motion.div>
              </div>
            </motion.div>
          </div>
          
          {/* Metal loop */}
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-10 border-4 border-gray-300 rounded-t-full shadow-lg" />
        </motion.div>

        {/* Color badge */}
        <motion.div
          className="flex items-center gap-2 bg-pink-500 text-white px-6 py-2 rounded-full mb-6 shadow-lg"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: "spring" }}
        >
          <Heart className="w-5 h-5" />
          <span className="font-medium">Rosa - Pausa Emocional</span>
        </motion.div>

        <motion.div
          className="bg-white/70 backdrop-blur-xl rounded-3xl p-6 max-w-sm border border-white/50 shadow-xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h2 className="text-gray-800 mb-3 text-center">💖 Conéctate contigo</h2>
          <p className="text-sm text-gray-700 text-center mb-4 leading-relaxed">
            El <span className="text-pink-600">rosa</span> te invita a pausar y conectar con tus emociones
          </p>
          
          <div className="bg-pink-50 rounded-2xl p-4 space-y-2">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-pink-600 rounded-full mt-1.5" />
              <p className="text-xs text-gray-600">Te recuerda tomarte un momento para ti</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-pink-600 rounded-full mt-1.5" />
              <p className="text-xs text-gray-600">Sugiere respirar profundo o meditar brevemente</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-pink-600 rounded-full mt-1.5" />
              <p className="text-xs text-gray-600">Fomenta el autocuidado emocional</p>
            </div>
          </div>
        </motion.div>

        <Button 
          className="w-full max-w-xs bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white rounded-full mt-8"
          onClick={onNext}
        >
          Comencemos
        </Button>
      </div>

      {/* Progress indicator */}
      <div className="flex justify-center gap-2 mt-4">
        <div className="w-2 h-2 bg-gray-300 rounded-full" />
        <div className="w-2 h-2 bg-gray-300 rounded-full" />
        <div className="w-2 h-2 bg-gray-300 rounded-full" />
        <div className="w-2 h-2 bg-gray-300 rounded-full" />
        <div className="w-2 h-2 bg-pink-500 rounded-full" />
      </div>
    </div>
  );
}
