import ProgressBar from 'progress';
import chalk from 'chalk';
import https from 'https';
import fs from 'fs';
import url from 'url';

let DIR = './photos_gallery';
let ROOT = 'http://i.groupme.com/';

/**
 * All GroupMe photos either are, or end with, a 32 digit hash.
 * @param  {String} 'http://i.groupme.com/<dimensions>.<extension>.<hash>'
 * @return {String} '<hash>.<extension>'
 */
function renameFile (file) {
  var hash = /(.{32})\s*$/.exec(file)[0];
  var fileTypes = /\.(png|jpeg|jpg|gif|bmp|mp4|mov|mpeg|mpg|mkv)/
  var fileName = '';

  if (file.match(fileTypes)) {
    fileName = `${hash}${fileTypes.exec(file)[0]}`;
  } else {
    fileName = `${hash}.UNKNOWN`;
  }

  return fileName;
}

/**
 * @param  {Array} Flat array of GroupMe photo URL's
 * @return {[type]}
 */
export default function (photos) {
  let hasDir = fs.existsSync(DIR);

  // Create the photo dump directory
  if (!hasDir) fs.mkdirSync(DIR);

  // If the folder exists and is not empty
  if (hasDir && !!fs.readdirSync(DIR).length) {
    console.log(chalk.red(`Error: The directory - ${DIR} - is not empty and can not continue.`));
    process.exit();
    return;
  }

  // Recursive downloader
  let downloader = (arr) => {
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
        let bar = new ProgressBar('Downloading [:bar] :percent of :total', {
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
          downloader(arr);
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
