/**
 * SQLite Database Manager for GymFit App
 * Handles database initialization, transactions, and query execution
 * Following security best practices for mobile apps
 */

import * as SQLite from 'expo-sqlite';
import { SCHEMA_SQL } from './schema';

const db = SQLite.openDatabase('gymfit.db');

/**
 * Initialize database with schema
 * Creates all tables on first app launch
 */
export async function initDB(): Promise<void> {
  return new Promise((resolve, reject) => {
    db.transaction(
      tx => {
        let completed = 0;

        SCHEMA_SQL.forEach((sql, index) => {
          tx.executeSql(
            sql,
            [],
            () => {
              completed++;
              if (completed === SCHEMA_SQL.length) {
                resolve();
              }
            },
            (_, error) => {
              console.error(`SQL error at statement ${index}:`, error);
              reject(error);
              return false;
            }
          );
        });
      },
      err => {
        console.error('Transaction error:', err);
        reject(err);
      }
    );
  });
}

/**
 * Generic query execution with parameters
 * Prevents SQL injection through parameterized queries
 */
export function executeQuery<T = any>(
  sql: string,
  params: (string | number)[] = []
): Promise<T[]> {
  return new Promise((resolve, reject) => {
    db.transaction(
      tx => {
        tx.executeSql(
          sql,
          params,
          (_, result) => resolve((result as any).rows._array as T[]),
          (_, error) => {
            console.error('Query error:', sql, error);
            reject(error);
            return false;
          }
        );
      },
      err => reject(err)
    );
  });
}

/**
 * Execute INSERT/UPDATE/DELETE operations
 */
export function executeUpdate(
  sql: string,
  params: (string | number)[] = []
): Promise<SQLite.SQLResultSet> {
  return new Promise((resolve, reject) => {
    db.transaction(
      tx => {
        tx.executeSql(
          sql,
          params,
          (_, result) => resolve(result),
          (_, error) => {
            console.error('Update error:', sql, error);
            reject(error);
            return false;
          }
        );
      },
      err => reject(err)
    );
  });
}

/**
 * Execute multiple queries in a transaction
 */
export function executeTransaction(
  operations: Array<{ sql: string; params?: (string | number)[] }>
): Promise<void> {
  return new Promise((resolve, reject) => {
    db.transaction(
      tx => {
        try {
          operations.forEach(({ sql, params = [] }) => {
            tx.executeSql(sql, params);
          });
          resolve();
        } catch (error) {
          reject(error);
        }
      },
      err => reject(err)
    );
  });
}

export default db;
