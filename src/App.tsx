import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { AuthScreen } from "./pages/AuthScreen";
import { OnboardingFlow } from "./pages/OnboardingFlow";
import { ProfileSetupScreen } from "./pages/ProfileSetupScreen";
import { BluetoothScreen } from "./pages/BluetoothScreen";
import { DashboardScreen } from "./pages/DashboardScreen";
import { NutritionScreen } from "./pages/NutritionScreen";
import { ProfileScreen } from "./pages/ProfileScreen";
import { HydrationAlertScreen } from "./pages/HydrationAlertScreen";
import { Home, Apple, User } from "lucide-react";
import { UserProvider, useUser } from "./contexts/UserContext";
import { registerServiceWorker, initPWAInstallPrompt } from "./utils/pwa";

type Screen = "auth" | "onboarding" | "profile" | "bluetooth" | "dashboard" | "nutrition" | "userprofile" | "hydration-alert";

function AppContent() {
  const { userId, setAuth } = useUser();
  const [currentScreen, setCurrentScreen] = useState<Screen>(userId ? "dashboard" : "auth");
  const [mainTab, setMainTab] = useState<"dashboard" | "nutrition" | "userprofile">("dashboard");
  const [showHydrationAlert, setShowHydrationAlert] = useState(false);

  const handleNext = (nextScreen: Screen) => {
    setCurrentScreen(nextScreen);
  };

  const handleTabChange = (tab: "dashboard" | "nutrition" | "insights") => {
    setMainTab(tab);
  };

  const handleAuthSuccess = (userId: string, accessToken: string, name: string) => {
    setAuth(userId, accessToken, name);
    setCurrentScreen("onboarding");
  };

  // Screen variants for animations
  const screenVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? "100%" : "-100%",
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction > 0 ? "-100%" : "100%",
      opacity: 0,
    }),
  };

  const handleDismissHydrationAlert = () => {
    setShowHydrationAlert(false);
  };

  const handleSnoozeHydrationAlert = () => {
    setShowHydrationAlert(false);
    // Simular que la alarma volverá a sonar en 10 minutos
    setTimeout(() => {
      setShowHydrationAlert(true);
    }, 600000); // 10 minutos en milisegundos
  };

  const renderCurrentScreen = () => {
    // Hydration alert overlay - highest priority
    if (showHydrationAlert) {
      return (
        <HydrationAlertScreen
          onDismiss={handleDismissHydrationAlert}
          onSnooze={handleSnoozeHydrationAlert}
        />
      );
    }

    // Auth screen
    if (currentScreen === "auth") {
      return <AuthScreen onAuthSuccess={handleAuthSuccess} />;
    }
    
    // Onboarding flow
    if (currentScreen === "onboarding") {
      return <OnboardingFlow onComplete={() => handleNext("profile")} />;
    }
    if (currentScreen === "profile") {
      return <ProfileSetupScreen onNext={() => handleNext("bluetooth")} />;
    }
    if (currentScreen === "bluetooth") {
      return <BluetoothScreen onNext={() => handleNext("dashboard")} />;
    }

    // Main app with tabs
    if (currentScreen === "dashboard") {
      if (mainTab === "dashboard") return <DashboardScreen />;
      if (mainTab === "nutrition") return <NutritionScreen />;
      if (mainTab === "userprofile") return <ProfileScreen />;
    }

    return <DashboardScreen />;
  };

  const isMainApp = currentScreen === "dashboard" && !showHydrationAlert;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="relative">
        {/* Phone frame */}
        <div className="relative w-[390px] h-[844px] bg-black rounded-[3rem] shadow-2xl p-3 border-8 border-gray-800">
          {/* Notch */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-7 bg-black rounded-b-3xl z-50" />

          {/* Screen */}
          <div className="relative w-full h-full bg-white rounded-[2.5rem] overflow-hidden">
            <AnimatePresence mode="wait" custom={1}>
              <motion.div
                key={currentScreen + mainTab + (showHydrationAlert ? "alert" : "")}
                custom={1}
                variants={screenVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: "spring", stiffness: 300, damping: 30 },
                  opacity: { duration: 0.2 },
                }}
                className="absolute inset-0"
              >
                {renderCurrentScreen()}
              </motion.div>
            </AnimatePresence>

            {/* Bottom navigation - only show in main app */}
            {isMainApp && (
              <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5, type: "spring" }}
                className="absolute bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-gray-200 rounded-t-3xl px-6 py-3 pb-6"
              >
                <div className="flex items-center justify-around">
                  {/* Dashboard tab */}
                  <motion.button
                    onClick={() => handleTabChange("dashboard")}
                    className={`flex flex-col items-center gap-1 px-6 py-2 rounded-2xl transition-all ${
                      mainTab === "dashboard" ? "bg-blue-100" : ""
                    }`}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                        mainTab === "dashboard"
                          ? "bg-gradient-to-br from-blue-400 to-purple-500"
                          : "bg-gray-100"
                      }`}
                    >
                      <Home
                        className={`w-5 h-5 ${
                          mainTab === "dashboard" ? "text-white" : "text-gray-400"
                        }`}
                      />
                    </div>
                    <span
                      className={`text-xs ${
                        mainTab === "dashboard" ? "text-blue-600" : "text-gray-400"
                      }`}
                    >
                      Home
                    </span>
                  </motion.button>

                  {/* Nutrition tab */}
                  <motion.button
                    onClick={() => handleTabChange("nutrition")}
                    className={`flex flex-col items-center gap-1 px-6 py-2 rounded-2xl transition-all ${
                      mainTab === "nutrition" ? "bg-pink-100" : ""
                    }`}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                        mainTab === "nutrition"
                          ? "bg-gradient-to-br from-pink-400 to-green-500"
                          : "bg-gray-100"
                      }`}
                    >
                      <Apple
                        className={`w-5 h-5 ${
                          mainTab === "nutrition" ? "text-white" : "text-gray-400"
                        }`}
                      />
                    </div>
                    <span
                      className={`text-xs ${
                        mainTab === "nutrition" ? "text-pink-600" : "text-gray-400"
                      }`}
                    >
                      Meals
                    </span>
                  </motion.button>

                  {/* Profile tab */}
                  <motion.button
                    onClick={() => handleTabChange("userprofile")}
                    className={`flex flex-col items-center gap-1 px-6 py-2 rounded-2xl transition-all ${
                      mainTab === "userprofile" ? "bg-purple-100" : ""
                    }`}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                        mainTab === "userprofile"
                          ? "bg-gradient-to-br from-purple-400 to-pink-500"
                          : "bg-gray-100"
                      }`}
                    >
                      <User
                        className={`w-5 h-5 ${
                          mainTab === "userprofile" ? "text-white" : "text-gray-400"
                        }`}
                      />
                    </div>
                    <span
                      className={`text-xs ${
                        mainTab === "userprofile" ? "text-purple-600" : "text-gray-400"
                      }`}
                    >
                      Profile
                    </span>
                  </motion.button>
                </div>
              </motion.div>
            )}
          </div>

          {/* Home indicator */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-white/30 rounded-full" />
        </div>

        {/* Ambient glow */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-[3rem] blur-3xl -z-10"
          animate={{
            opacity: [0.3, 0.6, 0.3],
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Instructions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center"
      >
        <p className="text-white/60 text-sm">
          {!isMainApp
            ? "Toca los botones para avanzar en el flujo"
            : "Usa la navegación inferior para explorar"}
        </p>
        <p className="text-white/40 text-xs mt-1">
          {currentScreen === "auth" && "Inicia sesión o regístrate"}
          {currentScreen === "onboarding" && "Conoce los colores de Lumi"}
          {currentScreen === "profile" && "Paso 2/3: Perfil"}
          {currentScreen === "bluetooth" && "Paso 3/3: Conexión BLE"}
          {currentScreen === "dashboard" && !showHydrationAlert && "App principal"}
          {showHydrationAlert && "💧 Alerta de hidratación activa"}
        </p>
        {currentScreen === "dashboard" && !showHydrationAlert && (
          <button
            onClick={() => setShowHydrationAlert(true)}
            className="mt-3 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 text-xs rounded-lg transition-colors"
          >
            🧪 Probar alarma de hidratación
          </button>
        )}
      </motion.div>
    </div>
  );
}

export default function App() {
  useEffect(() => {
    // Register service worker for PWA functionality
    registerServiceWorker();
    
    // Initialize PWA install prompt
    initPWAInstallPrompt((canInstall) => {
      if (canInstall) {
        console.log('✨ Lumi can be installed as a PWA!');
      }
    });
  }, []);

  return (
    <UserProvider>
      <AppContent />
    </UserProvider>
  );
}
