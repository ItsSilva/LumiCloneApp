import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { projectId, publicAnonKey } from "../utils/supabase/info";

interface UserProfile {
  name: string;
  age: number;
  gender: "male" | "female" | "other";
  weight: number; // kg
  height: number; // cm
  activityLevel: "sedentary" | "light" | "moderate" | "very";
}

interface NutritionalNeeds {
  dailyProtein: number; // gramos
  dailyFiber: number; // gramos
  dailyWater: number; // vasos (250ml cada uno)
  proteinPerMeal: number;
  fiberPerMeal: number;
}

interface MealIntake {
  protein: number;
  fiber: number;
}

interface DailyProgress {
  date: string;
  isBalanced: boolean;
  waterGlasses: number;
  totalProtein: number;
  totalFiber: number;
}

interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastBalancedDate: string | null;
}

interface UserContextType {
  profile: UserProfile | null;
  nutritionalNeeds: NutritionalNeeds | null;
  userId: string | null;
  accessToken: string | null;
  userName: string | null;
  setAuth: (userId: string, accessToken: string, name: string) => void;
  setProfile: (profile: UserProfile) => Promise<void>;
  setUserProfile: (profile: UserProfile) => Promise<void>;
  mealIntakes: {
    breakfast: MealIntake;
    lunch: MealIntake;
    dinner: MealIntake;
  };
  updateMealIntake: (meal: "breakfast" | "lunch" | "dinner", intake: MealIntake) => Promise<void>;
  getTotalIntake: () => { protein: number; fiber: number };
  waterGlasses: number;
  addWater: (glasses?: number) => Promise<void>;
  dailyHistory: DailyProgress[];
  streakData: StreakData | null;
  checkAndUpdateDailyProgress: () => void;
  refreshData: () => Promise<void>;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [profile, setProfileState] = useState<UserProfile | null>(null);
  const [nutritionalNeeds, setNutritionalNeeds] = useState<NutritionalNeeds | null>(null);
  const [waterGlasses, setWaterGlasses] = useState(0);
  const [mealIntakes, setMealIntakes] = useState({
    breakfast: { protein: 0, fiber: 0 },
    lunch: { protein: 0, fiber: 0 },
    dinner: { protein: 0, fiber: 0 },
  });
  const [dailyHistory, setDailyHistory] = useState<DailyProgress[]>([]);
  const [streakData, setStreakData] = useState<StreakData | null>(null);

  const setAuth = (newUserId: string, newAccessToken: string, name: string) => {
    setUserId(newUserId);
    setAccessToken(newAccessToken);
    setUserName(name);
    localStorage.setItem("lumi_user_id", newUserId);
    localStorage.setItem("lumi_access_token", newAccessToken);
    localStorage.setItem("lumi_user_name", name);
  };

  const logout = () => {
    setUserId(null);
    setAccessToken(null);
    setUserName(null);
    setProfileState(null);
    setNutritionalNeeds(null);
    setWaterGlasses(0);
    setMealIntakes({
      breakfast: { protein: 0, fiber: 0 },
      lunch: { protein: 0, fiber: 0 },
      dinner: { protein: 0, fiber: 0 },
    });
    setDailyHistory([]);
    setStreakData(null);
    localStorage.removeItem("lumi_user_id");
    localStorage.removeItem("lumi_access_token");
    localStorage.removeItem("lumi_user_name");
  };

  // Restore auth from localStorage
  useEffect(() => {
    const storedUserId = localStorage.getItem("lumi_user_id");
    const storedToken = localStorage.getItem("lumi_access_token");
    const storedName = localStorage.getItem("lumi_user_name");
    
    if (storedUserId && storedToken && storedName) {
      setUserId(storedUserId);
      setAccessToken(storedToken);
      setUserName(storedName);
    }
  }, []);

  const calculateNutritionalNeeds = (profile: UserProfile): NutritionalNeeds => {
    // Proteína: 1.2g por kg de peso corporal (ajustado por actividad)
    let proteinMultiplier = 1.0;
    if (profile.activityLevel === "light") proteinMultiplier = 1.2;
    if (profile.activityLevel === "moderate") proteinMultiplier = 1.4;
    if (profile.activityLevel === "very") proteinMultiplier = 1.6;

    const dailyProtein = Math.round(profile.weight * proteinMultiplier);

    // Fibra: basado en género y edad
    let dailyFiber = 25;
    if (profile.gender === "male") {
      dailyFiber = profile.age < 50 ? 38 : 30;
    } else {
      dailyFiber = profile.age < 50 ? 25 : 21;
    }

    // Agua: basado en peso (30-35ml por kg, convertido a vasos de 250ml)
    const dailyWaterMl = profile.weight * 33; // 33ml por kg
    const dailyWater = Math.round(dailyWaterMl / 250); // convertir a vasos de 250ml

    return {
      dailyProtein,
      dailyFiber,
      dailyWater,
      proteinPerMeal: Math.round(dailyProtein / 3),
      fiberPerMeal: Math.round(dailyFiber / 3),
    };
  };

