import ProgressBar from 'progress';
import https from 'https';
import url from 'url';
import path from 'path';
import fs from 'fs';
import db from './db';

const MEDIA_DIR = path.resolve(__dirname, '../', 'media');
const IMAGE_FILE_TYPES = /\.(png|jpeg|jpg|gif|bmp|webp)/;
const VIDEO_FILE_TYPES = /\.(mp4|mov|wmv|mkv|webm)/;

/**
 * All GroupMe photos either are, or end with, a 32 digit hash.
 * Groupme file names aren't consistent, so we need to do a bunch
 * of checking and guarding against these inconsistencies
 *
 * An image URL could be any of the following:
 *   - http://i.groupme.com/06a398bdf6bd9db15f47a27f72fcecea
 *
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

  // Grab the first 32 chars of each image name
  const imageHash = /(.{32})\s*$/.exec(fileUrl)[0];

  // Video URL's
  const videoHash = /([^/]+$)/.exec(fileUrl)[0].split('.')[0];

  // I think I accounted for all possible filetypes Groupme supports.
  // Knowing them, this will eventually error out somehow.
  const fileTypes = isImage ? IMAGE_FILE_TYPES : VIDEO_FILE_TYPES;

  // Maybe it's a file? Probably worth checking later...
  const possibleFileType = fileTypes.exec(fileUrl);

  // Super naive filetype check
  const hasFileType = possibleFileType && possibleFileType.length > 0;

  // Which hash to use
  const hash = isImage ? imageHash : videoHash;

  // Filesystem safe string for usernames
  const user = userName.split(' ').join('_');

  // To the best of my knowledge, GroupMe strips EXIF data.
  // Which would be immensely fucking useful here.
  let fileType = '';
  if (hasFileType) {
    fileType = possibleFileType[0];
  } else {
    // Most common media formats on GroupMe. This could be wrong. Again, EXIF Data would be useful.
    if (isImage) {
      fileType = '.jpg';
    } else {
      fileType = '.mp4';
    }
  }

  // Final filename
  return `${user}-${hash}${fileType}`;
}

function requestMediaItem(mediaUrl) {
  return https.request({
    host: url.parse(mediaUrl).host,
    path: url.parse(mediaUrl).pathname,
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/47.0.2526.106 Safari/537.36',
      Referer: 'https://app.groupme.com/chats',
    },
  });
}

/**
 * @param  {Array} User selected group Id
 * @return {Void}
 */
export function mediaDownloader({ media, groupId }) {
  const TOTAL_PHOTOS = media.length;

  if (!fs.existsSync(MEDIA_DIR)) {
    fs.mkdirSync(MEDIA_DIR);
  }

  let GROUP_MEDIA_DIR;

  if (!fs.existsSync(`${MEDIA_DIR}/${groupId}`)) {
    fs.mkdirSync(`${MEDIA_DIR}/${groupId}`, { recursive: true });
    GROUP_MEDIA_DIR = path.resolve(MEDIA_DIR, groupId);
  }

  const downloader = (arr, curr = 1) => {
    if (arr.length) {
      let { url: URL, user: USER } = arr[0];

      if (!URL || typeof URL !== 'string') {
        curr = curr + 1;
        db.removeMediaItem(groupId, { url: URL });
        return downloader(db.getMedia(id));
      }

      const fileName = renameFile(URL, USER);

      let file;

      try {
        file = fs.createWriteStream(`${GROUP_MEDIA_DIR}/${fileName}`);
      } catch (error) {
        console.log(error);
      }

      const request = requestMediaItem(URL);

      request.on('response', (response) => {
        const total = Number(response.headers['content-length']);
        const bar = new ProgressBar(`Downloading [:bar] [${curr} / ${TOTAL_PHOTOS}]`, {
          complete: '=',
          incomplete: '-',
          width: 20,
          total: total,
        });

        response.on('data', (chunk) => {
          file.write(chunk);
          bar.tick(chunk.length);
        });

        response.on('end', () => {
          file.end();
          curr = curr + 1;
          db.removeMediaItem(groupId, { url: URL });
          return downloader(db.getMedia(groupId), curr);
        });
      });

      request.end();

      request.on('error', (error) => {
        throw new Error(error);
      });
    }
  };

  if (!!media.length) {
    downloader(media);
  }
}
