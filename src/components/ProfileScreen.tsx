import { motion } from "motion/react";
import { User, Activity, Award, Flame, Calendar, TrendingUp } from "lucide-react";
import { useUser } from "../contexts/UserContext";

export function ProfileScreen() {
  const { profile, nutritionalNeeds, getCurrentStreak, getLongestStreak, dailyHistory } = useUser();

  if (!profile || !nutritionalNeeds) {
    return (
      <div className="relative h-full bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 overflow-hidden p-6 flex items-center justify-center">
        <p className="text-gray-500 text-center">
          Por favor completa tu perfil primero
        </p>
      </div>
    );
  }

  const currentStreak = getCurrentStreak();
  const longestStreak = getLongestStreak();

  const activityLabels = {
    sedentary: "Sedentario",
    light: "Ligeramente activo",
    moderate: "Moderadamente activo",
    very: "Muy activo",
  };

  const genderLabels = {
    male: "Masculino",
    female: "Femenino",
    other: "Otro",
  };

  // Get last 7 days for visual
  const last7Days = dailyHistory.slice(-7);

  return (
    <div className="relative h-full bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 overflow-hidden p-6 flex flex-col">
      {/* Background elements */}
      <motion.div
        className="absolute top-1/4 right-10 w-40 h-40 bg-purple-300/20 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.2, 0.3, 0.2],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
        }}
      />

      {/* Header */}
      <div className="mb-6">
        <motion.div
          className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-2xl flex items-center justify-center mb-4"
          animate={{
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
          }}
        >
          <User className="w-6 h-6 text-white" />
        </motion.div>
        <h2 className="text-gray-800 mb-1">Tu Perfil</h2>
        <p className="text-sm text-gray-500">Información y progreso</p>
      </div>

      <div className="flex-1 overflow-auto space-y-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {/* User Info Card */}
        <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-5 border border-white/50">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-gray-800 mb-1">{profile.name || "Usuario"}</h3>
              <p className="text-sm text-gray-500">{genderLabels[profile.gender]} · {profile.age} años</p>
            </div>
            <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-500 rounded-2xl flex items-center justify-center">
              <span className="text-white text-xl">{profile.name ? profile.name[0].toUpperCase() : "U"}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-3">
              <p className="text-xs text-blue-600 mb-1">Peso</p>
              <p className="text-lg text-blue-900">{profile.weight} kg</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-3">
              <p className="text-xs text-green-600 mb-1">Altura</p>
              <p className="text-lg text-green-900">{profile.height} cm</p>
            </div>
          </div>
        </div>

        {/* Nutritional Goals Card */}
        <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-5 border border-white/50">
          <div className="flex items-center gap-2 mb-3">
            <Activity className="w-4 h-4 text-purple-500" />
            <h3 className="text-gray-800">Metas Nutricionales</h3>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Proteína diaria</span>
              <span className="text-sm text-blue-600">{nutritionalNeeds.dailyProtein}g</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Fibra diaria</span>
              <span className="text-sm text-green-600">{nutritionalNeeds.dailyFiber}g</span>
            </div>
            <div className="h-px bg-gray-200" />
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Nivel de actividad</span>
              <span className="text-xs text-gray-500">{activityLabels[profile.activityLevel]}</span>
            </div>
          </div>
        </div>

        {/* Streaks Card - Main Feature */}
        <motion.div
          className="bg-gradient-to-br from-orange-400 to-pink-500 rounded-2xl p-5 border border-white/50 shadow-xl overflow-hidden relative"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          {/* Animated background */}
          <motion.div
            className="absolute inset-0 opacity-20"
            style={{
              background: "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.5) 0%, transparent 70%)",
            }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.2, 0.3, 0.2],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
            }}
          />

          <div className="relative">
            <div className="flex items-center gap-2 mb-4">
              <Flame className="w-5 h-5 text-white" />
              <h3 className="text-white">Racha de Balance</h3>
            </div>

            <div className="flex items-end gap-6 mb-4">
              <div>
                <p className="text-white/80 text-xs mb-1">Racha actual</p>
                <div className="flex items-baseline gap-1">
                  <motion.span
                    className="text-5xl text-white"
                    key={currentStreak}
                    initial={{ scale: 1.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 200 }}
                  >
                    {currentStreak}
                  </motion.span>
                  <span className="text-white/80 text-sm mb-1">días</span>
                </div>
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-1 mb-2">
                  <Award className="w-4 h-4 text-yellow-200" />
                  <p className="text-white/80 text-xs">Mejor racha</p>
                </div>
                <p className="text-white text-xl">{longestStreak} días</p>
              </div>
            </div>

            {/* Last 7 days visualization */}
            <div className="space-y-2">
              <div className="flex items-center gap-1 text-white/80 text-xs">
                <Calendar className="w-3 h-3" />
                <span>Últimos 7 días</span>
              </div>
              <div className="flex gap-1.5">
                {last7Days.map((day, index) => (
                  <motion.div
                    key={day.date}
                    className={`flex-1 h-12 rounded-lg ${
                      day.isBalanced
                        ? "bg-white/90"
                        : "bg-white/20"
                    } flex items-center justify-center`}
                    initial={{ scaleY: 0, opacity: 0 }}
                    animate={{ scaleY: 1, opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    {day.isBalanced && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.3 + index * 0.05 }}
                      >
                        <Flame className="w-4 h-4 text-orange-500" />
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </div>
              <div className="flex justify-between text-white/60 text-xs">
                <span>Hace 7d</span>
                <span>Hoy</span>
              </div>
            </div>

            {/* Motivational message */}
            <motion.div
              className="mt-4 bg-white/20 backdrop-blur-sm rounded-xl p-3"
              animate={{
                opacity: [0.8, 1, 0.8],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
              }}
            >
              <p className="text-white text-sm text-center">
                {currentStreak === 0 && "¡Comienza tu racha hoy! 🌟"}
                {currentStreak > 0 && currentStreak < 3 && "¡Sigue así! Cada día cuenta 💪"}
                {currentStreak >= 3 && currentStreak < 7 && "¡Excelente progreso! 🔥"}
                {currentStreak >= 7 && currentStreak < 14 && "¡Una semana completa! Eres increíble 🌸"}
                {currentStreak >= 14 && "¡Imparable! Tu luz brilla intensamente ✨"}
              </p>
            </motion.div>
          </div>
        </motion.div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 gap-3">
          <motion.div
            className="bg-white/70 backdrop-blur-xl rounded-2xl p-4 border border-white/50"
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-500 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-white" />
              </div>
              <span className="text-xs text-gray-600">Días balanceados</span>
            </div>
            <p className="text-2xl text-gray-800">
              {dailyHistory.filter((d) => d.isBalanced).length}
            </p>
            <p className="text-xs text-gray-400">de {dailyHistory.length} registrados</p>
          </motion.div>

          <motion.div
            className="bg-white/70 backdrop-blur-xl rounded-2xl p-4 border border-white/50"
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-purple-500 rounded-lg flex items-center justify-center">
                <Activity className="w-4 h-4 text-white" />
              </div>
              <span className="text-xs text-gray-600">Tasa de éxito</span>
            </div>
            <p className="text-2xl text-gray-800">
              {Math.round((dailyHistory.filter((d) => d.isBalanced).length / dailyHistory.length) * 100)}%
            </p>
            <p className="text-xs text-gray-400">últimos 14 días</p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
