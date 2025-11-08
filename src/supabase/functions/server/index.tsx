import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "jsr:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Create Supabase client for auth
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
);

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-17dd3838/health", (c) => {
  return c.json({ status: "ok" });
});

// Authentication Endpoints

// Sign up new user
app.post("/make-server-17dd3838/auth/signup", async (c) => {
  try {
    const body = await c.req.json();
    const { email, password, name, dayStartTime, dayEndTime } = body;

    if (!email || !password || !name) {
      return c.json({ error: "Email, password, and name are required" }, 400);
    }

    // Create user with Supabase Auth
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true,
    });

    if (error) {
      console.log("Error creating user:", error);
      return c.json({ error: error.message }, 400);
    }

    if (!data.user) {
      return c.json({ error: "Failed to create user" }, 500);
    }

    // Initialize user data in KV store
    const userId = data.user.id;
    await kv.set(`user:${userId}`, {
      userId,
      email,
      name,
      dayStartTime: dayStartTime || "06:00",
      dayEndTime: dayEndTime || "22:00",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // Initialize streak data
    await kv.set(`streak:${userId}`, {
      currentStreak: 0,
      longestStreak: 0,
      lastBalancedDate: null,
    });

    return c.json({ 
      success: true, 
      user: {
        id: userId,
        email,
        name,
      }
    });
  } catch (error) {
    console.log("Error in signup:", error);
    return c.json({ error: "Failed to sign up user" }, 500);
  }
});

// Sign in user (handled by Supabase client in frontend)
// This endpoint is for reference - actual signin happens client-side
app.post("/make-server-17dd3838/auth/signin", async (c) => {
  try {
    // This is handled by Supabase client-side auth
    // Just return instructions
    return c.json({ 
      message: "Use Supabase client signInWithPassword on frontend",
      success: true 
    });
  } catch (error) {
    console.log("Error in signin:", error);
    return c.json({ error: "Failed to sign in" }, 500);
  }
});

// User Profile Endpoints

// Create or update user profile (requires auth)
app.post("/make-server-17dd3838/users/profile", async (c) => {
  try {
    // Verify user is authenticated
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: "Unauthorized - no token provided" }, 401);
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !user?.id) {
      console.log("Auth error:", authError);
      return c.json({ error: "Unauthorized - invalid token" }, 401);
    }

    const userId = user.id;
    const body = await c.req.json();
    const { profile } = body;

    if (!profile) {
      return c.json({ error: "profile is required" }, 400);
    }

    // Get existing user data to preserve email and name
    const existingUser = await kv.get(`user:${userId}`);
    
    // Store user profile
    await kv.set(`user:${userId}`, {
      ...(existingUser || {}),
      ...profile,
      userId,
      updatedAt: new Date().toISOString(),
    });

    // Initialize daily tracking for today
    const today = new Date().toISOString().split('T')[0];
    const existingDaily = await kv.get(`daily:${userId}:${today}`);
    
    if (!existingDaily) {
      await kv.set(`daily:${userId}:${today}`, {
        date: today,
        waterGlasses: 0,
        meals: [],
        totalProtein: 0,
        totalFiber: 0,
      });
    }

    return c.json({ success: true, userId });
  } catch (error) {
    console.log("Error creating/updating user profile:", error);
    return c.json({ error: "Failed to create/update user profile" }, 500);
  }
});

// Get user profile
app.get("/make-server-17dd3838/users/:userId", async (c) => {
  try {
    const userId = c.req.param("userId");
    const user = await kv.get(`user:${userId}`);

    if (!user) {
      return c.json({ error: "User not found" }, 404);
    }

    return c.json({ user });
  } catch (error) {
    console.log("Error fetching user:", error);
    return c.json({ error: "Failed to fetch user" }, 500);
  }
});

// Hydration Endpoints

