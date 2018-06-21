import inquirer from "inquirer";
import chalk from 'chalk';
import apiRequest from "./request";
import { mediaListBuilder } from "./media-list-builder";
import { mediaDownloader } from './media-downloader';
import db from './db';

/**
 * Fetch the groups a user has access to.
 * @param  {String} authToken
 * @return {Promise}
 */
function fetchAvailableGroups(authToken) {
  return apiRequest(authToken, "groups")
    .then(response => {
      if (response.ok) {
        return response.json();
      }
      if (response.status === 401) {
        throw new Error(chalk.red('Unauthorized, likely an invalid token'));
      }
    })
    .then(({ response }) => (
      response.map(({ name, id }) => ({ name, value: Number(id) }))
    ))
    .catch(error => {
      throw new Error(error);
    });
}

function userSelectGroup(availableGroups) {
  const question = {
    type: "list",
    name: "groupId",
    message: "Select a group",
    choices: availableGroups
  };

  return inquirer
    .prompt(question)
    .then(({ groupId }) => groupId);
}

/**
 * Hit the groups API and offer up a list of available groups to the user
 * @param  {String} User supplied auth token
 * @return {Promise} Pass back the mediaListBuilder promise
 */
async function selectGroup(authToken) {
  const availableGroups = await fetchAvailableGroups(authToken);

  if (availableGroups.length === 0) {
    throw new Error(chalk.red("Sorry, no groups were found."));
  }

  const selectedGroupId = await userSelectGroup(availableGroups);

  db.setToken(authToken);
  db.createGroup(selectedGroupId);

  return { authToken, selectedGroupId };
}

async function processData(token) {
  const { authToken, selectedGroupId } = await selectGroup(token);
  const mediaList = await mediaListBuilder(authToken, selectedGroupId);
  mediaDownloader(mediaList);
}

/**
 * Inquirer and download instantiation
 */
async function init() {
  db.createDb();

  const existingToken = db.getToken();
  const questionEnterApiToken = [
    {
      type: "input",
      name: "authToken",
      message: "Enter your GroupMe API token:",
    }
  ];

  if (existingToken) {
    const tokenShortSha = chalk.yellow(existingToken.substr(0, 7));
    const questions = [
      {
        type: "confirm",
        name: "cachedToken",
        message: `Do you want to use your existing token: ${tokenShortSha}... ?`,
      }
    ];

    inquirer
      .prompt(questions)
      .then(({ cachedToken }) => {
        if (cachedToken) {
          processData(existingToken);
        } else {
          inquirer
            .prompt(questionEnterApiToken)
            .then(({ authToken }) => { processData(authToken); });
        }
      });
  } else {
    inquirer
      .prompt(questionEnterApiToken)
      .then(({ authToken }) => { processData(authToken); });
  }
}

init();
