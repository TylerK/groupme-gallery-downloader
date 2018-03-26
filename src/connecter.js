import chalk from "chalk";
import apiRequest, { handleResponse } from "./request";
import downloader from "./downloader";

/**
 * Connect to a given group's gallery and build up an array of downloadable photo URL's
 * @param  {String} GroupMe Developer Token ID
 * @param  {Integer} GroupMe Conversation ID
 * @return {Promise}
 */
async function galleryConnect(token, conversation, callback, photos = [], page = "") {
  let path = page
    ? `conversations/${conversation}/gallery?before=${page}&limit=100`
    : `conversations/${conversation}/gallery?limit=100`;

  await apiRequest(token, path)
    .then(handleResponse)
    .then(({ response: { messages }}) => {
      console.log(chalk.cyan(`Fetching data from: ${path}`));

      let hasMessages = !!messages.length;

      if (hasMessages) {
        let additionalPhotos = photos.concat(messages);
        let lastPhotoTimeStamp = messages[messages.length - 1].gallery_ts;
        return galleryConnect(token, conversation, callback, additionalPhotos, lastPhotoTimeStamp);
      }

      return callback(photos);
    })
    .catch(error => {
      console.log(error);
    });
}

/**
 * flattenAttachmentsArray() -- Grab the raw image urls and return them in an array
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
 * @param  {String} GroupMe Developer Token Hash
 * @param  {Integer} GroupMe Chat ID
 */
export default function(token, id) {
  galleryConnect(token, id, data => {
    downloader(flattenAttachmentsArray(data));
  });
}
