/**
 * Search Cars Tool
 * SQL-based car search in PostgreSQL catalog
 */

const { pool } = require('../config/database');

/**
 * Search cars by filters
 * @param {Object} filters - Search filters
 * @returns {Promise<Object>}
 */
async function searchCars(filters) {
  const conditions = [];
  const params = [];
  let paramIndex = 1;

  if (filters.mark_name) {
    conditions.push(`LOWER(mark_name) = LOWER($${paramIndex})`);
    params.push(filters.mark_name);
    paramIndex++;
  }

  if (filters.folder_name) {
    conditions.push(`LOWER(folder_name) LIKE LOWER($${paramIndex})`);
    params.push(`%${filters.folder_name}%`);
    paramIndex++;
  }

  if (filters.engine_type) {
    conditions.push(`LOWER(engine_type) = LOWER($${paramIndex})`);
    params.push(filters.engine_type);
    paramIndex++;
  }

  if (filters.body_type) {
    conditions.push(`body_type ILIKE $${paramIndex}`);
    params.push(`%${filters.body_type}%`);
    paramIndex++;
  }

  if (filters.transmission) {
    conditions.push(`LOWER(transmission) = LOWER($${paramIndex})`);
    params.push(filters.transmission);
    paramIndex++;
  }

  if (filters.drive_type) {
    conditions.push(`LOWER(drive_type) = LOWER($${paramIndex})`);
    params.push(filters.drive_type);
    paramIndex++;
  }

  if (filters.year_from) {
    conditions.push(`year >= $${paramIndex}`);
    params.push(filters.year_from);
    paramIndex++;
  }

  if (filters.year_to) {
    conditions.push(`year <= $${paramIndex}`);
    params.push(filters.year_to);
    paramIndex++;
  }

  if (filters.price_min) {
    conditions.push(`(price IS NULL OR price >= $${paramIndex})`);
    params.push(filters.price_min);
    paramIndex++;
  }

  if (filters.price_max) {
    conditions.push(`(price IS NULL OR price <= $${paramIndex})`);
    params.push(filters.price_max);
    paramIndex++;
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const limit = filters.limit || 5;

  // Count total
  const countQuery = `SELECT COUNT(*) as total FROM cars_catalog ${whereClause}`;
  const countResult = await pool.query(countQuery, params);
  const total = parseInt(countResult.rows[0]?.total) || 0;

  // Get cars
  const query = `
    SELECT id, mark_name, folder_name, body_type, engine_volume, hp,
           transmission, drive_type, engine_type, year, price
    FROM cars_catalog
    ${whereClause}
    ORDER BY year DESC, price ASC
    LIMIT $${paramIndex}
  `;

  params.push(limit);
  const result = await pool.query(query, params);

  return {
    success: true,
    total,
    cars: result.rows.map((car) => ({
      ...car,
      name: `${car.mark_name} ${car.folder_name}`,
      engine: `${car.engine_volume}L ${car.engine_type === 'diesel' ? 'Diesel' : 'Petrol'}, ${car.hp} hp`,
    })),
  };
}

module.exports = { searchCars };
