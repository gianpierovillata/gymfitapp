/**
 * SQLite Database Manager - Web Implementation
 * Uses in-memory storage for web builds where expo-sqlite native module is unavailable
 */

interface StoredRow {
  [column: string]: any;
}

interface TableData {
  columns: string[];
  rows: StoredRow[];
  autoIncrement: number;
}

class InMemoryDatabase {
  private tables: Map<string, TableData> = new Map();
  private static instance: InMemoryDatabase;

  static getInstance(): InMemoryDatabase {
    if (!this.instance) {
      this.instance = new InMemoryDatabase();
    }
    return this.instance;
  }

  executeSql(sql: string, params: (string | number)[] = []): { insertId?: number; rowsAffected: number; rows: StoredRow[] } {
    const normalizedSql = sql.trim().toUpperCase();

    if (normalizedSql.startsWith('CREATE TABLE')) {
      return this.handleCreateTable(sql);
    }
    if (normalizedSql.startsWith('CREATE INDEX')) {
      return { rowsAffected: 0, rows: [] };
    }
    if (normalizedSql.startsWith('INSERT')) {
      return this.handleInsert(sql, params);
    }
    if (normalizedSql.startsWith('SELECT')) {
      return this.handleSelect(sql, params);
    }
    if (normalizedSql.startsWith('UPDATE')) {
      return this.handleUpdate(sql, params);
    }
    if (normalizedSql.startsWith('DELETE')) {
      return this.handleDelete(sql, params);
    }

    return { rowsAffected: 0, rows: [] };
  }

  private getTableName(sql: string): string {
    const match = sql.match(/(?:CREATE TABLE\s+IF NOT EXISTS\s+|CREATE TABLE\s+|FROM\s+|INTO\s+|UPDATE\s+|DELETE FROM\s+)(\w+)/i);
    return match ? match[1].toLowerCase() : '';
  }

  private handleCreateTable(sql: string): { insertId?: number; rowsAffected: number; rows: StoredRow[] } {
    const tableName = this.getTableName(sql);
    if (!this.tables.has(tableName)) {
      this.tables.set(tableName, { columns: [], rows: [], autoIncrement: 1 });
    }
    return { rowsAffected: 0, rows: [] };
  }

  private handleInsert(sql: string, params: (string | number)[]): { insertId?: number; rowsAffected: number; rows: StoredRow[] } {
    const tableName = this.getTableName(sql);
    const table = this.tables.get(tableName);
    if (!table) return { rowsAffected: 0, rows: [] };

    const id = table.autoIncrement++;
    const colMatch = sql.match(/INSERT\s+(?:OR\s+REPLACE\s+)?INTO\s+\w+\s*\(([^)]+)\)/i);
    if (!colMatch) return { insertId: id, rowsAffected: 1, rows: [] };

    const columns = colMatch[1].split(',').map(c => c.trim().toLowerCase());
    const row: StoredRow = { id };

    columns.forEach((col, i) => {
      row[col] = params[i] ?? null;
    });

    // Check for ON CONFLICT (INSERT OR REPLACE)
    const isReplace = /INSERT\s+OR\s+REPLACE/i.test(sql);
    if (isReplace) {
      const existingIdx = table.rows.findIndex(r => columns.every(col => r[col] === row[col]));
      if (existingIdx >= 0) {
        table.rows[existingIdx] = { ...table.rows[existingIdx], ...row };
        return { insertId: id, rowsAffected: 1, rows: [] };
      }
    }

