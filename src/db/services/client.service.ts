/**
 * Client Service - CRUD operations for clients
 * Handles all client-related database operations
 */

import { Client } from '../schema';
import { executeQuery, executeUpdate } from '../sqlite';

export const ClientService = {
  /**
   * Create a new client
   */
  async create(client: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>): Promise<number> {
    const now = Date.now();
    const result = await executeUpdate(
      `INSERT INTO clients (name, email, height, weight, body_fat_percentage, shirt_size, trainer_id, notes, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        client.name,
        client.email,
        client.height,
        client.weight,
        client.bodyFatPercentage,
        client.shirtSize,
        client.trainerId ?? 0,
        client.notes,
        now,
        now,
      ]
    );
    return (result as any).insertId;
  },

  /**
   * Get all clients
   */
  async getAll(): Promise<Client[]> {
    const rows = await executeQuery<any>(
      `SELECT id, name, email, height, weight, body_fat_percentage as bodyFatPercentage,
              shirt_size as shirtSize, trainer_id as trainerId, notes, created_at as createdAt,
              updated_at as updatedAt FROM clients ORDER BY created_at DESC`
    );
    return rows.map(formatClientRow);
  },

  /**
   * Get client by ID
   */
  async getById(id: number): Promise<Client | null> {
    const rows = await executeQuery<any>(
      `SELECT id, name, email, height, weight, body_fat_percentage as bodyFatPercentage,
              shirt_size as shirtSize, trainer_id as trainerId, notes, created_at as createdAt,
              updated_at as updatedAt FROM clients WHERE id = ?`,
      [id]
    );
    return rows.length > 0 ? formatClientRow(rows[0]) : null;
  },

  /**
   * Update client info
   */
  async update(id: number, updates: Partial<Omit<Client, 'id' | 'createdAt'>>): Promise<void> {
    const fields: string[] = [];
    const values: any[] = [];

    Object.entries(updates).forEach(([key, value]) => {
      const dbKey = key
        .replace(/([A-Z])/g, '_$1')
        .toLowerCase();
      fields.push(`${dbKey} = ?`);
      values.push(value);
    });

    values.push(Date.now(), id);

    await executeUpdate(
      `UPDATE clients SET ${fields.join(', ')}, updated_at = ? WHERE id = ?`,
      values
    );
  },

  /**
   * Delete client
   */
  async delete(id: number): Promise<void> {
    await executeUpdate(`DELETE FROM clients WHERE id = ?`, [id]);
  },
};

// Helper: Convert database row format to Client type
function formatClientRow(row: any): Client {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    height: row.height,
    weight: row.weight,
    bodyFatPercentage: row.bodyFatPercentage,
    shirtSize: row.shirtSize,
    trainerId: row.trainerId,
    notes: row.notes,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}
