/**
 * SQLite Database Manager - Web Stub
 * This file is used for web builds where SQLite is not available
 * Data is stored in browser localStorage (in-memory for now)
 */

// Mock database for web - stores data in memory only
const mockDB = {
  tables: new Map<string, any[]>(),
};

export async function initDB(): Promise<void> {
  console.warn('ℹ️  SQLite not available on web. Using in-memory mock database.');
  // Mock: pretend to initialize
  return Promise.resolve();
}

export function executeQuery<T = any>(
  sql: string,
  params: (string | number)[] = []
): Promise<T[]> {
  console.warn('⚠️  executeQuery called on web (using mock)', sql);
  // Return empty array for mock
  return Promise.resolve([]);
}

export function executeUpdate(
  sql: string,
  params: (string | number)[] = []
): Promise<any> {
  console.warn('⚠️  executeUpdate called on web (using mock)', sql);
  // Return mock result
  return Promise.resolve({ insertId: Date.now() });
}

export function executeTransaction(
  operations: Array<{ sql: string; params?: (string | number)[] }>
): Promise<void> {
  console.warn('⚠️  executeTransaction called on web (using mock)');
  return Promise.resolve();
}

const db = mockDB;
export default db;
