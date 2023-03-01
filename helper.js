const Parser = require('rss-parser');
const cheerio = require('cheerio');
const axios = require('axios');
require('dotenv').config()

// Create a new instance of the RSS parser
const parser = new Parser();
// Function to convert RSS data to JSON
const parseRSS = (xmlData) =>
    new Promise((resolve, reject) => {
        parser.parseString(xmlData, (error, result) => {
            if (error) {
                reject(error);
            } else {
                resolve(result);
            }
        });
    });

function parseHtml(html) {
    const $ = cheerio.load(html);
    const torrentLinks = [];

    $('a[data-fileext="torrent"]').each((i, el) => {
        const torrentLink = {
            title: $(el).text().trim(),
            link: $(el).attr('href'),
            magnet: $('a[href^="magnet:"]').attr('href'),
        };

        torrentLinks.push(torrentLink);
    });

    return torrentLinks;
}

function extractMovieInfo(filename) {
    const regex = /- (.*) \((\d{4})\)/; // Regular expression to match movie name and year
    const match = filename.match(regex);
    if (match) {
        const [, movieName, year] = match; // Destructure match array to extract movie name and year
        return { movieName, year };
    }
    return null; // Return null if movie name and year not found in filename
}

async function getIMDBId(movieName, movieYear) {
    try {
        const response = await axios.get(`http://www.omdbapi.com/?t=${movieName}&y=${movieYear}&apikey=${process.env.OMDB_API_KEY}`);
        return response.data.imdbID ? response.data.imdbID : null;
    } catch (error) {
        console.error(error);
    }
}

module.exports = {
    getIMDBId,
    extractMovieInfo,
    parseHtml,
    parseRSS

}