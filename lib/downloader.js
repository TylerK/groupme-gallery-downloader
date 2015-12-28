import ProgressBar from 'progress';
import chalk from 'chalk';
import https from 'https';
import fs from 'fs';
import url from 'url';

let DIR = './photos_gallery';

/**
 * All GroupMe photos either are, or end with, a 32 digit hash.
 * @param  {String} URL to a GroupMe image or video
 * @return {String} '<hash>.<extension>'
 */
function renameFile (file) {
  let _url = url.parse(file);
  let host = _url.hostname;
  let isImage = host === 'i.groupme.com';
  let hash, fileTypes;

  if (isImage) {
    hash = /(.{32})\s*$/.exec(file)[0];
    fileTypes = /\.(png|jpeg|jpg|gif|bmp)/;
  } else {
    hash = /([^/]+$)/.exec(file)[0].split('.')[0];
    fileTypes = /\.(mp4|mov|wmv|mkv)/;
  }

  return `${hash}${fileTypes.exec(file)[0]}`;
}

/**
 * @param  {Array} Flat array of GroupMe photo URL's
 * @return {[type]}
 */
export default function (photos) {
  let hasDir = fs.existsSync(DIR);
  let totalPhotos = photos.length;

  // Create the photo dump directory
  if (!hasDir) fs.mkdirSync(DIR);

  // If the folder exists and is not empty
  if (hasDir && !!fs.readdirSync(DIR).length) {
    console.log(chalk.red(`Error: The directory - ${DIR} - is not empty and can not continue.`));
    process.exit();
    return;
  }

  // Recursive downloader
  let downloader = (arr, curr = 0) => {
    if (arr.length) {
      let URL = arr[0];
      let fileName = renameFile(URL);
      let file = fs.createWriteStream(`${DIR}/${fileName}`);

      // Could probably use https.get here, but still want to spoof being a browser.
      let request = https.request({
        host: url.parse(URL).host,
        path: url.parse(URL).pathname,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/47.0.2526.106 Safari/537.36',
          'Referer': 'https://app.groupme.com/chats'
        }
      });

      request.on('response', response => {
        let total = Number(response.headers['content-length']);
        let bar = new ProgressBar(`Downloading [:bar] [${curr} / ${totalPhotos}]`, {
          complete: '=',
          incomplete: '-',
          width: 20,
          total: total
        });

        response.on('data', chunk => {
          file.write(chunk);
          bar.tick(chunk.length);
        });

        response.on('end', () => {
          file.end();
          arr = arr.splice(1, arr.length - 1);
          curr = curr + 1;
          downloader(arr, curr);
        });
      });

      request.end();

      request.on('error', error => {
        console.error('Error with connector:', '\n', error.stack);
      });
    }
  }

  if (photos.length) downloader(photos);
}
