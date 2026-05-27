/**
 * Database Seeder - Initial food data
 * Populates the food database with common foods and their macros
 * Run once on first app launch
 */

import { FoodService } from './services';
import { executeQuery } from './sqlite';

// Common foods with nutritional values (per 100g standard)
const COMMON_FOODS = [
  // Proteins
  { name: 'Chicken Breast', protein: 31, carbs: 0, fat: 3.6, calories: 165 },
  { name: 'Beef (lean)', protein: 26, carbs: 0, fat: 8, calories: 180 },
  { name: 'Salmon', protein: 25, carbs: 0, fat: 13, calories: 208 },
  { name: 'Egg (whole)', protein: 13, carbs: 1.1, fat: 11, calories: 155, portion: 50 },
  { name: 'Tuna Canned', protein: 29, carbs: 0, fat: 1.3, calories: 132 },
  { name: 'Greek Yogurt', protein: 10, carbs: 3.6, fat: 0.4, calories: 59 },
  { name: 'Cottage Cheese', protein: 11, carbs: 3.4, fat: 4.3, calories: 98 },

  // Carbs
  { name: 'White Rice', protein: 2.7, carbs: 28, fat: 0.3, calories: 130 },
  { name: 'Brown Rice', protein: 2.6, carbs: 23, fat: 1, calories: 112 },
  { name: 'Oatmeal', protein: 10.7, carbs: 54.3, fat: 5.7, calories: 389 },
  { name: 'Pasta', protein: 13, carbs: 75, fat: 1.1, calories: 371 },
  { name: 'Sweet Potato', protein: 1.6, carbs: 20.1, fat: 0.1, calories: 86 },
  { name: 'White Bread', protein: 8.7, carbs: 49, fat: 3.3, calories: 265 },
  { name: 'Banana', protein: 1.1, carbs: 23, fat: 0.3, calories: 89, portion: 120 },
  { name: 'Apple', protein: 0.3, carbs: 25, fat: 0.2, calories: 95, portion: 182 },

  // Fats
  { name: 'Olive Oil', protein: 0, carbs: 0, fat: 100, calories: 884, portion: 15 },
  { name: 'Almonds', protein: 21, carbs: 22, fat: 50, calories: 579, portion: 28 },
  { name: 'Avocado', protein: 3, carbs: 9, fat: 15, calories: 160 },
  { name: 'Peanut Butter', protein: 25, carbs: 20, fat: 50, calories: 588, portion: 32 },

  // Vegetables
  { name: 'Broccoli', protein: 2.8, carbs: 7, fat: 0.4, calories: 34 },
  { name: 'Spinach', protein: 2.7, carbs: 3.6, fat: 0.4, calories: 23 },
  { name: 'Carrot', protein: 0.9, carbs: 10, fat: 0.2, calories: 41 },
  { name: 'Tomato', protein: 0.9, carbs: 3.9, fat: 0.2, calories: 18 },
  { name: 'Bell Pepper', protein: 1, carbs: 6, fat: 0.3, calories: 31 },

  // Dairy
  { name: 'Milk (2%)', protein: 3.3, carbs: 4.8, fat: 2, calories: 49, portion: 240 },
  { name: 'Cheese (cheddar)', protein: 23, carbs: 1.3, fat: 33, calories: 403 },
  { name: 'Whey Protein Powder', protein: 80, carbs: 6, fat: 2, calories: 360, portion: 30 },
];

/**
 * Seed foods into database (run once on first launch)
 */
export async function seedFoods(): Promise<void> {
  try {
    // Check if foods already exist
    const existingFoods = await executeQuery<any>(
      `SELECT COUNT(*) as count FROM foods`
    );

    if (existingFoods[0].count > 0) {
      console.log('Foods already seeded, skipping...');
      return;
    }

    console.log(`Seeding ${COMMON_FOODS.length} foods into database...`);

    // Insert all foods
    for (const food of COMMON_FOODS) {
      await FoodService.create(
        food.name,
        food.protein,
        food.carbs,
        food.fat,
        food.calories,
        food.portion || 100
      );
    }

    console.log('Foods seeded successfully!');
  } catch (error) {
    console.error('Error seeding foods:', error);
  }
}