// Add water consumption
app.post("/make-server-17dd3838/hydration/:userId", async (c) => {
  try {
    const userId = c.req.param("userId");
    const body = await c.req.json();
    const { glasses = 1 } = body;

    const today = new Date().toISOString().split('T')[0];
    const key = `daily:${userId}:${today}`;
    
    // Get current daily data
    let dailyData = await kv.get(key);
    
    if (!dailyData) {
      dailyData = {
        date: today,
        waterGlasses: 0,
        meals: [],
        totalProtein: 0,
        totalFiber: 0,
      };
    }

    // Update water consumption
    dailyData.waterGlasses = (dailyData.waterGlasses || 0) + glasses;
    dailyData.lastUpdated = new Date().toISOString();

    await kv.set(key, dailyData);

    return c.json({ success: true, waterGlasses: dailyData.waterGlasses });
  } catch (error) {
    console.log("Error adding water consumption:", error);
    return c.json({ error: "Failed to add water consumption" }, 500);
  }
});

// Get hydration data for a specific date
app.get("/make-server-17dd3838/hydration/:userId/:date", async (c) => {
  try {
    const userId = c.req.param("userId");
    const date = c.req.param("date");
    
    const dailyData = await kv.get(`daily:${userId}:${date}`);

    if (!dailyData) {
      return c.json({ 
        date,
        waterGlasses: 0,
        meals: [],
        totalProtein: 0,
        totalFiber: 0,
      });
    }

    return c.json({ data: dailyData });
  } catch (error) {
    console.log("Error fetching hydration data:", error);
    return c.json({ error: "Failed to fetch hydration data" }, 500);
  }
});

// Get hydration history (last N days)
app.get("/make-server-17dd3838/hydration/:userId", async (c) => {
  try {
    const userId = c.req.param("userId");
    const days = parseInt(c.req.query("days") || "7");
    
    const allKeys = await kv.getByPrefix(`daily:${userId}:`);
    
    // Sort by date descending and take last N days
    const sortedData = allKeys
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, days);

    return c.json({ history: sortedData });
  } catch (error) {
    console.log("Error fetching hydration history:", error);
    return c.json({ error: "Failed to fetch hydration history" }, 500);
  }
});

// Nutrition Endpoints

// Add meal
app.post("/make-server-17dd3838/nutrition/:userId", async (c) => {
  try {
    const userId = c.req.param("userId");
    const body = await c.req.json();
    const { meal } = body;

    if (!meal) {
      return c.json({ error: "meal data is required" }, 400);
    }

    const today = new Date().toISOString().split('T')[0];
    const key = `daily:${userId}:${today}`;
    
    // Get current daily data
    let dailyData = await kv.get(key);
    
    if (!dailyData) {
      dailyData = {
        date: today,
        waterGlasses: 0,
        meals: [],
        totalProtein: 0,
        totalFiber: 0,
      };
    }

    // Add meal
    dailyData.meals = dailyData.meals || [];
    dailyData.meals.push({
      ...meal,
      timestamp: new Date().toISOString(),
    });

    // Update totals
    dailyData.totalProtein = dailyData.meals.reduce((sum, m) => sum + (m.protein || 0), 0);
    dailyData.totalFiber = dailyData.meals.reduce((sum, m) => sum + (m.fiber || 0), 0);
    dailyData.lastUpdated = new Date().toISOString();

    await kv.set(key, dailyData);

    return c.json({ 
      success: true, 
      totalProtein: dailyData.totalProtein,
      totalFiber: dailyData.totalFiber,
    });
  } catch (error) {
    console.log("Error adding meal:", error);
    return c.json({ error: "Failed to add meal" }, 500);
  }
});

// Helper function to calculate if day was balanced
function isDayBalanced(dailyData: any, userProfile: any): boolean {
  if (!dailyData || !userProfile) return false;
  
  // Calculate nutritional needs
  let proteinMultiplier = 1.0;
  if (userProfile.activityLevel === "light") proteinMultiplier = 1.2;
  if (userProfile.activityLevel === "moderate") proteinMultiplier = 1.4;
  if (userProfile.activityLevel === "very") proteinMultiplier = 1.6;
  
  const dailyProtein = Math.round(userProfile.weight * proteinMultiplier);
  
  let dailyFiber = 25;
  if (userProfile.gender === "male") {
    dailyFiber = userProfile.age < 50 ? 38 : 30;
  } else {
    dailyFiber = userProfile.age < 50 ? 25 : 21;
  }
  
  // Check if 80% threshold met
  const proteinMet = (dailyData.totalProtein || 0) >= dailyProtein * 0.8;
  const fiberMet = (dailyData.totalFiber || 0) >= dailyFiber * 0.8;
  
  return proteinMet && fiberMet;
}

