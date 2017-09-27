import inquirer from 'inquirer';

import { apiRequest } from './src/request';
import connecter from './src/connecter';

/**
 * [questions array for inquirer]
 * @type {Array}
 */
let questions = [
  {
    type: 'password',
    name: 'authToken',
    message:
      'What is your GroupMe access token? Note: This program does not store your ID.',
    validate: input => {
      input = input.trim(); // Yeah I'm mutating a param, wanna fite about it?
      return input.length <= 9999
        ? true
        : 'Token appears wrong. Go yell at Tyler to fix this terse validator.';
    }
  }
  // {
  //   type: 'input',
  //   name: 'groupId',
  //   message: 'What is your GroupMe Group\'s ID?',
  //   validate: (input) => {
  //     input = input.trim(); // Yeah I'm mutating a param, wanna fite about it?
  //     return input.length >= 5 && /^\d+$/.test(input) ? true : 'Please input a valid Group ID. Your Should be at a number at least 5 digits long.'
  //   }
  // }
];

async function selectGroup({ authToken }) {
  const availableGroupsArray = [];

  const fetchGroups = await apiRequest(authToken, 'groups')
    .then(response => {
      if (response.ok) {
        return response.json();
      }
      throw new Error(response.status);
    })
    .then(groups =>
      groups.response.forEach(({ name, id }) => {
        availableGroupsArray.push({ name, value: Number(id) })
      })
    )
    .catch(error => {
      console.log(error);
      process.exit();
    });

  if (availableGroupsArray.length === 0) {
    throw new Error('Yo, you aint got no groups :[');
  }

  console.log(availableGroupsArray);

  const question = [
    {
      type: 'list',
      name: 'groupId',
      message: 'Select a group',
      choices: availableGroupsArray,
    }
  ];

  const selectedGroupId = await inquirer.prompt(question).then(({ groupId }) => groupId);

  return selectedGroupId;
}

/**
 * Inquirer instantiation
 */
inquirer
  .prompt(questions)
  .then(answers => selectGroup(answers))
  .then(groupId => console.log(groupId))
  .catch(error => console.log(error.message));