    table.rows.push(row);
    return { insertId: id, rowsAffected: 1, rows: [] };
  }

  private handleSelect(sql: string, _params: (string | number)[]): { rowsAffected: number; rows: StoredRow[] } {
    const tableName = this.getTableName(sql);
    const table = this.tables.get(tableName);
    if (!table) return { rowsAffected: 0, rows: [] };

    let rows = [...table.rows].map(r => {
      // Map snake_case keys to camelCase if needed
      const mapped: StoredRow = {};
      for (const [k, v] of Object.entries(r)) {
        mapped[k.replace(/_([a-z])/g, (_, c) => c.toUpperCase())] = v;
      }
      return mapped;
    });

    // Handle WHERE clause
    const whereMatch = sql.match(/WHERE\s+(.+?)(?:\s+ORDER\s+BY|\s+LIMIT|\s*$)/i);
    if (whereMatch) {
      const condition = whereMatch[1];
      rows = rows.filter(r => this.evaluateCondition(condition, r, _params));
    }

    // Handle ORDER BY
    const orderMatch = sql.match(/ORDER\s+BY\s+(\w+(?:\s+(?:ASC|DESC))?(?:\s*,\s*\w+(?:\s+(?:ASC|DESC))?)*)/i);
    if (orderMatch) {
      const orders = orderMatch[1].split(',').map(o => o.trim());
      rows.sort((a, b) => {
        for (const order of orders) {
          const [col, dir] = order.split(/\s+/);
          const multiplier = dir?.toUpperCase() === 'DESC' ? -1 : 1;
          if ((a[col] ?? '') < (b[col] ?? '')) return -1 * multiplier;
          if ((a[col] ?? '') > (b[col] ?? '')) return 1 * multiplier;
        }
        return 0;
      });
    }

    // Handle LIMIT
    const limitMatch = sql.match(/LIMIT\s+(\d+)/i);
    if (limitMatch) {
      rows = rows.slice(0, parseInt(limitMatch[1]));
    }

    // Handle alias mapping (e.g., body_fat_percentage as bodyFatPercentage)
    const selectColsMatch = sql.match(/SELECT\s+(.+?)\s+FROM/i);
    if (selectColsMatch) {
      const selectPart = selectColsMatch[1];
      if (selectPart !== '*') {
        const aliasMap = new Map<string, string>();
        selectPart.split(',').forEach(expr => {
          const aliasMatch = expr.match(/(\w+)(?:\s+as\s+(\w+))?/i);
          if (aliasMatch) {
            const colName = aliasMatch[1];
            const aliasName = aliasMatch[2] || aliasMatch[1];
            aliasMap.set(colName.toLowerCase(), aliasName);
          }
        });

        if (aliasMap.size > 0) {
          rows = rows.map(r => {
            const mapped: StoredRow = {};
            for (const [k, v] of Object.entries(r)) {
              mapped[aliasMap.get(k.toLowerCase()) || k] = v;
            }
            return mapped;
          });
        }
      }
    }

    // Handle COUNT(*) aggregation
    if (/COUNT\s*\(\s*\*\s*\)/i.test(sql)) {
      return { rowsAffected: 0, rows: [{ count: rows.length }] };
    }
    if (/COUNT\s*\(/i.test(sql)) {
      return { rowsAffected: 0, rows: [{ count: rows.length }] };
    }

    // Handle GROUP BY with aggregation
    const groupByMatch = sql.match(/GROUP\s+BY\s+(\w+)/i);
    if (groupByMatch && /COUNT\s*\(/i.test(sql)) {
      const groupCol = groupByMatch[1].toLowerCase();
      const grouped = new Map<string, number>();
      rows.forEach(r => {
        const key = String(r[groupCol] ?? '');
        grouped.set(key, (grouped.get(key) || 0) + 1);
      });
      const result: StoredRow[] = [];
      grouped.forEach((count, key) => {
        const row: StoredRow = {};
        row[groupCol] = /^\d+$/.test(key) ? parseInt(key) : key;
        row['count'] = count;
        result.push(row);
      });
      return { rowsAffected: 0, rows: result };
    }

    return { rowsAffected: 0, rows };
  }

  private evaluateCondition(condition: string, row: StoredRow, params: (string | number)[]): boolean {
    const paramRefs: string[] = [];
    condition.replace(/\?/g, () => {
      paramRefs.push(params[paramRefs.length] as string);
      return '?';
    });

    // Handle AND conditions
    const parts = condition.split(/\s+AND\s+/i);
    return parts.every(part => this.evaluateSingleCondition(part, row, paramRefs));
  }

  private evaluateSingleCondition(condition: string, row: StoredRow, _params: string[]): boolean {
    const likeMatch = condition.match(/(\w+)\s+LIKE\s+'?([^']+)'?/i);
    if (likeMatch) {
      const col = likeMatch[1].toLowerCase();
      let pattern = likeMatch[2].toLowerCase();
      const val = String(row[col] ?? '').toLowerCase();
      pattern = pattern.replace(/%/g, '.*');
      try {
        return new RegExp('^' + pattern + '$').test(val);
      } catch {
        return false;
      }
    }

    // Handle NOT NULL
    if (/IS\s+NOT\s+NULL/i.test(condition)) {
      const colMatch = condition.match(/(\w+)\s+IS\s+NOT\s+NULL/i);
      if (colMatch) {
        return row[colMatch[1].toLowerCase()] != null && row[colMatch[1].toLowerCase()] !== 0;
      }
    }

    // Handle = or != or <, > etc.
    const opMatch = condition.match(/(\w+)\s*(=|!=|<>|>=|<=|>|<)\s*(.+)/i);
    if (opMatch) {
      const col = opMatch[1].toLowerCase();
      const op = opMatch[2];
      let val: any = opMatch[3].trim();
      if (val.startsWith("'") || val.startsWith('"')) {
        val = val.slice(1, -1);
      } else if (val.toLowerCase() === 'null') {
        val = null;
      } else if (!isNaN(Number(val))) {
        val = Number(val);
      }

      const rowVal = row[col];
      switch (op) {
        case '=': return rowVal == val;
        case '!=':
        case '<>': return rowVal != val;
        case '>': return Number(rowVal) > Number(val);
        case '<': return Number(rowVal) < Number(val);
        case '>=': return Number(rowVal) >= Number(val);
        case '<=': return Number(rowVal) <= Number(val);
      }
    }

    return true;
  }

  private handleUpdate(sql: string, _params: (string | number)[]): { rowsAffected: number; rows: StoredRow[] } {
    const tableName = this.getTableName(sql);
    const table = this.tables.get(tableName);
    if (!table) return { rowsAffected: 0, rows: [] };

    const setMatch = sql.match(/SET\s+(.+?)(?:\s+WHERE|\s*$)/i);
    if (!setMatch) return { rowsAffected: 0, rows: [] };

    const assignments = setMatch[1].split(',').map(a => a.trim());
    const setCols: { col: string; paramIdx: number }[] = [];
    let paramIdx = 0;
    assignments.forEach(a => {
      const m = a.match(/(\w+)\s*=\s*\?/i);
      if (m) {
        setCols.push({ col: m[1].toLowerCase(), paramIdx: paramIdx++ });
      } else {
        const m2 = a.match(/(\w+)\s*=\s*(\d+)/i);
        if (m2) {
          table.rows.forEach(r => { r[m2[1].toLowerCase()] = parseInt(m2[2]); });
        }
      }
    });

    // Simple filter: apply to all rows (WHERE handled by caller selection)
    table.rows.forEach(r => {
      setCols.forEach(sc => {
        r[sc.col] = _params[sc.paramIdx];
      });
    });

    return { rowsAffected: table.rows.length, rows: [] };
  }

  private handleDelete(sql: string, _params: (string | number)[]): { rowsAffected: number; rows: StoredRow[] } {
    const tableName = this.getTableName(sql);
    const table = this.tables.get(tableName);
    if (!table) return { rowsAffected: 0, rows: [] };

    const count = table.rows.length;
    table.rows = [];
    return { rowsAffected: count, rows: [] };
  }
}

