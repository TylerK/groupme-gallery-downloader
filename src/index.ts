import inquirer from 'inquirer';
import chalk from 'chalk';

import db from './db';
import apiRequest from './request';
import { mediaListBuilder } from './media-list-builder';
import { mediaDownloader } from './media-downloader';

/**
 * Fetch the groups a user has access to.
 *
 * @param  {String} authToken
 * @return {Promise}
 */
async function fetchAvailableGroups(authToken) {
  return apiRequest(authToken, 'groups')
    .then((response) => {
      if (response.status === 401) {
        throw new Error(chalk.red('Unauthorized, likely an invalid token'));
      }
      return response.json();
    })
    .then(({ response }) => response.map(({ name, id }) => ({ name, value: id })))
    .catch((error) => {
      throw new Error(error);
    });
}

/**
 * Prompt the user to to select from a list of groups.
 *
 * @param {Array} availableGroups Array of groups the user has access too, returned from the API
 */
function selectGroup(availableGroups) {
  const question = {
    type: 'list',
    name: 'id',
    message: 'Select a group',
    choices: availableGroups,
  };

  return inquirer.prompt(question).then(({ id }) => id);
}

/**
 * Hit the groups API and offer up a list of available groups to the user
 *
 * @param  {String} User supplied auth token
 * @return {Promise} Pass back the mediaListBuilder promise
 */
async function selectFromAvailableGroups(authToken) {
  const availableGroups = await fetchAvailableGroups(authToken);

  if (availableGroups.length === 0) {
    throw new Error(chalk.red('Sorry, no groups were found.'));
  }

  const id = await selectGroup(availableGroups);

  db.setToken(authToken);
  db.createGroup(id);

  return { authToken, id };
}

/**
 * Function called once we have a supplied developer access token from main()
 *
 * Note: This is a very boolean decision whether to pull from local or remote.
 *       If a local group DB exists it will pull from there instead of remote.
 *
 * TODO: Make better decisions. If a user is mid-download and restarts, this _should_
 *       check remote to see if anything new has been uploaded and append those items
 *       local cache of undownloaded media.
 *
 * @param {string} token Supplied developer token
 * @returns void
 */
async function processGroupmeData(token) {
  const { authToken, id } = await selectFromAvailableGroups(token);

  const localGroupData = db.getGroup(id);

  if (localGroupData.media && !!localGroupData.media.length) {
    console.log(
      `Restarting where you left off. ${chalk.green(localGroupData.media.length)} downloads to go!`
    );
    mediaDownloader(localGroupData);
  } else {
    const mediaListFromRemote = await mediaListBuilder(authToken, id);
    mediaDownloader(mediaListFromRemote);
  }
}

/**
 * Inquirer and download instantiation
 */
async function main() {
  db.createDb();

  const existingToken = db.getToken();
  const questionEnterApiToken = [
    {
      type: 'input',
      name: 'authToken',
      message: 'Enter your GroupMe API token:',
    },
  ];

  if (existingToken) {
    const tokenShortSha = chalk.yellow(existingToken.substr(0, 7));
    const questions = [
      {
        type: 'confirm',
        name: 'cachedToken',
        message: `Do you want to use your existing token: ${tokenShortSha}... ?`,
      },
    ];

    inquirer.prompt(questions).then(({ cachedToken }) => {
      if (cachedToken) {
        processGroupmeData(existingToken);
      } else {
        inquirer.prompt(questionEnterApiToken).then(({ authToken }) => {
          processGroupmeData(authToken);
        });
      }
    });
  } else {
    inquirer.prompt(questionEnterApiToken).then(({ authToken }) => {
      processGroupmeData(authToken);
    });
  }
}

main();
