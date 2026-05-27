/**
 * Routine Service - Training routines management
 * Handles routines for different muscle groups
 */

import { Exercise, Routine } from '../schema';
import { executeQuery, executeUpdate } from '../sqlite';

export const RoutineService = {
  /**
   * Create a new routine for a client
   */
  async create(
    clientId: number,
    name: string,
    description: string,
    muscleGroup: string
  ): Promise<number> {
    const result = await executeUpdate(
      `INSERT INTO routines (client_id, name, description, muscle_group, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [clientId, name, description, muscleGroup, Date.now(), Date.now()]
    );
    return (result as any).insertId;
  },

  /**
   * Get all routines for a client
   */
  async getClientRoutines(clientId: number): Promise<Routine[]> {
    return executeQuery<Routine>(
      `SELECT id, client_id as clientId, name, description, muscle_group as muscleGroup,
              created_at as createdAt, updated_at as updatedAt
       FROM routines WHERE client_id = ? ORDER BY muscle_group, created_at DESC`,
      [clientId]
    );
  },

  /**
   * Get routine with all exercises
   */
  async getRoutineWithExercises(
    routineId: number
  ): Promise<(Routine & { exercises: (Exercise & { order: number })[] }) | null> {
    const routines = await executeQuery<any>(
      `SELECT id, client_id as clientId, name, description, muscle_group as muscleGroup,
              created_at as createdAt, updated_at as updatedAt
       FROM routines WHERE id = ?`,
      [routineId]
    );

    if (routines.length === 0) return null;

    const routine = routines[0];
    const exercises = await this.getRoutineExercises(routineId);

    return { ...routine, exercises };
  },

  /**
   * Get exercises in a routine
   */
  async getRoutineExercises(
    routineId: number
  ): Promise<(Exercise & { order: number })[]> {
    return executeQuery<Exercise & { order: number }>(
      `SELECT e.id, e.name, e.muscle_group as muscleGroup, e.series, e.repetitions,
              e.weight, e.rest_seconds as restSeconds, e.notes, e.created_at as createdAt,
              re.exercise_order as order
       FROM routine_exercises re
       JOIN exercises e ON re.exercise_id = e.id
       WHERE re.routine_id = ?
       ORDER BY re.exercise_order ASC`,
      [routineId]
    );
  },

  /**
   * Add exercise to routine
   */
  async addExercise(routineId: number, exerciseId: number, order: number): Promise<void> {
    await executeUpdate(
      `INSERT OR REPLACE INTO routine_exercises (routine_id, exercise_id, exercise_order)
       VALUES (?, ?, ?)`,
      [routineId, exerciseId, order]
    );
  },

  /**
   * Remove exercise from routine
   */
  async removeExercise(routineId: number, exerciseId: number): Promise<void> {
    await executeUpdate(
      `DELETE FROM routine_exercises WHERE routine_id = ? AND exercise_id = ?`,
      [routineId, exerciseId]
    );
  },

  /**
   * Delete routine
   */
  async delete(routineId: number): Promise<void> {
    await executeUpdate(`DELETE FROM routines WHERE id = ?`, [routineId]);
  },
};

/**
 * Exercise Service - Exercise library management
 */
export const ExerciseService = {
  /**
   * Create a new exercise
   */
  async create(
    name: string,
    muscleGroup: string,
    series: number,
    repetitions: number,
    weight?: number,
    restSeconds?: number,
    notes?: string
  ): Promise<number> {
    const result = await executeUpdate(
      `INSERT INTO exercises (name, muscle_group, series, repetitions, weight, rest_seconds, notes, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, muscleGroup, series, repetitions, weight ?? 0, restSeconds ?? 60, notes ?? '', Date.now()]
    );
    return (result as any).insertId;
  },

  /**
   * Get all exercises by muscle group
   */
  async getByMuscleGroup(muscleGroup: string): Promise<Exercise[]> {
    return executeQuery<Exercise>(
      `SELECT id, name, muscle_group as muscleGroup, series, repetitions,
              weight, rest_seconds as restSeconds, notes, created_at as createdAt
       FROM exercises WHERE muscle_group = ? ORDER BY name ASC`,
      [muscleGroup]
    );
  },

  /**
   * Get exercise by ID
   */
  async getById(id: number): Promise<Exercise | null> {
    const rows = await executeQuery<Exercise>(
      `SELECT id, name, muscle_group as muscleGroup, series, repetitions,
              weight, rest_seconds as restSeconds, notes, created_at as createdAt
       FROM exercises WHERE id = ?`,
      [id]
    );
    return rows.length > 0 ? rows[0] : null;
  },

  /**
   * Get all exercises
   */
  async getAll(): Promise<Exercise[]> {
    return executeQuery<Exercise>(
      `SELECT id, name, muscle_group as muscleGroup, series, repetitions,
              weight, rest_seconds as restSeconds, notes, created_at as createdAt
       FROM exercises ORDER BY muscle_group, name ASC`
    );
  },

  /**
   * Update exercise
   */
  async update(id: number, updates: Partial<Omit<Exercise, 'id' | 'createdAt'>>): Promise<void> {
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
      `UPDATE exercises SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
  },
};
