import { motion } from "motion/react";
import { Droplet, Sun, Flower2, Plus } from "lucide-react";
import { useUser } from "../contexts/UserContext";
import { Button } from "./ui/button";
import { useState, useEffect } from "react";

export function DashboardScreen() {
  const { nutritionalNeeds, waterGlasses, addWater, getTotalIntake, mealIntakes } = useUser();
  const [isAddingWater, setIsAddingWater] = useState(false);

  const totalIntake = getTotalIntake();
  
  // Calculate percentages
  const waterPercentage = nutritionalNeeds 
    ? Math.round((waterGlasses / nutritionalNeeds.dailyWater) * 100) 
    : 0;
  
  const proteinPercentage = nutritionalNeeds 
    ? Math.round((totalIntake.protein / nutritionalNeeds.dailyProtein) * 100) 
    : 0;
  
  const fiberPercentage = nutritionalNeeds 
    ? Math.round((totalIntake.fiber / nutritionalNeeds.dailyFiber) * 100) 
    : 0;

  const nutritionPercentage = Math.round((proteinPercentage + fiberPercentage) / 2);

  // Calculate total balance
  const totalBalance = Math.round((waterPercentage + nutritionPercentage) / 2);

  // Determine Lumi color based on status
  const getLumiColor = () => {
    const waterMet = waterPercentage >= 80;
    const proteinMet = proteinPercentage >= 80;
    const fiberMet = fiberPercentage >= 80;

    // Amarillo pastel - todo perfecto
    if (waterMet && proteinMet && fiberMet) {
      return {
        gradient: "linear-gradient(135deg, #FDE68A, #FCD34D)",
        shadow: "rgba(253, 230, 138, 0.6)",
        message: "¡Todo está perfecto!",
      };
    }

    // Verde - nutrición balanceada
    if (proteinMet && fiberMet) {
      return {
        gradient: "linear-gradient(135deg, #34D399, #10B981)",
        shadow: "rgba(52, 211, 153, 0.6)",
        message: "Nutrición balanceada",
      };
    }

    // Azul - necesita hidratación
    if (!waterMet) {
      return {
        gradient: "linear-gradient(135deg, #60A5FA, #3B82F6)",
        shadow: "rgba(96, 165, 250, 0.6)",
        message: "Hidrátate",
      };
    }

    // Naranja - falta nutrición
    return {
      gradient: "linear-gradient(135deg, #FB923C, #F97316)",
      shadow: "rgba(251, 146, 60, 0.6)",
      message: "Mejora tu nutrición",
    };
  };

  const lumiStatus = getLumiColor();

  const handleAddWater = async () => {
    setIsAddingWater(true);
    await addWater(1);
    setTimeout(() => setIsAddingWater(false), 300);
  };

  // Count balanced meals
  const balancedMealsCount = Object.values(mealIntakes).filter(meal => {
    if (!nutritionalNeeds) return false;
    const proteinOk = meal.protein >= nutritionalNeeds.proteinPerMeal * 0.8;
    const fiberOk = meal.fiber >= nutritionalNeeds.fiberPerMeal * 0.8;
    return proteinOk && fiberOk;
  }).length;

  return (
    <div className="relative h-full bg-gradient-to-br from-blue-50 via-yellow-50 to-green-50 overflow-hidden p-6 flex flex-col">
      {/* Background ambiance */}
      <motion.div
        className="absolute top-20 right-10 w-40 h-40 bg-yellow-300/20 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.3, 1],
          x: [0, 20, 0],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
        }}
      />

      {/* Header */}
      <div className="mb-6">
        <p className="text-sm text-gray-500">Balance de hoy</p>
        <h2 className="text-gray-800">{lumiStatus.message}</h2>
      </div>

      {/* Central Lumi ring - real-time color */}
      <div className="flex items-center justify-center mb-8">
        <div className="relative">
          {/* Outer pulse */}
          <motion.div
            className="absolute inset-0 w-40 h-40 -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2 rounded-full"
            style={{
              background: `radial-gradient(circle, ${lumiStatus.shadow} 0%, transparent 70%)`,
            }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 0.8, 0.5],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          {/* Main ring */}
          <div className="relative w-40 h-40 bg-white/80 backdrop-blur-xl rounded-full shadow-2xl flex items-center justify-center border-4 border-white/50">
            {/* Gradient ring */}
            <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
              <defs>
                <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#60A5FA" />
                  <stop offset="50%" stopColor="#FBBF24" />
                  <stop offset="100%" stopColor="#34D399" />
                </linearGradient>
              </defs>
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="url(#progressGradient)"
                strokeWidth="4"
                strokeDasharray="283"
                strokeDashoffset={283 - (283 * totalBalance) / 100}
                strokeLinecap="round"
              />
            </svg>

            {/* Center glow */}
            <motion.div
              className="w-24 h-24 rounded-full flex items-center justify-center"
              style={{
                background: lumiStatus.gradient,
              }}
              animate={{
                boxShadow: [
                  `0 0 20px ${lumiStatus.shadow}`,
                  `0 0 40px ${lumiStatus.shadow}`,
                  `0 0 20px ${lumiStatus.shadow}`,
                ],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
              }}
            >
              <span className="text-white">{totalBalance}%</span>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Habit cards */}
      <div className="space-y-3 flex-1">
        {/* Hydration card */}
        <motion.div
          className="bg-white/70 backdrop-blur-xl rounded-2xl p-4 border border-white/50 shadow-lg"
          whileHover={{ scale: 1.02, y: -2 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-500 rounded-2xl flex items-center justify-center shadow-md">
                <Droplet className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-gray-800">Hidratación</p>
                <p className="text-xs text-gray-500">
                  {waterGlasses} de {nutritionalNeeds?.dailyWater || 8} vasos
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <p className="text-sm text-blue-600">{waterPercentage}%</p>
              <motion.div
                whileTap={{ scale: 0.9 }}
                animate={isAddingWater ? { scale: [1, 1.2, 1] } : {}}
              >
                <Button
                  size="sm"
                  className="h-8 w-8 p-0 rounded-full bg-blue-500 hover:bg-blue-600"
                  onClick={handleAddWater}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </motion.div>
            </div>
          </div>
          <div className="relative h-2 bg-blue-100 rounded-full overflow-hidden">
            <motion.div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-400 to-blue-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(waterPercentage, 100)}%` }}
              transition={{ duration: 1, delay: 0.2 }}
            />
          </div>
        </motion.div>

        {/* Nutrition card */}
        <motion.div
          className="bg-white/70 backdrop-blur-xl rounded-2xl p-4 border border-white/50 shadow-lg"
          whileHover={{ scale: 1.02, y: -2 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center shadow-md">
                <motion.div
                  animate={{
                    rotate: [0, 5, -5, 0],
                    scale: [1, 1.05, 1],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                  }}
                >
                  <Flower2 className="w-6 h-6 text-white" />
                </motion.div>
              </div>
              <div>
                <p className="text-gray-800">Nutrición</p>
                <p className="text-xs text-gray-500">{balancedMealsCount} comidas balanceadas</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-green-600">{nutritionPercentage}%</p>
            </div>
          </div>
          <div className="relative h-2 bg-green-100 rounded-full overflow-hidden">
            <motion.div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(nutritionPercentage, 100)}%` }}
              transition={{ duration: 1, delay: 0.4 }}
            />
          </div>

          {/* Mini breakdown */}
          <div className="mt-3 pt-3 border-t border-gray-200 grid grid-cols-2 gap-2">
            <div className="text-xs">
              <span className="text-gray-500">Proteína: </span>
              <span className="text-gray-700">
                {totalIntake.protein}g / {nutritionalNeeds?.dailyProtein || 0}g
              </span>
            </div>
            <div className="text-xs">
              <span className="text-gray-500">Fibra: </span>
              <span className="text-gray-700">
                {totalIntake.fiber}g / {nutritionalNeeds?.dailyFiber || 0}g
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Quick tip */}
      <motion.div
        className="mt-4 bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl p-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <p className="text-xs text-purple-700 text-center">
          💡 Tip: Registra tus comidas en la pestaña de Nutrición para ver tu progreso completo
        </p>
      </motion.div>
    </div>
  );
}
