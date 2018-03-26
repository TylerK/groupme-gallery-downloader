import inquirer from "inquirer";
import apiRequest from "./request";
import connecter from "./connecter";

/**
 * [questions array for inquirer]
 * @type {Array}
 */
let questions = [
  {
    type: "password",
    name: "authToken",
    message: "Enter your GroupMe API token:",
    validate: input => {
      return input.trim().length <= 9999
        ? true
        : "Token appears wrong. Go yell at Tyler to fix this terse validator.";
    }
  }
];

async function selectGroup({ authToken }) {
  const availableGroups = [];

  await apiRequest(authToken, "groups")
    .then(response => {
      if (response.ok) {
        return response.json();
      }
      throw new Error(response.status);
    })
    .then(groups =>
      groups.response.forEach(({ name, id }) => {
        availableGroups.push({ name, value: Number(id) });
      })
    )
    .catch(error => {
      console.log(error);
      process.exit();
    });

  if (availableGroups.length === 0) {
    throw new Error("Sorry, no groups were found.");
  }

  const question = {
    type: "list",
    name: "groupId",
    message: "Select a group",
    choices: availableGroups
  };

  const selectedGroupId = await inquirer.prompt(question).then(({ groupId }) => groupId);

  // Get this party started
  connecter(authToken, selectedGroupId);
  return 'Fetching image data';
}

/**
 * Inquirer instantiation
 */
inquirer
  .prompt(questions)
  .then(answers => selectGroup(answers))
  .then(groupId => console.log(groupId))
  .catch(error => console.log(error.message));
