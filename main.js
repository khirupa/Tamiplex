const axios = require('axios');
const { CronJob } = require('cron');
const mysql = require('mysql2/promise');
const qbittorrent = require('./qbittorrent')
const folderOperations = require('./folderOperations');
const { getIMDBId, extractMovieInfo, parseHtml, parseRSS } = require('./helper.js');
const { addMovie, updateMovieQuality, getMovie } = require('./dbFunctions')

// Custom User-Agent header
const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36'
};

// Function to scrape the RSS feed and parse the data
const scrapeSite = async (url) => {
    try {
        const response = await axios.get(url);
        const xmlData = response.data;
        const jsonData = await parseRSS(xmlData);
        return jsonData
    } catch (error) {
        console.error(error);
    }
};

async function handleAddMovie(rows, name, year, imdb_id, magnet, quality, language) {
    var filePath = `${name} (${year}) {imdb-${imdb_id}}/${name} (${year}) {imdb-${imdb_id}} - ${language}`;
    if (imdb_id == null) {
        filePath = `${name} (${year})/${name} (${year}) - ${language}`;
    }

    if (rows.length === 0) {

        console.log(`Movie "${name}" (${year}) with IMDB ID "${imdb_id}" not found in database`);
        console.log(`Adding ${name}" (${year}) with IMDB ID "${imdb_id}" to table movies...`)
        addMovie(name, year, imdb_id, quality, language);
        folderOperations.createFolder(filePath);
        console.log(filePath)
        qbittorrent.addMovieToTorrent(magnet, filePath);
        console.log("Added")

        return null;
    } else {
        console.log(`Found movie "${name}" (${year}) with IMDB ID "${imdb_id}" in database`);
        //[x] not needed - update the quality - as new print comes it'll be better than original
        //[x] ! delete the old movie with low quality
        qbittorrent.addMovieToTorrent(magnet, filePath);

        updateMovieQuality(name, year, quality, language);

        if (!folderOperations.folderExists(filePath)) {
            folderOperations.createFolder(filePath);
        }
        else if (imdb_id)
            folderOperations.deleteFolderContents(`${name} (${year}) {imdb-${imdb_id}}`);
        else
            folderOperations.deleteFolderContents(`${name} (${year})`);

        return rows[0];
    }
}

async function main(url, language) {
    const jsonData = await scrapeSite(url);

    for (let i = 0; i < jsonData.items.length; i++) {

        let selectedMovie = parseHtml(jsonData.items[i].content).length ? parseHtml(jsonData.items[i].content)[0] : [];

        if (Array.isArray(selectedMovie)) continue;

        let movieTitle = extractMovieInfo(selectedMovie.title);

        let imdbId = await getIMDBId(movieTitle.movieName, movieTitle.year).then();

        let rows = await getMovie(movieTitle.movieName, movieTitle.year, imdbId, jsonData.title, selectedMovie.magnet);

        if (rows == null) { console.log("Error in retrieving data from MySQL"); return; }

        await handleAddMovie(rows, movieTitle.movieName, movieTitle.year, imdbId, selectedMovie.magnet, jsonData.title, language)

        //! break; only for testing
    }
}



async function mainWrapper() {
    // URL of the XML site to scrape
    console.log("Application started")
    const urls = [
        {
            link: 'https://www.1tamilmv.wtf/index.php?/forums/forum/10-predvd-dvdscr-cam-tc/page/1/all.xml',
            language: 'Tamil'
        },
        {
            link: 'https://www.1tamilmv.wtf/index.php?/forums/forum/11-web-hd-itunes-hd-bluray/all.xml',
            language: 'Tamil'
        }
    ];
    for (let i = 0; i < urls.length; i++) {
        await main(urls[i].link, urls[i].language);
    }
    return;
}

// Schedule the bot to run every 5 minutes
const job = new CronJob(`${process.env.CRON_EXPRESSION}`, mainWrapper, null, true);
job.start();
