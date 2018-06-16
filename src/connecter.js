import chalk from "chalk";
import apiRequest, { handleResponse } from "./request";
import downloader from "./downloader";
import db from './db';



/**
 * Grab the raw image urls and return them in an array
 * @param  {Array} Array of gallery photo objects
 * @return {Array} Array of objects containing photo URL and user's name
 */
function flattenAttachmentsArray(data) {
  return data.map(photo => {
    return {
      url: photo.attachments[0].url,
      user: photo.name ? photo.name : 'UnknownUser'
    }
  });
}

/**
 * Connect to a given group's gallery and build up an array of downloadable photo URL's
 * @param  {String} GroupMe Developer Token ID
 * @param  {Integer} GroupMe Conversation ID
 * @return {Promise}
 */
async function mediaListBuilder(token, conversation, photos = [], page = "") {
  const path = page
    ? `conversations/${conversation}/gallery?before=${page}&limit=100`
    : `conversations/${conversation}/gallery?limit=100`;

  await apiRequest(token, path)
    .then(handleResponse)
    .then(({ response: { messages }}) => {
      console.log(chalk.cyan(`Fetching data from: ${path}`));

      const hasMessages = !!messages.length;
      if (hasMessages) {
        const additionalPhotos = photos.concat(messages);
        const lastPhotoTimeStamp = messages[messages.length - 1].gallery_ts;
        return mediaListBuilder(token, conversation, additionalPhotos, lastPhotoTimeStamp);
      }

      return flattenAttachmentsArray(photos);
    })
    .catch(error => {
      console.log(error);
    });
}

/**
 * @param {String} GroupMe Developer Token Hash
 * @param {Integer} GroupMe Chat ID
 */
export default function(token, id) {
  mediaListBuilder(token, id);
}
