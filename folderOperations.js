const fs = require('fs');
require('dotenv').config();
const path = require('path');


function deleteFolderContents(folderPath) {
    const rootPath = process.env.ROOT_PATH;
    folderPath = rootPath + folderPath;
    // Check if folder path exists
    if (!fs.existsSync(folderPath)) {
        return;
    }

    // Get all the files and directories inside the folder
    const folderContents = fs.readdirSync(folderPath);

    // Loop through each file/directory and delete it recursively
    folderContents.forEach((content) => {
        const contentPath = path.join(folderPath, content);
        if (fs.lstatSync(contentPath).isDirectory()) {
            // Recursively delete directory
            deleteFolderContents(contentPath);
            fs.rmdirSync(contentPath);
        } else {
            // Delete file
            fs.unlinkSync(contentPath);
        }
    });
}

function folderExists(path) {
    const rootPath = process.env.ROOT_PATH;
    path = rootPath + path;
    try {
        return fs.existsSync(path) && fs.lstatSync(path).isDirectory();
    } catch (err) {
        return false;
    }
}

function createFolder(filePath) {
    const rootPath = process.env.ROOT_PATH;
    const fullPath = path.join(rootPath, filePath);

    // Split the path into its individual directory names
    const dirs = fullPath.split(path.sep);

    // Create each directory one by one
    let currentDir = rootPath;
    for (let i = dirs.length - filePath.split(path.sep).length - 1; i < dirs.length; i++) {
        currentDir = path.join(currentDir, dirs[i]);
        try {
            if (!fs.existsSync(currentDir)) {
                fs.mkdirSync(currentDir);
            }
        } catch (err) {
            console.error(err);
        }
    }
}

module.exports = {
    deleteFolderContents,
    folderExists,
    createFolder
}