// Helper function to update streak
async function updateStreak(userId: string, date: string, isBalanced: boolean) {
  try {
    let streakData = await kv.get(`streak:${userId}`);
    
    if (!streakData) {
      streakData = {
        currentStreak: 0,
        longestStreak: 0,
        lastBalancedDate: null,
      };
    }
    
    if (isBalanced) {
      const lastDate = streakData.lastBalancedDate;
      
      if (!lastDate) {
        // First balanced day
        streakData.currentStreak = 1;
        streakData.longestStreak = Math.max(1, streakData.longestStreak || 0);
        streakData.lastBalancedDate = date;
      } else {
        // Check if consecutive day
        const lastDateTime = new Date(lastDate).getTime();
        const currentDateTime = new Date(date).getTime();
        const daysDiff = Math.floor((currentDateTime - lastDateTime) / (1000 * 60 * 60 * 24));
        
        if (daysDiff === 1) {
          // Consecutive day
          streakData.currentStreak += 1;
          streakData.longestStreak = Math.max(streakData.currentStreak, streakData.longestStreak || 0);
          streakData.lastBalancedDate = date;
        } else if (daysDiff > 1) {
          // Streak broken
          streakData.currentStreak = 1;
          streakData.lastBalancedDate = date;
        }
        // If daysDiff === 0, same day, don't change anything
      }
    } else {
      // Day not balanced - check if streak should be broken
      const lastDate = streakData.lastBalancedDate;
      if (lastDate) {
        const lastDateTime = new Date(lastDate).getTime();
        const currentDateTime = new Date(date).getTime();
        const daysDiff = Math.floor((currentDateTime - lastDateTime) / (1000 * 60 * 60 * 24));
        
        if (daysDiff > 1) {
          // More than one day gap - streak broken
          streakData.currentStreak = 0;
        }
      }
    }
    
    await kv.set(`streak:${userId}`, streakData);
    return streakData;
  } catch (error) {
    console.log("Error updating streak:", error);
    return null;
  }
}

// Get today's summary
app.get("/make-server-17dd3838/summary/:userId", async (c) => {
  try {
    const userId = c.req.param("userId");
    const today = new Date().toISOString().split('T')[0];
    
    const user = await kv.get(`user:${userId}`);
    const dailyData = await kv.get(`daily:${userId}:${today}`);
    const streakData = await kv.get(`streak:${userId}`) || {
      currentStreak: 0,
      longestStreak: 0,
      lastBalancedDate: null,
    };

    if (!user) {
      return c.json({ error: "User not found" }, 404);
    }

    // Check and update streak based on today's data
    if (dailyData) {
      const balanced = isDayBalanced(dailyData, user);
      await updateStreak(userId, today, balanced);
    }

    const summary = {
      user,
      daily: dailyData || {
        date: today,
        waterGlasses: 0,
        meals: [],
        totalProtein: 0,
        totalFiber: 0,
      },
      streak: streakData,
    };

    return c.json(summary);
  } catch (error) {
    console.log("Error fetching summary:", error);
    return c.json({ error: "Failed to fetch summary" }, 500);
  }
});

// Get streak data
app.get("/make-server-17dd3838/streak/:userId", async (c) => {
  try {
    const userId = c.req.param("userId");
    const streakData = await kv.get(`streak:${userId}`) || {
      currentStreak: 0,
      longestStreak: 0,
      lastBalancedDate: null,
    };

    return c.json(streakData);
  } catch (error) {
    console.log("Error fetching streak:", error);
    return c.json({ error: "Failed to fetch streak" }, 500);
  }
});

Deno.serve(app.fetch);