  const setProfile = async (newProfile: UserProfile) => {
    if (!userId || !accessToken) {
      console.error("No userId or accessToken available");
      return;
    }

    setProfileState(newProfile);
    const needs = calculateNutritionalNeeds(newProfile);
    setNutritionalNeeds(needs);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-17dd3838/users/profile`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            profile: newProfile,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save profile");
      }

      // Refresh data after saving profile
      await refreshData();
    } catch (error) {
      console.error("Error saving profile:", error);
    }
  };

  const addWater = async (glasses: number = 1) => {
    if (!userId || !accessToken) {
      console.error("No userId or accessToken available");
      return;
    }

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-17dd3838/hydration/${userId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ glasses }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to add water");
      }

      const data = await response.json();
      setWaterGlasses(data.waterGlasses);
    } catch (error) {
      console.error("Error adding water:", error);
    }
  };

  const updateMealIntake = async (meal: "breakfast" | "lunch" | "dinner", intake: MealIntake) => {
    if (!userId || !accessToken) {
      console.error("No userId or accessToken available");
      return;
    }

    setMealIntakes((prev) => ({
      ...prev,
      [meal]: intake,
    }));

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-17dd3838/nutrition/${userId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            meal: {
              type: meal,
              protein: intake.protein,
              fiber: intake.fiber,
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to save meal");
      }

      // Refresh data to update streak
      await refreshData();
    } catch (error) {
      console.error("Error saving meal:", error);
    }
  };

  const getTotalIntake = () => {
    const totalProtein = mealIntakes.breakfast.protein + mealIntakes.lunch.protein + mealIntakes.dinner.protein;
    const totalFiber = mealIntakes.breakfast.fiber + mealIntakes.lunch.fiber + mealIntakes.dinner.fiber;
    return { protein: totalProtein, fiber: totalFiber };
  };

  const refreshData = async () => {
    if (!userId || !accessToken) return;

    try {
      // Get today's summary (includes streak data)
      const summaryResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-17dd3838/summary/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (summaryResponse.ok) {
        const summary = await summaryResponse.json();
        
        // Update streak data
        if (summary.streak) {
          setStreakData(summary.streak);
        }
        
        if (summary.daily) {
          setWaterGlasses(summary.daily.waterGlasses || 0);
          
          // Reconstruct meal intakes from meals array
          const meals = summary.daily.meals || [];
          const newMealIntakes = {
            breakfast: { protein: 0, fiber: 0 },
            lunch: { protein: 0, fiber: 0 },
            dinner: { protein: 0, fiber: 0 },
          };

          meals.forEach((meal: any) => {
            if (meal.type && newMealIntakes[meal.type as keyof typeof newMealIntakes]) {
              newMealIntakes[meal.type as keyof typeof newMealIntakes] = {
                protein: meal.protein || 0,
                fiber: meal.fiber || 0,
              };
            }
          });

          setMealIntakes(newMealIntakes);
        }
      }

      // Get history
      const historyResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-17dd3838/hydration/${userId}?days=14`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (historyResponse.ok) {
        const historyData = await historyResponse.json();
        const history = historyData.history || [];
        
        // Convert to DailyProgress format
        const formattedHistory: DailyProgress[] = history.map((day: any) => {
          const proteinMet = nutritionalNeeds ? day.totalProtein >= nutritionalNeeds.dailyProtein * 0.8 : false;
          const fiberMet = nutritionalNeeds ? day.totalFiber >= nutritionalNeeds.dailyFiber * 0.8 : false;
          
          return {
            date: day.date,
            isBalanced: proteinMet && fiberMet,
            waterGlasses: day.waterGlasses || 0,
            totalProtein: day.totalProtein || 0,
            totalFiber: day.totalFiber || 0,
          };
        });

        setDailyHistory(formattedHistory);
      }
    } catch (error) {
      console.error("Error refreshing data:", error);
    }
  };

  // Load data when userId and accessToken are available
  useEffect(() => {
    if (userId && accessToken) {
      refreshData();
    }
  }, [userId, accessToken, nutritionalNeeds]);

  const checkAndUpdateDailyProgress = () => {
    if (!nutritionalNeeds) return;
    
    const totalIntake = getTotalIntake();
    const proteinMet = totalIntake.protein >= nutritionalNeeds.dailyProtein * 0.8; // 80% threshold
    const fiberMet = totalIntake.fiber >= nutritionalNeeds.dailyFiber * 0.8;
    
    const isBalanced = proteinMet && fiberMet;
    return isBalanced;
  };

  return (
    <UserContext.Provider
      value={{
        userId,
        accessToken,
        userName,
        profile,
        nutritionalNeeds,
        setAuth,
        setProfile,
        setUserProfile: setProfile,
        mealIntakes,
        updateMealIntake,
        getTotalIntake,
        waterGlasses,
        addWater,
        dailyHistory,
        streakData,
        checkAndUpdateDailyProgress,
        refreshData,
        logout,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
