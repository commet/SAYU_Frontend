const { pool } = require('./database');
const { getSupabaseClient, getSupabaseAdmin } = require('./supabase');
const { log } = require('./logger');

/**
 * Hybrid database configuration for Railway + Supabase
 */
class HybridDatabase {
  constructor() {
    this.railway = pool;
    this.supabase = null;
    this.supabaseAdmin = null;
    this.serviceRouting = this.initializeServiceRouting();
  }

  /**
   * Initialize service routing configuration
   */
  initializeServiceRouting() {
    return {
      // Supabase services
      users: 'supabase',
      auth: 'supabase',
      ai_recommendations: 'supabase',
      user_preferences: 'supabase',
      recommendation_feedback: 'supabase',
      exhibition_calendar: 'supabase',
      calendar_subscriptions: 'supabase',
      smart_notifications: 'supabase',
      artvee_artworks: 'supabase',
      artwork_personality_tags: 'supabase',
      artwork_usage_logs: 'supabase',
      
      // Railway services
      gamification_points: 'railway',
      gamification_levels: 'railway',
      gamification_challenges: 'railway',
      gamification_leaderboards: 'railway',
      global_exhibitions: 'railway',
      exhibition_sources: 'railway',
      scraping_jobs: 'railway',
      
      // Shared tables (read from Supabase, cache in Railway)
      exhibitions: 'hybrid',
      institutions: 'hybrid',
      exhibition_tags: 'hybrid'
    };
  }

  /**
   * Initialize hybrid database connections
   */
  async initialize() {
    try {
      // Initialize Supabase
      this.supabase = getSupabaseClient();
      this.supabaseAdmin = getSupabaseAdmin();
      
      if (!this.supabase) {
        log.warn('Supabase not configured - using Railway only mode');
      } else {
        log.info('Hybrid database initialized with Supabase + Railway');
      }
      
      return true;
    } catch (error) {
      log.error('Failed to initialize hybrid database', error);
      throw error;
    }
  }

  /**
   * Get database client for a specific table
   */
  getClientForTable(tableName) {
    const routing = this.serviceRouting[tableName] || 'railway';
    
    switch (routing) {
      case 'supabase':
        if (!this.supabase) {
          log.warn(`Supabase not available for table ${tableName}, falling back to Railway`);
          return { type: 'railway', client: this.railway };
        }
        return { type: 'supabase', client: this.supabase };
      
      case 'railway':
        return { type: 'railway', client: this.railway };
      
      case 'hybrid':
        // For hybrid tables, prefer Supabase if available
        if (this.supabase) {
          return { type: 'supabase', client: this.supabase };
        }
        return { type: 'railway', client: this.railway };
      
      default:
        return { type: 'railway', client: this.railway };
    }
  }

