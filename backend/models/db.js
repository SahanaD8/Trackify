require('dotenv').config();

// Detect which database to use based on environment
const isProduction = process.env.NODE_ENV === 'production';
const usePostgres = process.env.DB_PORT === '5432' || isProduction;

let pool, promisePool;

if (usePostgres) {
    // PostgreSQL for Render deployment
    const { Pool } = require('pg');
    
    pool = new Pool({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'trackify_db',
        port: process.env.DB_PORT || 5432,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });
    
    // Create promise-based wrapper for PostgreSQL
    promisePool = {
        execute: async (query, params) => {
            // Convert MySQL ? placeholders to PostgreSQL $1, $2, etc.
            let pgQuery = query;
            if (params && params.length > 0) {
                params.forEach((_, index) => {
                    pgQuery = pgQuery.replace('?', `$${index + 1}`);
                });
            }
            const result = await pool.query(pgQuery, params);
            return [result.rows, result.fields];
        },
        query: async (query, params) => {
            let pgQuery = query;
            if (params && params.length > 0) {
                params.forEach((_, index) => {
                    pgQuery = pgQuery.replace('?', `$${index + 1}`);
                });
            }
            const result = await pool.query(pgQuery, params);
            return [result.rows, result.fields];
        }
    };
    
    console.log('🐘 Using PostgreSQL database');
} else {
    // MySQL for local development
    const mysql = require('mysql2');
    
    pool = mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'trackify_db',
        port: process.env.DB_PORT || 3306,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    });
    
    promisePool = pool.promise();
    console.log('🐬 Using MySQL database');
}

// Test database connection
const testConnection = async () => {
    try {
        if (usePostgres) {
            const client = await pool.connect();
            console.log('✅ PostgreSQL Database connected successfully');
            client.release();
        } else {
            const connection = await promisePool.getConnection();
            console.log('✅ MySQL Database connected successfully');
            connection.release();
        }
        return true;
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        return false;
    }
};

module.exports = {
    pool,
    promisePool,
    testConnection
};
