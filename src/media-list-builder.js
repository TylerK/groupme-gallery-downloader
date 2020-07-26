import chalk from 'chalk';
import apiRequest, { handleResponse } from './request';
import db from './db';

/**
 * Sanatizes a string for writing to disk. Removes illegal characters in Windows, Linux, and OSX.
 * Useful for file, folder, and user names.
 * @param {string} string
 */
function sanitizeString(string) {
  return string
    .trim()
    .replace(' ', '-')
    .replace(/([<|>|:|"|\/|\|||\?|\*\]|&])/g, '_');
}

/**
 * Shrink the data down to only what's necessary: Photo URL's and user names.
 *
 * @param  {Array} media Array of gallery photo objects from the API
 * @return {Array} Array of objects containing photo URL and user's name
 */
function mappedMediaObjects(mediaObjects) {
  return mediaObjects.map((media) => ({
    url: media.attachments[0].url,
    user: media.name ? sanitizeString(media.name) : 'UnknownUser',
    created: media.created_at,
  }));
}

/**
 * Connect to a given group's gallery and recursively
 * build up an array of downloadable media URL's
 *
 * @param  {String} token GroupMe Developer Token ID
 * @param  {Integer} id GroupMe Conversation ID
 * @param  {Array} media Array of media objects
 * @param  {String} page Current page
 * @return {Promise}
 */
export async function mediaListBuilder(token, id, media = [], page = '') {
  const path = page
    ? `conversations/${id}/gallery?before=${page}&limit=100`
    : `conversations/${id}/gallery?limit=100`;

  return await apiRequest(token, path)
    .then(handleResponse)
    .then(({ response: { messages } }) => {
      console.log(chalk.cyan(`Fetching data from: ${chalk.green(path)}`));
      const hasMessages = !!messages.length;

      if (hasMessages) {
        const additionalMedia = media.concat(messages);
        const lastTimeStamp = messages[messages.length - 1].gallery_ts;
        return mediaListBuilder(token, id, additionalMedia, lastTimeStamp);
      }

      const mediaDownloadArray = mappedMediaObjects(media);
      db.addMedia(id, mediaDownloadArray);
      return { media: mediaDownloadArray, id };
    })
    .catch((error) => {
      throw new Error(error);
    });
}