  /**
   * Execute query with automatic routing
   */
  async query(tableName, operation, params = {}) {
    const { type, client } = this.getClientForTable(tableName);
    
    try {
      if (type === 'supabase') {
        return await this.executeSupabaseQuery(client, tableName, operation, params);
      } else {
        return await this.executeRailwayQuery(client, tableName, operation, params);
      }
    } catch (error) {
      log.error(`Query failed on ${type} for table ${tableName}`, {
        operation,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Execute Supabase query
   */
  async executeSupabaseQuery(client, tableName, operation, params) {
    let query = client.from(tableName);
    
    switch (operation) {
      case 'select':
        if (params.columns) {
          query = query.select(params.columns);
        } else {
          query = query.select('*');
        }
        if (params.filters) {
          Object.entries(params.filters).forEach(([key, value]) => {
            if (Array.isArray(value)) {
              query = query.in(key, value);
            } else if (value === null) {
              query = query.is(key, null);
            } else {
              query = query.eq(key, value);
            }
          });
        }
        if (params.order) {
          query = query.order(params.order.column, { ascending: params.order.ascending });
        }
        if (params.limit) {
          query = query.limit(params.limit);
        }
        if (params.offset) {
          query = query.range(params.offset, params.offset + (params.limit || 10) - 1);
        }
        break;
        
      case 'insert':
        query = query.insert(params.data);
        if (params.returning !== false) {
          query = query.select();
        }
        break;
        
      case 'update':
        query = query.update(params.data);
        if (params.filters) {
          Object.entries(params.filters).forEach(([key, value]) => {
            query = query.eq(key, value);
          });
        }
        if (params.returning !== false) {
          query = query.select();
        }
        break;
        
      case 'delete':
        query = query.delete();
        if (params.filters) {
          Object.entries(params.filters).forEach(([key, value]) => {
            query = query.eq(key, value);
          });
        }
        break;
        
      case 'upsert':
        query = query.upsert(params.data, {
          onConflict: params.conflictColumns || 'id'
        });
        if (params.returning !== false) {
          query = query.select();
        }
        break;
        
      default:
        throw new Error(`Unsupported operation: ${operation}`);
    }
    
    const { data, error } = await query;
    
    if (error) {
      throw error;
    }
    
    return { rows: data, rowCount: data ? data.length : 0 };
  }

  /**
   * Execute Railway (PostgreSQL) query
   */
  async executeRailwayQuery(client, tableName, operation, params) {
    let queryText = '';
    let values = [];
    
    switch (operation) {
      case 'select':
        queryText = this.buildSelectQuery(tableName, params);
        values = this.buildSelectValues(params);
        break;
        
      case 'insert':
        const insertResult = this.buildInsertQuery(tableName, params);
        queryText = insertResult.query;
        values = insertResult.values;
        break;
        
      case 'update':
        const updateResult = this.buildUpdateQuery(tableName, params);
        queryText = updateResult.query;
        values = updateResult.values;
        break;
        
      case 'delete':
        const deleteResult = this.buildDeleteQuery(tableName, params);
        queryText = deleteResult.query;
        values = deleteResult.values;
        break;
        
      case 'upsert':
        const upsertResult = this.buildUpsertQuery(tableName, params);
        queryText = upsertResult.query;
        values = upsertResult.values;
        break;
        
      default:
        throw new Error(`Unsupported operation: ${operation}`);
    }
    
    return await client.query(queryText, values);
  }

  /**
   * Build SELECT query for PostgreSQL
   */
  buildSelectQuery(tableName, params) {
    let query = `SELECT ${params.columns || '*'} FROM ${tableName}`;
    const conditions = [];
    
    if (params.filters) {
      Object.entries(params.filters).forEach(([key, value], index) => {
        if (Array.isArray(value)) {
          const placeholders = value.map((_, i) => `$${conditions.length + i + 1}`).join(',');
          conditions.push(`${key} IN (${placeholders})`);
        } else if (value === null) {
          conditions.push(`${key} IS NULL`);
        } else {
          conditions.push(`${key} = $${conditions.length + 1}`);
        }
      });
    }
    
    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`;
    }
    
    if (params.order) {
      query += ` ORDER BY ${params.order.column} ${params.order.ascending ? 'ASC' : 'DESC'}`;
    }
    
    if (params.limit) {
      query += ` LIMIT ${params.limit}`;
    }
    
    if (params.offset) {
      query += ` OFFSET ${params.offset}`;
    }
    
    return query;
  }

  /**
   * Build values array for SELECT query
   */
  buildSelectValues(params) {
    const values = [];
    
    if (params.filters) {
      Object.values(params.filters).forEach(value => {
        if (Array.isArray(value)) {
          values.push(...value);
        } else if (value !== null) {
          values.push(value);
        }
      });
    }
    
    return values;
  }

  /**
   * Build INSERT query for PostgreSQL
   */
  buildInsertQuery(tableName, params) {
    const data = Array.isArray(params.data) ? params.data : [params.data];
    const columns = Object.keys(data[0]);
    const values = [];
    
    const valuePlaceholders = data.map((row, rowIndex) => {
      const placeholders = columns.map((col, colIndex) => {
        values.push(row[col]);
        return `$${rowIndex * columns.length + colIndex + 1}`;
      });
      return `(${placeholders.join(',')})`;
    }).join(',');
    
    let query = `INSERT INTO ${tableName} (${columns.join(',')}) VALUES ${valuePlaceholders}`;
    
    if (params.returning !== false) {
      query += ' RETURNING *';
    }
    
    return { query, values };
  }

  /**
   * Build UPDATE query for PostgreSQL
   */
  buildUpdateQuery(tableName, params) {
    const columns = Object.keys(params.data);
    const values = Object.values(params.data);
    
    const setClause = columns.map((col, index) => `${col} = $${index + 1}`).join(',');
    let query = `UPDATE ${tableName} SET ${setClause}`;
    
    if (params.filters) {
      const conditions = [];
      Object.entries(params.filters).forEach(([key, value]) => {
        values.push(value);
        conditions.push(`${key} = $${values.length}`);
      });
      query += ` WHERE ${conditions.join(' AND ')}`;
    }
    
    if (params.returning !== false) {
      query += ' RETURNING *';
    }
    
    return { query, values };
  }

  /**
   * Build DELETE query for PostgreSQL
   */
  buildDeleteQuery(tableName, params) {
    let query = `DELETE FROM ${tableName}`;
    const values = [];
    
    if (params.filters) {
      const conditions = [];
      Object.entries(params.filters).forEach(([key, value]) => {
        values.push(value);
        conditions.push(`${key} = $${values.length}`);
      });
      query += ` WHERE ${conditions.join(' AND ')}`;
    }
    
    return { query, values };
  }

  /**
   * Build UPSERT query for PostgreSQL
   */
  buildUpsertQuery(tableName, params) {
    const insertResult = this.buildInsertQuery(tableName, params);
    const conflictColumns = Array.isArray(params.conflictColumns) 
      ? params.conflictColumns 
      : [params.conflictColumns || 'id'];
    
    const data = Array.isArray(params.data) ? params.data[0] : params.data;
    const updateColumns = Object.keys(data).filter(col => !conflictColumns.includes(col));
    
    let query = insertResult.query;
    query = query.replace(' RETURNING *', '');
    query += ` ON CONFLICT (${conflictColumns.join(',')}) DO UPDATE SET `;
    query += updateColumns.map(col => `${col} = EXCLUDED.${col}`).join(',');
    
    if (params.returning !== false) {
      query += ' RETURNING *';
    }
    
    return { query, values: insertResult.values };
  }

  /**
   * Transaction support for hybrid operations
   */
  async transaction(callback) {
    // For now, transactions only work within a single database
    // Future enhancement: distributed transaction support
    const client = await this.railway.connect();
    
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Sync data between Railway and Supabase
   */
  async syncTable(tableName, direction = 'railway-to-supabase') {
    if (!this.supabase) {
      log.warn('Cannot sync - Supabase not configured');
      return { success: false, message: 'Supabase not configured' };
    }

    try {
      if (direction === 'railway-to-supabase') {
        // Fetch from Railway
        const { rows } = await this.railway.query(`SELECT * FROM ${tableName}`);
        
        // Insert/update in Supabase
        const { error } = await this.supabase
          .from(tableName)
          .upsert(rows, { onConflict: 'id' });
        
        if (error) throw error;
        
        return { success: true, synced: rows.length };
      } else {
        // Fetch from Supabase
        const { data, error } = await this.supabase
          .from(tableName)
          .select('*');
        
        if (error) throw error;
        
        // Insert/update in Railway
        for (const row of data) {
          await this.executeRailwayQuery(this.railway, tableName, 'upsert', {
            data: row,
            conflictColumns: 'id'
          });
        }
        
        return { success: true, synced: data.length };
      }
    } catch (error) {
      log.error(`Failed to sync table ${tableName}`, error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Health check for both databases
   */
  async healthCheck() {
    const health = {
      railway: false,
      supabase: false,
      hybrid: false
    };

    try {
      // Check Railway
      const railwayResult = await this.railway.query('SELECT 1');
      health.railway = railwayResult.rows.length > 0;
    } catch (error) {
      log.error('Railway health check failed', error);
    }

    try {
      // Check Supabase
      if (this.supabase) {
        const { error } = await this.supabase.from('users').select('id').limit(1);
        health.supabase = !error;
      }
    } catch (error) {
      log.error('Supabase health check failed', error);
    }

    health.hybrid = health.railway || health.supabase;
    
    return health;
  }

  /**
   * Get database connection status
   */
  async getStatus() {
    const status = {
      railway: { connected: false, latency: null },
      supabase: { connected: false, latency: null }
    };

    // Check Railway
    try {
      const start = Date.now();
      await this.railway.query('SELECT 1');
      status.railway.connected = true;
      status.railway.latency = Date.now() - start;
    } catch (error) {
      log.error('Railway status check failed', error);
    }

    // Check Supabase
    if (this.supabase) {
      try {
        const start = Date.now();
        const { error } = await this.supabase.from('users').select('count').limit(1);
        status.supabase.connected = !error;
        status.supabase.latency = Date.now() - start;
      } catch (error) {
        log.error('Supabase status check failed', error);
      }
    }

    return status;
  }

  /**
   * Get migration progress information
   */
  async getMigrationProgress() {
    const progress = {};
    
    // This is a placeholder - implement actual migration tracking
    const services = process.env.SUPABASE_SERVICES ? process.env.SUPABASE_SERVICES.split(',') : [];
    
    for (const table in this.serviceRouting) {
      progress[table] = {
        migrated: services.includes(table),
        database: this.serviceRouting[table]
      };
    }
    
    return progress;
  }
}

// Create singleton instance
const hybridDB = new HybridDatabase();

// Initialize on load
hybridDB.initialize().catch(error => {
  log.error('Failed to initialize hybrid database', error);
});

module.exports = {
  hybridDB,
  HybridDatabase
};