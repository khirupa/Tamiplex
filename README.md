# 🎥 Tamiplex Movie Downloader - Automate Your Movie Collection 📥

This is a Node.js app that can download new movies from the 1tamilmv site by periodically scraping (RSS feed) and storing it in a folder that your Plex server uses to host. The app supports multiple languages and qualities, and it will download the latest available version of the movie and replace the old one if a better quality version is available in the future.

## 🚀 Installation

Install dependencies:
npm install
Create a .env file with the following settings:

```environment

ROOT_PATH= # where you want to store movies
TORRENT_URL= # QBittorrent WebUI URL
DB_ROOT_PASSWORD= # set your database password
DB_USER= root # set your database user
DB_HOST= localhost # set your database host
DB_PORT= 3307 # set your database port
DB_DATABASE= movies # set your database name and change it in scripts/init.sql file. Default: movies.
DB_TABLE= movies # set your table name and change it in scripts/init.sql file. Default: movies
OMDB_API_KEY= # create an account in OMDB to get the key. 
CRON_EXPRESSION= */5 * * * * # run every 5 minutes

```

[OMDB API KEY LINK](https://www.omdbapi.com/apikey.aspx)

Start the app with Docker Compose:

```docker-compose

docker-compose up -d

```

Run the application

```node.js
node main.js
```

Note: application will take some time to start depending on your cron

## 🎬 Usage

The app will automatically scrape and download new movies periodically based on the settings in the .env file. You can check the app logs to see the progress and any errors that occur.

Enjoy your new movie collection! 🍿🎉
