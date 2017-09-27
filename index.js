import inquirer from 'inquirer';
import connecter from './src/connecter';

/**
 * [questions array for inquirer]
 * @type {Array}
 */
let questions = [
  {
    type: 'password',
    name: 'authToken',
    message: 'What is your GroupMe access token? Note: This program does not store your ID.',
    validate: (input) => {
      input = input.trim(); // Yeah I'm mutating a param, wanna fite about it?
      return input.length <= 9999 ? true : 'Token appears wrong. Go yell at Tyler to fix this terse validator.'
    }
  },
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

/**
 * Inquirer instantiation
 */
// inquirer.prompt(questions, ({ authToken, groupId }) => {
//   connecter(authToken, groupId);
// });

inquirer.prompt(question)
  .then(answers => selectGroup({ authToken }))
