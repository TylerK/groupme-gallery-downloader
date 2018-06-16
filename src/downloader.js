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
function renameFile(fileUrl, userName) {
  const URL = url.parse(fileUrl);
  const host = URL.hostname;
  const isImage = host === 'i.groupme.com';

  const imageHash = /(.{32})\s*$/.exec(fileUrl)[0];
  const videoHash = /([^/]+$)/.exec(fileUrl)[0].split('.')[0];
  const hash = isImage ? imageHash : videoHash;

  const imageFileTypes =  /\.(png|jpeg|jpg|gif|bmp|webp)/;
  const videoFileTypes = /\.(mp4|mov|wmv|mkv|webm)/;
  const fileTypes = isImage ? imageFileTypes : videoFileTypes;

  const possibleFileType = fileTypes.exec(fileUrl);
  const hasFileType = possibleFileType && possibleFileType.length > 0;
  const fileType = hasFileType ? possibleFileType[0] : '';

  const user = userName.split(' ').join('_');

  return `${user}__${hash}${fileType}`;
}

/**
 * @param  {Array} Flat array of GroupMe photo URL's
 * @return {[type]}
 */
export default photosArray => {
  const photosFolder = fs.existsSync(DIR);
  const totalPhotos = photosArray.length;

  // Create the photo directory
  if (!photosFolder) {
    fs.mkdirSync(DIR);
  }

  const hasFilesInFolder = !!fs.readdirSync(DIR).length;

  // If the folder exists and is not empty
  if (photosFolder && hasFilesInFolder) {
    console.log(chalk.red(`Error: Directory "${DIR}" is not empty and can not continue.`));
    process.exit();
    return;
  }

  // Recursive downloader
  const downloader = (arr, curr = 0) => {
    if (arr.length) {
      let { url: URL, user: USER } = arr[0];

      if (!URL || typeof URL !== 'string') {
        arr = arr.splice(1, arr.length - 1);
        curr = curr + 1;
        return downloader(arr, curr);
      }

      let request = https.request({
        host: url.parse(URL).host,
        path: url.parse(URL).pathname,
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/47.0.2526.106 Safari/537.36',
          Referer: 'https://app.groupme.com/chats'
        }
      });

      let fileName = renameFile(URL, USER);
      let file = fs.createWriteStream(`${DIR}/${fileName}`);

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
          return downloader(arr, curr);
        });
      });

      request.end();

      request.on('error', error => {
        console.error('Error with connector:', '\n', error.stack);
      });
    }
  };

  if (photosArray.length) {
    downloader(photosArray);
  }
};
