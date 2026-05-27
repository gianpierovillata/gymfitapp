/**
 * Food Service - Nutrition database management
 * Handles food items and their macro properties
 */

import { Food } from '../schema';
import { executeQuery, executeUpdate } from '../sqlite';

export const FoodService = {
  /**
   * Create a new food item
   */
  async create(
    name: string,
    protein: number,
    carbs: number,
    fat: number,
    calories: number,
    portion: number = 100
  ): Promise<number> {
    const result = await executeUpdate(
      `INSERT INTO foods (name, protein, carbs, fat, calories, portion, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [name, protein, carbs, fat, calories, portion, Date.now()]
    );
    return (result as any).insertId;
  },

  /**
   * Get all foods
   */
  async getAll(): Promise<Food[]> {
    return executeQuery<Food>(
      `SELECT id, name, protein, carbs, fat, calories, portion, created_at as createdAt
       FROM foods ORDER BY name ASC`
    );
  },

  /**
   * Search foods by name
   */
  async search(query: string): Promise<Food[]> {
    return executeQuery<Food>(
      `SELECT id, name, protein, carbs, fat, calories, portion, created_at as createdAt
       FROM foods WHERE LOWER(name) LIKE ? ORDER BY name ASC`,
      [`%${query.toLowerCase()}%`]
    );
  },

  /**
   * Get food by ID
   */
  async getById(id: number): Promise<Food | null> {
    const rows = await executeQuery<Food>(
      `SELECT id, name, protein, carbs, fat, calories, portion, created_at as createdAt
       FROM foods WHERE id = ?`,
      [id]
    );
    return rows.length > 0 ? rows[0] : null;
  },

  /**
   * Update food item
   */
  async update(id: number, updates: Partial<Omit<Food, 'id' | 'createdAt'>>): Promise<void> {
    const fields: string[] = [];
    const values: any[] = [];

    Object.entries(updates).forEach(([key, value]) => {
      const dbKey = key
        .replace(/([A-Z])/g, '_$1')
        .toLowerCase();
      fields.push(`${dbKey} = ?`);
      values.push(value);
    });

    values.push(id);

    await executeUpdate(
      `UPDATE foods SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
  },

  /**
   * Delete food item
   */
  async delete(id: number): Promise<void> {
    await executeUpdate(`DELETE FROM foods WHERE id = ?`, [id]);
  },

  /**
   * Get frequently used foods (for quick access)
   */
  async getFrequent(limit: number = 10): Promise<Food[]> {
    return executeQuery<Food>(
      `SELECT f.id, f.name, f.protein, f.carbs, f.fat, f.calories, f.portion, f.created_at as createdAt
       FROM foods f
       LEFT JOIN meal_foods mf ON f.id = mf.food_id
       GROUP BY f.id
       ORDER BY COUNT(mf.food_id) DESC
       LIMIT ?`,
      [limit]
    );
  },
};

/**
 * Diet Service - Diet plan management
 */
export const DietService = {
  /**
   * Create a new diet for a client
   */
  async create(
    clientId: number,
    name: string,
    description: string
  ): Promise<number> {
    const result = await executeUpdate(
      `INSERT INTO diets (client_id, name, description, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?)`,
      [clientId, name, description, Date.now(), Date.now()]
    );
    return (result as any).insertId;
  },

  /**
   * Get all diets for a client
   */
  async getClientDiets(clientId: number): Promise<any[]> {
    return executeQuery<any>(
      `SELECT id, client_id as clientId, name, description, created_at as createdAt, updated_at as updatedAt
       FROM diets WHERE client_id = ? ORDER BY created_at DESC`,
      [clientId]
    );
  },

  /**
   * Get diet with foods
   */
  async getDietWithFoods(dietId: number): Promise<any | null> {
    const diets = await executeQuery<any>(
      `SELECT id, client_id as clientId, name, description, created_at as createdAt, updated_at as updatedAt
       FROM diets WHERE id = ?`,
      [dietId]
    );

    if (diets.length === 0) return null;

    const diet = diets[0];
    const foods = await this.getDietFoods(dietId);

    return { ...diet, foods };
  },

  /**
   * Get foods assigned to a diet
   */
  async getDietFoods(dietId: number): Promise<any[]> {
    return executeQuery<any>(
      `SELECT f.id, f.name, f.protein, f.carbs, f.fat, f.calories, f.portion, f.created_at as createdAt,
              df.quantity, df.meal_type as mealType
       FROM diet_foods df
       JOIN foods f ON df.food_id = f.id
       WHERE df.diet_id = ?
       ORDER BY df.meal_type, f.name ASC`,
      [dietId]
    );
  },

  /**
   * Add food to diet
   */
  async addFood(
    dietId: number,
    foodId: number,
    quantity: number,
    mealType: string
  ): Promise<void> {
    await executeUpdate(
      `INSERT OR REPLACE INTO diet_foods (diet_id, food_id, quantity, meal_type)
       VALUES (?, ?, ?, ?)`,
      [dietId, foodId, quantity, mealType]
    );
  },

  /**
   * Remove food from diet
   */
  async removeFood(dietId: number, foodId: number): Promise<void> {
    await executeUpdate(
      `DELETE FROM diet_foods WHERE diet_id = ? AND food_id = ?`,
      [dietId, foodId]
    );
  },

  /**
   * Delete diet
   */
  async delete(dietId: number): Promise<void> {
    await executeUpdate(`DELETE FROM diets WHERE id = ?`, [dietId]);
  },

  /**
   * Calculate diet macros
   */
  async getDietMacros(
    dietId: number
  ): Promise<{ totalProtein: number; totalCarbs: number; totalFat: number; totalCalories: number }> {
    const foods = await this.getDietFoods(dietId);

    return foods.reduce(
      (acc, food) => {
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
};
