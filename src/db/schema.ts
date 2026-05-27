/**
 * Database Schema for GymFit App
 * Follows SOLID principles and mobile security best practices
 * 
 * Data Storage Strategy:
 * - Local Storage: Client info, plans, routines, meals (user privacy)
 * - Remote API: Shared plans, trainers catalog, nutrition database
 */

// ============ TYPE DEFINITIONS ============

export interface Client {
  id: number;
  name: string;
  email: string;
  height: number; // cm
  weight: number; // kg
  bodyFatPercentage: number; // %
  shirtSize: string; // XS, S, M, L, XL
  trainerId: number | null;
  notes: string;
  createdAt: number;
  updatedAt: number;
}

export interface Trainer {
  id: number;
  name: string;
  email: string;
  specialty: string;
  createdAt: number;
}

export interface Routine {
  id: number;
  clientId: number;
  name: string;
  description: string;
  muscleGroup: string; // chest, back, legs, arms, shoulders, etc.
  createdAt: number;
  updatedAt: number;
}

export interface Exercise {
  id: number;
  name: string;
  muscleGroup: string;
  series: number;
  repetitions: number;
  weight: number; // kg
  restSeconds: number;
  notes: string;
  createdAt: number;
}

export interface RoutineExercise {
  routineId: number;
  exerciseId: number;
  order: number;
}

export interface Diet {
  id: number;
  clientId: number;
  name: string;
  description: string;
  createdAt: number;
  updatedAt: number;
}

export interface Food {
  id: number;
  name: string;
  protein: number; // grams
  carbs: number; // grams
  fat: number; // grams
  calories: number; // kcal
  portion: number; // grams default portion
  createdAt: number;
}

export interface DietFood {
  dietId: number;
  foodId: number;
  quantity: number; // grams
  mealType: string; // breakfast, lunch, dinner, snack
}

export interface Meal {
  id: number;
  clientId: number;
  date: string; // YYYY-MM-DD
  mealNumber: number; // 1, 2, 3, 4, 5
  mealType: string; // breakfast, lunch, dinner, snack
  createdAt: number;
}

export interface MealFood {
  mealId: number;
  foodId: number;
  quantity: number; // grams
}

// ============ SCHEMA SQL ============

export const SCHEMA_SQL = [
  // Trainers Table
  `CREATE TABLE IF NOT EXISTS trainers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    specialty TEXT,
    created_at INTEGER NOT NULL
  );`,

  // Clients Table (Local Storage)
  `CREATE TABLE IF NOT EXISTS clients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    height INTEGER,
    weight INTEGER,
    body_fat_percentage REAL,
    shirt_size TEXT,
    trainer_id INTEGER,
    notes TEXT,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    FOREIGN KEY (trainer_id) REFERENCES trainers(id)
  );`,

  // Routines Table
  `CREATE TABLE IF NOT EXISTS routines (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    muscle_group TEXT,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
  );`,

  // Exercises Table
  `CREATE TABLE IF NOT EXISTS exercises (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    muscle_group TEXT NOT NULL,
    series INTEGER,
    repetitions INTEGER,
    weight REAL,
    rest_seconds INTEGER,
    notes TEXT,
    created_at INTEGER NOT NULL
  );`,

  // Routine Exercises Junction Table
  `CREATE TABLE IF NOT EXISTS routine_exercises (
    routine_id INTEGER NOT NULL,
    exercise_id INTEGER NOT NULL,
    exercise_order INTEGER,
    PRIMARY KEY (routine_id, exercise_id),
    FOREIGN KEY (routine_id) REFERENCES routines(id) ON DELETE CASCADE,
    FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE CASCADE
  );`,

  // Foods Table (Nutrition Database)
  `CREATE TABLE IF NOT EXISTS foods (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    protein REAL NOT NULL,
    carbs REAL NOT NULL,
    fat REAL NOT NULL,
    calories REAL NOT NULL,
    portion INTEGER DEFAULT 100,
    created_at INTEGER NOT NULL
  );`,

  // Diets Table
  `CREATE TABLE IF NOT EXISTS diets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
  );`,

  // Diet Foods Assignment Table
  `CREATE TABLE IF NOT EXISTS diet_foods (
    diet_id INTEGER NOT NULL,
    food_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    meal_type TEXT,
    PRIMARY KEY (diet_id, food_id),
    FOREIGN KEY (diet_id) REFERENCES diets(id) ON DELETE CASCADE,
    FOREIGN KEY (food_id) REFERENCES foods(id) ON DELETE CASCADE
  );`,

  // Meals Table (Daily Log)
  `CREATE TABLE IF NOT EXISTS meals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_id INTEGER NOT NULL,
    date TEXT NOT NULL,
    meal_number INTEGER,
    meal_type TEXT,
    created_at INTEGER NOT NULL,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
  );`,

  // Meal Foods Table (Logged Food Items)
  `CREATE TABLE IF NOT EXISTS meal_foods (
    meal_id INTEGER NOT NULL,
    food_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    PRIMARY KEY (meal_id, food_id),
    FOREIGN KEY (meal_id) REFERENCES meals(id) ON DELETE CASCADE,
    FOREIGN KEY (food_id) REFERENCES foods(id) ON DELETE CASCADE
  );`,

  // Indexes for Performance
  `CREATE INDEX IF NOT EXISTS idx_clients_trainer ON clients(trainer_id);`,
  `CREATE INDEX IF NOT EXISTS idx_routines_client ON routines(client_id);`,
  `CREATE INDEX IF NOT EXISTS idx_meals_client_date ON meals(client_id, date);`,
  `CREATE INDEX IF NOT EXISTS idx_diets_client ON diets(client_id);`,
];
