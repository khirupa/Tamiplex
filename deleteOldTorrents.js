const mysql = require('mysql2/promise');
const axios = require('axios');
// const dayjs = require('dayjs');
require('dotenv').config()


const mysqlOptions = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    port: process.env.DB_PORT,
    password: process.env.DB_ROOT_PASSWORD,
    database: process.env.DB_DATABASE
};


const torrentUrl = process.env.TORRENT_URL; // Replace with your actual qBittorrent URL

async function deleteTorrent(infoHash, deleteFiles = true) {
    console.log(`Deleting torrent with info hash ${infoHash}...`);
    try {
        const res = await axios.get(`${torrentUrl}/api/v2/torrents/delete?hashes=${infoHash}&deleteFiles=${deleteFiles}`);
        console.log(`✅ Torrent deleted successfully for ${infoHash}`);
    } catch (err) {
        console.log(`❌ Error deleting torrent: ${err}`);
    }
}

async function deleteOldTorrents() {
    const conn = await mysql.createConnection(mysqlOptions);

    const [rows] = await conn.execute(`
        SELECT id, name, created_at, info_hash
        FROM movies
        WHERE created_at < (NOW() - INTERVAL 30 SECOND)
    `);

    for (let row of rows) {
        if (!row.info_hash) {
            console.log(`Skipping "${row.name}" – no info hash found.`);
            continue;
        }
        console.log(`⏳ Deleting "${row.name}" (added on ${row.created_at})...`);
        await deleteTorrent(row.info_hash, true);
    }

    await conn.end();
}

deleteOldTorrents();
