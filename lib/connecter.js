import https from 'https';
import chalk from 'chalk';
import downloader from './downloader';

/**
 * Returns a series of dots [.], because reasons.
 * @param  {Integer}
 * @return {String}
 */
function counter (count) {
  let dots = [];
  for (let i = 0; i < count; i++) {
    dots.push('.');
  }
  return dots.join('');
}

/**
 * galleryConnect() -- https.request wrapped in a promise
 * @param  {String} Token Hash
 * @param  {Integer} GroupMe Chat ID
 * @return {promise}
 */
function galleryConnect (token, id, page) {
  return new Promise((resolve, reject) => {
    let data = [];

    let request = https.request({
      host: 'api.groupme.com',
      path: `/v3/conversations/${id}/gallery`,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/47.0.2526.106 Safari/537.36',
        'Referer': 'https://app.groupme.com/chats',
        'X-Access-Token': token
      }
    });

    request.on('response', response => {
      let count = 1;
      response.on('data', chunk => {
        console.log(chalk.cyan('Fetching Gallery Data' + chalk.white(counter(count))));
        count++;
        data.push(chunk);
      });

      response.on('end', () => {
        let parsed = JSON.parse(data.toString());
        resolve(parsed.response);
      });
    });

    request.end();

    request.on('error', error => {
      console.error('Error with connector:', error.stack);
    });
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
 * @param  {String} Token Hash
 * @param  {Integer} GroupMe Chat ID
 * @param  {Array} Array of gallery photo objects
 * @return {Array} Array of gallery photo objects
 */
export default async function (token, id) {
  await galleryConnect(token, id).then(data => {
    try {
      downloader(parsePhotos(data.messages));
    } catch (error) {
      console.log(error.stack);
    }
  });
}
