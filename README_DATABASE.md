# GymFit Database Documentation

## Overview

La aplicación utiliza SQLite para almacenamiento local con la siguiente estrategia:

- **Local Storage**: Información del cliente (perfil, peso, altura, etc.), planes de entrenamiento, rutinas, registro diario de comidas
- **Remote API**: Catálogo de entrenamientos compartidos, base de datos de nutricionistas, alimentos premium (futuro)

## Schema

### Tablas Principales

#### 1. `clients`
Información del cliente (privado, almacenado localmente)
```sql
- id: INTEGER (PK)
- name: TEXT
- email: TEXT (UNIQUE)
- height: INTEGER (cm)
- weight: INTEGER (kg)
- body_fat_percentage: REAL (%)
- shirt_size: TEXT (XS, S, M, L, XL)
- trainer_id: INTEGER (FK, nullable)
- notes: TEXT
- created_at, updated_at: INTEGER
```

#### 2. `trainers`
Asignación de entrenadores
```sql
- id: INTEGER (PK)
- name: TEXT
- email: TEXT (UNIQUE)
- specialty: TEXT
- created_at: INTEGER
```

#### 3. `routines`
Planes de entrenamiento por grupos musculares
```sql
- id: INTEGER (PK)
- client_id: INTEGER (FK)
- name: TEXT
- description: TEXT
- muscle_group: TEXT (chest, back, legs, arms, shoulders)
- created_at, updated_at: INTEGER
```

#### 4. `exercises`
Biblioteca de ejercicios
```sql
- id: INTEGER (PK)
- name: TEXT
- muscle_group: TEXT
- series: INTEGER
- repetitions: INTEGER
- weight: REAL (kg)
- rest_seconds: INTEGER
- notes: TEXT
- created_at: INTEGER
```

#### 5. `foods`
Base de datos de alimentos con macros
```sql
- id: INTEGER (PK)
- name: TEXT (UNIQUE)
- protein: REAL (g)
- carbs: REAL (g)
- fat: REAL (g)
- calories: REAL (kcal)
- portion: INTEGER (g, default 100)
- created_at: INTEGER
```

#### 6. `meals`
Registro diario de comidas
```sql
- id: INTEGER (PK)
- client_id: INTEGER (FK)
- date: TEXT (YYYY-MM-DD)
- meal_number: INTEGER (1-5)
- meal_type: TEXT (breakfast, lunch, dinner, snack)
- created_at: INTEGER
```

#### 7. `diets`
Planes de nutrición asignados
```sql
- id: INTEGER (PK)
- client_id: INTEGER (FK)
- name: TEXT
- description: TEXT
- created_at, updated_at: INTEGER
```

Tablas de relación: `routine_exercises`, `diet_foods`, `meal_foods`

## Services API

### ClientService
```typescript
import { ClientService } from '@/db/services';

// Create client
const clientId = await ClientService.create({
  name: 'Juan Pérez',
  email: 'juan@example.com',
  height: 180,
  weight: 80,
  bodyFatPercentage: 15,
  shirtSize: 'M',
  trainerId: null,
  notes: 'Objetivo: ganar músculo'
});

// Get all clients
const clients = await ClientService.getAll();

// Get specific client
const client = await ClientService.getById(clientId);

// Update client
await ClientService.update(clientId, { weight: 82 });

// Delete client
await ClientService.delete(clientId);
```

### MealService
```typescript
import { MealService } from '@/db/services';

// Create meal
const mealId = await MealService.createMeal(clientId, 'breakfast', 1);

// Add food to meal
await MealService.addFoodToMeal(mealId, foodId, 200); // 200g

// Get meal with auto-calculated macros
const meal = await MealService.getMealWithMacros(mealId);
console.log(meal.totalProtein); // grams
console.log(meal.totalCarbs);   // grams
console.log(meal.totalFat);     // grams
console.log(meal.totalCalories); // kcal

// Get daily summary
const daily = await MealService.getDailySummary(clientId, '2024-05-27');
console.log(daily.totalProtein, daily.totalCalories);

// Get all meals for a date
const meals = await MealService.getMealsByDate(clientId, '2024-05-27');

// Remove food
await MealService.removeFoodFromMeal(mealId, foodId);

// Delete meal
await MealService.deleteMeal(mealId);
```

### RoutineService & ExerciseService
```typescript
import { RoutineService, ExerciseService } from '@/db/services';

// Create exercise
const exerciseId = await ExerciseService.create(
  'Bench Press',
  'chest',
  4,    // series
  8,    // reps
  100   // weight in kg
);

// Get exercises by muscle group
const chestExercises = await ExerciseService.getByMuscleGroup('chest');

// Create routine
const routineId = await RoutineService.create(
  clientId,
  'Upper Body A',
  'Chest and back focus',
  'chest'
);

// Add exercise to routine
await RoutineService.addExercise(routineId, exerciseId, 1); // order: 1

// Get routine with exercises
const routine = await RoutineService.getRoutineWithExercises(routineId);

// Get all client routines
const routines = await RoutineService.getClientRoutines(clientId);
```

### FoodService
```typescript
import { FoodService } from '@/db/services';

// Get all foods
const allFoods = await FoodService.getAll();

// Search foods
const results = await FoodService.search('chicken');

// Get frequently used foods
const frequent = await FoodService.getFrequent(10);

// Create custom food
const customFoodId = await FoodService.create(
  'Mi Batido Protéico',
  30,   // protein
  40,   // carbs
  5,    // fat
  400   // calories
);
```

### DietService
```typescript
import { DietService } from '@/db/services';

// Create diet
const dietId = await DietService.create(
  clientId,
  'Ganancia Muscular',
  'Alto en proteína'
);

// Add food to diet
await DietService.addFood(dietId, foodId, 150, 'breakfast');

// Get diet with foods
const diet = await DietService.getDietWithFoods(dietId);

// Get diet macros
const macros = await DietService.getDietMacros(dietId);
```

## Security Best Practices

✓ **Parameterized Queries**: Se usan parámetros en todas las queries SQL para prevenir inyección
✓ **Local Storage**: Datos del usuario nunca se guardan en servidores (privacidad)
✓ **API Security**: Al conectar con API externa, usar HTTPS y validar respuestas
✓ **Data Validation**: Validar datos antes de insertar en BD
✓ **Error Handling**: Logs descriptivos sin exponer datos sensibles

## Seeding

La aplicación seedea automáticamente una lista de alimentos comunes en la primera ejecución.
Ver `src/db/seeder.ts` para agregar más alimentos.

## Testing & Development

```bash
# Install dependencies
npm install

# Start app
expo start

# Watch logs
expo start --web  # Para ver console logs
```

## TODO: Funcionalidades Futuras

- [ ] Sincronización opcional con API remota
- [ ] Backup automático de datos
- [ ] Export/Import de datos
- [ ] Historial de peso (gráficos)
- [ ] Recordatorios de comidas
- [ ] Análisis de tendencias nutricionales