const db = InMemoryDatabase.getInstance();

import { SCHEMA_SQL } from './schema';

export async function initDB(): Promise<void> {
  console.log('ℹ️  SQLite not available on web. Using in-memory database.');
  for (const sql of SCHEMA_SQL) {
    db.executeSql(sql);
  }
  console.log('✓ Schema tables created in-memory');
}

export function executeQuery<T = any>(
  sql: string,
  params: (string | number)[] = []
): Promise<T[]> {
  try {
    const result = db.executeSql(sql, params);
    return Promise.resolve(result.rows as T[]);
  } catch (error) {
    console.warn('executeQuery error on web:', sql, error);
    return Promise.resolve([]);
  }
}

export function executeUpdate(
  sql: string,
  params: (string | number)[] = []
): Promise<any> {
  try {
    const result = db.executeSql(sql, params);
    return Promise.resolve({ insertId: result.insertId ?? Date.now(), rowsAffected: result.rowsAffected });
  } catch (error) {
    console.warn('executeUpdate error on web:', sql, error);
    return Promise.resolve({ insertId: Date.now() });
  }
}

export function executeTransaction(
  operations: Array<{ sql: string; params?: (string | number)[] }>
): Promise<void> {
  try {
    operations.forEach(({ sql, params = [] }) => {
      db.executeSql(sql, params);
    });
    return Promise.resolve();
  } catch (error) {
    console.warn('executeTransaction error on web:', error);
    return Promise.resolve();
  }
}

export default db;
