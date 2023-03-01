const mysql = require('mysql2/promise');
require('dotenv').config()

const mysqlOptions = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    port: process.env.DB_PORT,
    password: process.env.DB_ROOT_PASSWORD,
    database: process.env.DB_DATABASE
};


async function updateMovieQuality(name, year, quality, language) {
    try {
        const connection = await mysql.createConnection(mysqlOptions);

        const [rows, fields] = await connection.execute(
            `UPDATE ${process.env.DB_TABLE} SET quality = ? WHERE name = ? AND year = ? AND language = ?`,
            [quality, name, year, language]
        );

        connection.end();

        if (rows.affectedRows > 0) {
            console.log(`Updated quality for "${name}" (${year}) to "${quality}"`);
        } else {
            console.log(`Movie "${name}" (${year}) not found`);
        }

        return rows.affectedRows;
    } catch (error) {
        console.error(error);
        return null;
    }
}


async function addMovie(name, year, imdb_id, quality, language) {
    try {
        const connection = await mysql.createConnection(mysqlOptions);

        const sql = `
        INSERT INTO ${process.env.DB_TABLE} (name, year, imdb_id, quality, language)
        VALUES (?, ?, ?, ?, ?)
      `;
        const values = [name, year, imdb_id, quality, language];

        const [rows, fields] = await connection.execute(sql, values);
        console.log(`${rows.affectedRows} row(s) inserted`);
        connection.end();
    } catch (error) {
        console.error(error);
    }
}


async function getMovie(name, year, imdb_id, quality, magnet) {

    try {
        const connection = await mysql.createConnection(mysqlOptions);

        const [rows, fields] = await connection.execute(
            `SELECT * FROM ${process.env.DB_TABLE} WHERE name = ? AND year = ? AND imdb_id = ?`,
            [name, year, imdb_id]
        );
        connection.end();
        return rows
    } catch (error) {
        console.error(error);
        return null;
    }
}

module.exports = {
    addMovie,
    updateMovieQuality,
    getMovie
}