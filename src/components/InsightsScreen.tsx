import { motion } from "motion/react";
import { TrendingUp, Sparkles } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";

const weekData = [
  { day: "Mon", hydration: 75, energy: 60, nutrition: 80 },
  { day: "Tue", hydration: 85, energy: 70, nutrition: 65 },
  { day: "Wed", hydration: 70, energy: 85, nutrition: 90 },
  { day: "Thu", hydration: 90, energy: 75, nutrition: 75 },
  { day: "Fri", hydration: 80, energy: 80, nutrition: 85 },
  { day: "Sat", hydration: 95, energy: 90, nutrition: 95 },
  { day: "Sun", hydration: 85, energy: 85, nutrition: 80 },
];

export function InsightsScreen() {
  return (
    <div className="relative h-full bg-gradient-to-br from-purple-50 via-blue-50 to-green-50 overflow-hidden p-6 flex flex-col">
      {/* Background elements */}
      <motion.div
        className="absolute top-1/3 right-10 w-40 h-40 bg-purple-300/20 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          x: [0, -10, 0],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
        }}
      />

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="w-5 h-5 text-purple-500" />
          <h2 className="text-gray-800">Weekly Insights</h2>
        </div>
        <p className="text-sm text-gray-500">Your balance journey</p>
      </div>

      {/* Summary card */}
      <motion.div
        className="bg-gradient-to-br from-purple-400 to-blue-500 rounded-2xl p-5 mb-6 shadow-xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-white/80 text-sm mb-1">This week's average</p>
            <p className="text-white text-2xl">82%</p>
          </div>
          <motion.div
            animate={{
              rotate: [0, 10, -10, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
            }}
          >
            <Sparkles className="w-6 h-6 text-yellow-300" />
          </motion.div>
        </div>
        <p className="text-white/90 text-sm">Your balance garden is thriving 🌿</p>
      </motion.div>

      {/* Chart */}
      <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-4 border border-white/50 mb-4 flex-1">
        <p className="text-sm text-gray-600 mb-4">Overall Balance</p>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={weekData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#A78BFA" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#A78BFA" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="day"
              stroke="#9CA3AF"
              fontSize={10}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#9CA3AF"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              domain={[0, 100]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(255, 255, 255, 0.9)",
                border: "none",
                borderRadius: "12px",
                fontSize: "12px",
              }}
            />
            <Area
              type="monotone"
              dataKey="hydration"
              stroke="#60A5FA"
              strokeWidth={2}
              fill="url(#balanceGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Color-coded timeline */}
      <div className="space-y-3">
        <p className="text-xs text-gray-500">Daily highlights</p>
        
        <div className="flex gap-1">
          {weekData.map((day, index) => {
            const avg = (day.hydration + day.energy + day.nutrition) / 3;
            let color = "bg-yellow-400";
            if (avg >= 85) color = "bg-green-400";
            else if (avg < 70) color = "bg-blue-400";

            return (
              <motion.div
                key={day.day}
                className="flex-1"
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className={`h-16 ${color} rounded-lg relative overflow-hidden`}>
                  <motion.div
                    className="absolute inset-0 bg-white/20"
                    animate={{
                      y: ["100%", "-100%"],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "linear",
                      delay: index * 0.2,
                    }}
                  />
                </div>
                <p className="text-xs text-center text-gray-500 mt-1">{day.day}</p>
              </motion.div>
            );
          })}
        </div>

        <div className="flex items-center justify-center gap-4 mt-4">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-blue-400 rounded-full" />
            <p className="text-xs text-gray-500">Hydration</p>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-yellow-400 rounded-full" />
            <p className="text-xs text-gray-500">Energy</p>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-400 rounded-full" />
            <p className="text-xs text-gray-500">Balanced</p>
          </div>
        </div>
      </div>
    </div>
  );
}
