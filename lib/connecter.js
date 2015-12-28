import https from 'https';
import chalk from 'chalk';
import downloader from './downloader';

/**
 * https.request wrapped in a promise
 * @param  {String} GroupMe Developer Token Hash
 * @param  {Integer} GroupMe Chat ID
 * @return {Promise}
 */
async function galleryConnect (token, id, callback, photos = [], page = '') {
  let data = '';
  let path = '';

  if (page) {
    path = `/v3/conversations/${id}/gallery?before=${page}&limit=100`
  } else {
    path = `/v3/conversations/${id}/gallery?limit=100`
  }

  let request = https.request({
    host: 'api.groupme.com',
    path: path,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/47.0.2526.106 Safari/537.36',
      'Referer': 'https://app.groupme.com/chats',
      'X-Access-Token': token
    }
  });

  request.on('response', response => {
    console.log(chalk.cyan(`Fetching data from: api.groupme.com${path}`));

    response.on('data', chunk => {
      data += chunk;
    });

    response.on('end', () => {
      let parsed = JSON.parse(data.toString());
      let array = parsed.response.messages;

      photos = photos.concat(array);

      if (array.length > 0) {
        let last = array[array.length - 1].gallery_ts;
        galleryConnect(token, id, callback, photos, last);
      } else {
        return callback(photos);
      }
    });
  });

  request.end();

  request.on('error', error => {
    console.error('Error with connector:', error.stack);
  });
}

/**
 * parsePhotos() -- Grab the raw image urls and return them in an array
 * @param  {Array} Array of gallery photo objects
 * @return {Array} Array of URL strings
 */
function parsePhotos(data) {
  return data.map(photo => {
    return photo.attachments[0].url;
  });
}

/**
 * Fuck you, WadeBot
 */
function filterPhotos(data) {
  return data.filter(photo => {
    return !/(WadeBot)/.test(photo.name);
  });
}

/**
 * @param  {String} GroupMe Developer Token Hash
 * @param  {Integer} GroupMe Chat ID
 */
export default async function (token, id) {
  galleryConnect(token, id, data => {
    downloader(parsePhotos(filterPhotos(data)));
  });
}
