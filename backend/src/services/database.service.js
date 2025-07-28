const { supabaseAdmin } = require('../config/supabase-client');
const { log } = require('../config/logger');

/**
 * Unified Database Service for Supabase
 * Handles all database operations with consistent interface
 */
class DatabaseService {
  constructor() {
    this.client = supabaseAdmin;
  }

  /**
   * Execute a database query
   * @param {string} table - Table name
   * @param {string} operation - Operation type (select, insert, update, delete, upsert)
   * @param {object} params - Query parameters
   */
  async query(table, operation, params = {}) {
    try {
      const query = this.client.from(table);
      let result;

      switch (operation) {
        case 'select':
          result = await this.handleSelect(query, params);
          break;
        case 'insert':
          result = await this.handleInsert(query, params);
          break;
        case 'update':
          result = await this.handleUpdate(query, params);
          break;
        case 'delete':
          result = await this.handleDelete(query, params);
          break;
        case 'upsert':
          result = await this.handleUpsert(query, params);
          break;
        default:
          throw new Error(`Unsupported operation: ${operation}`);
      }

      return result;
    } catch (error) {
      log.error(`Database query error on ${table}:`, {
        operation,
        error: error.message,
        params
      });
      throw error;
    }
  }

  /**
   * Handle SELECT operations
   */
  async handleSelect(query, params) {
    // Select columns
    if (params.columns) {
      query = query.select(params.columns);
    } else {
      query = query.select('*');
    }

    // Apply filters
    if (params.filters) {
      for (const [key, value] of Object.entries(params.filters)) {
        if (value === null) {
          query = query.is(key, null);
        } else if (Array.isArray(value)) {
          query = query.in(key, value);
        } else if (typeof value === 'object' && value.operator) {
          // Advanced filters like { operator: 'gte', value: 10 }
          query = this.applyAdvancedFilter(query, key, value);
        } else {
          query = query.eq(key, value);
        }
      }
    }

    // Text search
    if (params.textSearch) {
      const { column, value } = params.textSearch;
      query = query.textSearch(column, value);
    }

    // Ordering
    if (params.order) {
      const orders = Array.isArray(params.order) ? params.order : [params.order];
      for (const order of orders) {
        query = query.order(order.column, {
          ascending: order.ascending !== false,
          nullsFirst: order.nullsFirst
        });
      }
    }

    // Pagination
    if (params.limit) {
      query = query.limit(params.limit);
    }
    if (params.offset) {
      query = query.range(params.offset, params.offset + (params.limit || 10) - 1);
    }

    // Execute query
    const { data, error, count } = await query;

    if (error) throw error;

    return {
      data,
      count,
      success: true
    };
  }

  /**
   * Handle INSERT operations
   */
  async handleInsert(query, params) {
    if (!params.data) {
      throw new Error('Insert operation requires data');
    }

    query = query.insert(params.data);

    // Return inserted data by default
    if (params.returning !== false) {
      query = query.select();
    }

    const { data, error } = await query;

    if (error) throw error;

    return {
      data,
      success: true
    };
  }

  /**
   * Handle UPDATE operations
   */
  async handleUpdate(query, params) {
    if (!params.data) {
      throw new Error('Update operation requires data');
    }

    query = query.update(params.data);

    // Apply filters
    if (params.filters) {
      for (const [key, value] of Object.entries(params.filters)) {
        query = query.eq(key, value);
      }
    } else {
      throw new Error('Update operation requires filters to prevent updating all rows');
    }

    // Return updated data by default
    if (params.returning !== false) {
      query = query.select();
    }

    const { data, error } = await query;

    if (error) throw error;

    return {
      data,
      success: true
    };
  }

  /**
   * Handle DELETE operations
   */
  async handleDelete(query, params) {
    // Apply filters
    if (params.filters) {
      for (const [key, value] of Object.entries(params.filters)) {
        query = query.eq(key, value);
      }
    } else {
      throw new Error('Delete operation requires filters to prevent deleting all rows');
    }

    const { data, error } = await query;

    if (error) throw error;

    return {
      data,
      success: true
    };
  }

  /**
   * Handle UPSERT operations
   */
  async handleUpsert(query, params) {
    if (!params.data) {
      throw new Error('Upsert operation requires data');
    }

    query = query.upsert(params.data, {
      onConflict: params.conflictColumns || 'id',
      ignoreDuplicates: params.ignoreDuplicates || false
    });

    // Return upserted data by default
    if (params.returning !== false) {
      query = query.select();
    }

    const { data, error } = await query;

    if (error) throw error;

    return {
      data,
      success: true
    };
  }

  /**
   * Apply advanced filters
   */
  applyAdvancedFilter(query, column, filter) {
    const { operator, value } = filter;

    switch (operator) {
      case 'gt':
        return query.gt(column, value);
      case 'gte':
        return query.gte(column, value);
      case 'lt':
        return query.lt(column, value);
      case 'lte':
        return query.lte(column, value);
      case 'like':
        return query.like(column, value);
      case 'ilike':
        return query.ilike(column, value);
      case 'contains':
        return query.contains(column, value);
      case 'containedBy':
        return query.containedBy(column, value);
      case 'overlap':
        return query.overlaps(column, value);
      default:
        throw new Error(`Unknown filter operator: ${operator}`);
    }
  }

  /**
   * Execute raw SQL (admin only)
   */
  async rawQuery(sql, params = []) {
    try {
      const { data, error } = await this.client.rpc('exec_sql', {
        query: sql,
        params
      });

      if (error) throw error;

      return {
        data,
        success: true
      };
    } catch (error) {
      log.error('Raw SQL query error:', {
        sql,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Transaction helper (using Supabase RPC)
   */
  async transaction(callback) {
    // Note: Supabase doesn't support client-side transactions
    // This is a placeholder for future implementation
    // Consider using database functions for complex transactions
    log.warn('Client-side transactions not supported in Supabase. Consider using database functions.');
    return callback(this);
  }

  /**
   * Batch operations
   */
  async batchInsert(table, records, batchSize = 1000) {
    const results = [];

    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize);
      const { data, error } = await this.client
        .from(table)
        .insert(batch)
        .select();

      if (error) {
        log.error(`Batch insert error at index ${i}:`, error);
        throw error;
      }

      results.push(...data);
    }

    return {
      data: results,
      success: true,
      totalInserted: results.length
    };
  }

  /**
   * Vector similarity search
   */
  async vectorSearch(table, embedding, options = {}) {
    const {
      limit = 10,
      threshold = 0.5,
      vectorColumn = 'embedding'
    } = options;

    try {
      const { data, error } = await this.client
        .rpc('vector_search', {
          query_embedding: embedding,
          match_count: limit,
          similarity_threshold: threshold,
          table_name: table,
          vector_column: vectorColumn
        });

      if (error) throw error;

      return {
        data,
        success: true
      };
    } catch (error) {
      log.error('Vector search error:', {
        table,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Get table statistics
   */
  async getTableStats(table) {
    try {
      const { count, error } = await this.client
        .from(table)
        .select('*', { count: 'exact', head: true });

      if (error) throw error;

      return {
        table,
        rowCount: count,
        success: true
      };
    } catch (error) {
      log.error('Table stats error:', {
        table,
        error: error.message
      });
      throw error;
    }
  }
}

// Create singleton instance
const databaseService = new DatabaseService();

module.exports = {
  databaseService,
  DatabaseService
};
