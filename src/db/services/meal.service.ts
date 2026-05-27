/**
 * Meal Service - Daily meal logging and macro calculation
 * Handles meal tracking and automatic macro calculation
 */

import { Food, Meal } from '../schema';
import { executeQuery, executeUpdate } from '../sqlite';

export interface MealWithMacros extends Meal {
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  totalCalories: number;
  foods: Array<Food & { quantity: number }>;
}

export const MealService = {
  /**
   * Create a meal for today
   */
  async createMeal(
    clientId: number,
    mealType: string,
    mealNumber: number
  ): Promise<number> {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const result = await executeUpdate(
      `INSERT INTO meals (client_id, date, meal_number, meal_type, created_at)
       VALUES (?, ?, ?, ?, ?)`,
      [clientId, today, mealNumber, mealType, Date.now()]
    );
    return (result as any).insertId;
  },

  /**
   * Add food to meal
   */
  async addFoodToMeal(mealId: number, foodId: number, quantity: number): Promise<void> {
    await executeUpdate(
      `INSERT OR REPLACE INTO meal_foods (meal_id, food_id, quantity)
       VALUES (?, ?, ?)`,
      [mealId, foodId, quantity]
    );
  },

  /**
   * Get meal with calculated macros
   */
  async getMealWithMacros(mealId: number): Promise<MealWithMacros | null> {
    const meals = await executeQuery<any>(
      `SELECT id, client_id as clientId, date, meal_number as mealNumber,
              meal_type as mealType, created_at as createdAt
       FROM meals WHERE id = ?`,
      [mealId]
    );

    if (meals.length === 0) return null;

    const meal = meals[0];
    const foods = await this.getMealFoods(mealId);

    const { totalProtein, totalCarbs, totalFat, totalCalories } = this.calculateMacros(foods);

    return {
      id: meal.id,
      clientId: meal.clientId,
      date: meal.date,
      mealNumber: meal.mealNumber,
      mealType: meal.mealType,
      createdAt: meal.createdAt,
      totalProtein,
      totalCarbs,
      totalFat,
      totalCalories,
      foods,
    };
  },

  /**
   * Get all meals for a client on a specific date
   */
  async getMealsByDate(clientId: number, date: string): Promise<MealWithMacros[]> {
    const meals = await executeQuery<any>(
      `SELECT id, client_id as clientId, date, meal_number as mealNumber,
              meal_type as mealType, created_at as createdAt
       FROM meals WHERE client_id = ? AND date = ? ORDER BY meal_number ASC`,
      [clientId, date]
    );

    return Promise.all(
      meals.map(async meal => {
        const foods = await this.getMealFoods(meal.id);
        const { totalProtein, totalCarbs, totalFat, totalCalories } =
          this.calculateMacros(foods);

        return {
          id: meal.id,
          clientId: meal.clientId,
          date: meal.date,
          mealNumber: meal.mealNumber,
          mealType: meal.mealType,
          createdAt: meal.createdAt,
          totalProtein,
          totalCarbs,
          totalFat,
          totalCalories,
          foods,
        };
      })
    );
  },

  /**
   * Get all foods in a meal
   */
  async getMealFoods(mealId: number): Promise<Array<Food & { quantity: number }>> {
    return executeQuery<Food & { quantity: number }>(
      `SELECT f.id, f.name, f.protein, f.carbs, f.fat, f.calories, 
              f.portion, f.created_at as createdAt, mf.quantity
       FROM meal_foods mf
       JOIN foods f ON mf.food_id = f.id
       WHERE mf.meal_id = ?`,
      [mealId]
    );
  },

  /**
   * Remove food from meal
   */
  async removeFoodFromMeal(mealId: number, foodId: number): Promise<void> {
    await executeUpdate(
      `DELETE FROM meal_foods WHERE meal_id = ? AND food_id = ?`,
      [mealId, foodId]
    );
  },

  /**
   * Delete entire meal
   */
  async deleteMeal(mealId: number): Promise<void> {
    await executeUpdate(`DELETE FROM meals WHERE id = ?`, [mealId]);
  },

  /**
   * Calculate macros automatically
   * Helper function that computes total macros from foods
   */
  calculateMacros(
    foods: Array<Food & { quantity: number }>
  ): { totalProtein: number; totalCarbs: number; totalFat: number; totalCalories: number } {
    return foods.reduce(
      (acc, food) => {
        // Convert macros from 100g portion to actual quantity
        const multiplier = food.quantity / (food.portion || 100);

        return {
          totalProtein: acc.totalProtein + food.protein * multiplier,
          totalCarbs: acc.totalCarbs + food.carbs * multiplier,
          totalFat: acc.totalFat + food.fat * multiplier,
          totalCalories: acc.totalCalories + food.calories * multiplier,
        };
      },
      { totalProtein: 0, totalCarbs: 0, totalFat: 0, totalCalories: 0 }
    );
  },

  /**
   * Get summary of daily macros for client
   */
  async getDailySummary(clientId: number, date: string): Promise<{
    totalProtein: number;
    totalCarbs: number;
    totalFat: number;
    totalCalories: number;
    meals: number;
  }> {
    const meals = await this.getMealsByDate(clientId, date);

    const summary = meals.reduce(
      (acc, meal) => ({
        totalProtein: acc.totalProtein + meal.totalProtein,
        totalCarbs: acc.totalCarbs + meal.totalCarbs,
        totalFat: acc.totalFat + meal.totalFat,
        totalCalories: acc.totalCalories + meal.totalCalories,
        meals: acc.meals + 1,
      }),
      { totalProtein: 0, totalCarbs: 0, totalFat: 0, totalCalories: 0, meals: 0 }
    );

    return summary;
  },
};
