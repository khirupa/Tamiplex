const axios = require('axios');
var rp = require('request-promise');
require('dotenv').config()

let torrentUrl = process.env.TORRENT_URL

async function addMovieToTorrent(magnetLink, savePath) {
    console.log(`Adding movie save path ${savePath}...`);

    filePath = process.env.ROOT_PATH + savePath
    let options = {
        method: 'POST',
        url: `${torrentUrl}/api/v2/torrents/add`,
        headers: {},
        formData: {
            urls: magnetLink,
            rename: savePath,
            renameFile: savePath,
            name: savePath,
            savepath: filePath,
        },
    };

    // console.log('\n In add torrent:\n\n', options.formData);
    // let res = await rp(options).then().catch((err) => console.log('add tor err: ', err));
    // return res;
}

async function pauseTorrent(infoHash) {
    console.log(`Pausing torrent with info hash ${infoHash}...`);

    let res = await axios
        .get(`${torrentUrl}/api/v2/torrents/pause?hashes=${infoHash}`)
        .then()
        .catch((err) => console.log(`Error pausing torrent: ${err}`));

    if (res) {
        console.log(`Torrent paused successfully with response: ${res}`);
    } else {
        console.log('Torrent pause failed');
    }
    return res;
}

async function deleteTorrent(infoHash, deleteFiles = true) {
    console.log(`Deleting torrent with info hash ${infoHash}...`);

    let res = await axios
        .get(`${torrentUrl}/api/v2/torrents/delete?hashes=${infoHash}&deleteFiles=${deleteFiles}`)
        .catch((err) => console.log(`Error deleting torrent: ${err}`));
    if (res) {
        console.log(`Torrent deleted successfully with response: ${res}`);
    } else {
        console.log('Torrent deletion failed');
    }
}


module.exports = {
    addMovieToTorrent,
    pauseTorrent,
    deleteTorrent
}