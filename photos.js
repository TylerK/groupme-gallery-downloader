// https://api.groupme.com/v3/conversations/3035126/gallery?before=2015-12-11T22:47:26.1371Z&limit=100
// https://api.groupme.com/v3/conversations/3035126/gallery?limit=100?token=BEdmtViDKviivkhlCaOjlYBzApqdxBtP0rppzKBI
// 3035126
// BEdmtViDKviivkhlCaOjlYBzApqdxBtP0rppzKBI
import inquirer from 'inquirer';
import connecter from './lib/connecter';
import downloader from './lib/downloader';

/**
 * [questions array for inquirer]
 * @type {Array}
 */
let questions = [
  {
    type: 'password',
    name: 'auth_token',
    message: 'What is your GroupMe token?',
    validate: (input) => {
      return input.length >= 5 ? true : 'Tokens should be at least 40 characters.'
    }
  },
  {
    type: 'input',
    name: 'group_id',
    message: 'What is your GroupMe Group\'s ID?',
    validate: (input) => {
      return input.length >= 5 && /^\d+$/.test(input) ? true : 'Please input a valid GroupMe ID#'
    }
  }
];

/**
 * Inquirer instantiation
 */
inquirer.prompt(questions,
  function ({auth_token, group_id }) {
    connecter(auth_token, group_id);
  }
);
