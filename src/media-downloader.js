import ProgressBar from 'progress';
import chalk from 'chalk';
import https from 'https';
import url from 'url';
import path from 'path';
import fs from 'fs';
import db from './db';

const MEDIA_DIR = path.resolve(__dirname, '../', 'media');
const IMAGE_FILE_TYPES =  /\.(png|jpeg|jpg|gif|bmp|webp)/;
const VIDEO_FILE_TYPES = /\.(mp4|mov|wmv|mkv|webm)/;

/**
 * All GroupMe photos either are, or end with, a 32 digit hash.
 * @param  {String} URL to a GroupMe image or video
 * @return {String} '<hash>.<extension>'
 */
function renameFile(fileUrl, userName) {
  const URL = url.parse(fileUrl);
  const host = URL.hostname;

  // This is the only reliable way to determine if a download is an image
  // due to groupme sometimes not bothering giving a file an extension.
  // Someday I'll write something to crack open the file and get the headers
  // ¯\_(ツ)_/¯
  const isImage = host === 'i.groupme.com';

  const imageHash = /(.{32})\s*$/.exec(fileUrl)[0];
  const videoHash = /([^/]+$)/.exec(fileUrl)[0].split('.')[0];
  const fileTypes = isImage ? IMAGE_FILE_TYPES : VIDEO_FILE_TYPES;
  const possibleFileType = fileTypes.exec(fileUrl);
  const hasFileType = possibleFileType && possibleFileType.length > 0;

  const fileType = hasFileType ? possibleFileType[0] : '';
  const hash = isImage ? imageHash : videoHash;
  const user = userName.split(' ').join('_');

  return `${user}-${hash}${fileType}`;
}

/**
 * @param  {Array} User selected group Id
 * @return {Void}
 */
 export function mediaDownloader({ media, groupId }) {
  const TOTAL_PHOTOS = media.length;
  const MEDIA_DIR_EXISTS = fs.existsSync(MEDIA_DIR);
  let GROUP_MEDIA_DIR;

  if (!MEDIA_DIR_EXISTS) {
    GROUP_MEDIA_DIR = path.resolve(MEDIA_DIR, groupId);
    fs.mkdirSync(MEDIA_DIR);
    fs.mkdirSync(GROUP_MEDIA_DIR);
  }

  const downloader = (arr, curr = 0) => {
    if (arr.length) {
      let { url: URL, user: USER } = arr[0];

      if (!URL || typeof URL !== 'string') {
        curr = curr + 1;
        db.removeMediaItem(groupId, { url: URL });
        return downloader(db.getMedia(id));
      }

      const request = https.request({
        host: url.parse(URL).host,
        path: url.parse(URL).pathname,
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/47.0.2526.106 Safari/537.36',
          Referer: 'https://app.groupme.com/chats'
        }
      });

      const fileName = renameFile(URL, USER);
      const file = fs.createWriteStream(`${GROUP_MEDIA_DIR}/${fileName}`);

      request.on('response', response => {
        const total = Number(response.headers['content-length']);
        const bar = new ProgressBar(`Downloading [:bar] [${curr} / ${TOTAL_PHOTOS}]`, {
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
          curr = curr + 1;
          db.removeMediaItem(groupId, { url: URL });
          return downloader(db.getMedia(groupId));
        });
      });

      request.end();

      request.on('error', error => {
        console.error('Error with connector:', '\n', error.stack);
      });
    }
  };

  if (media.length) {
    downloader(media);
  }
};
