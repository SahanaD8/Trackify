const { Pool } = require('pg');
require('dotenv').config();

// Determine if we're using PostgreSQL (Render) or MySQL (local)
const isPostgres = process.env.DB_PORT === '5432' || process.env.DATABASE_URL;

let pool;
let promisePool;

if (isPostgres) {
    // PostgreSQL configuration for Render
    pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === 'production' ? {
            rejectUnauthorized: false
        } : false
    });

    promisePool = {
        query: async (text, params) => {
            const result = await pool.query(text, params);
            return [result.rows];
        },
        execute: async (text, params) => {
            const result = await pool.query(text, params);
            return [result.rows];
        }
    };
} else {
    // MySQL configuration for local development
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
}

// Test database connection
const testConnection = async () => {
    try {
        if (isPostgres) {
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
    testConnection,
    isPostgres
};
