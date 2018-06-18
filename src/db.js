import fs from 'fs';
import lowdb from 'lowdb';
import FileSync from 'lowdb/adapters/FileSync';

let adapter, db;

/**
 * Create the db file
 */
const createDb = () => {
  const DB_FILE = './data/groups.json';
  const scaffoldData = '{ "groups": [], "token": "" }';
  const hasDb = fs.existsSync(DB_FILE);

  if (!hasDb) {
    fs.mkdirSync('./data');
    fs.writeFileSync(DB_FILE, scaffoldData, error => {
      if (error) throw error;
      console.log(chalk.green(`Successfuly wrote: ${chalk.white('data/groups.json')}`));
    });
  }

  adapter = new FileSync(DB_FILE);
  db = lowdb(adapter);
};

/**
 * Cache off the user's developer token
 * @param {String} token
 */
const setToken = (token) => {
  db.set('token', token)
    .write();
};

/**
 * Grab the user's developer token
 */
const getToken = () => db.get('token').value();

/**
 * Nuke the user's developer token
 */
const deleteToken = () => {
  db.unset('token');
};

/**
 * Create a new group in the groups array by ID
 * @param {String} id
 */
const createGroup = (id) => {
  const groupExists = db
    .get('groups')
    .find({ id })
    .value();

  if (groupExists) {
    return;
  }

  db
    .get('groups')
    .push({ id, media: [] })
    .write();
};

/**
 * Nuke a group once we're done with it
 * @param {String} id
 */
const deleteGroup = (id) => {
  db.get('groups')
    .remove({ id })
    .write();
};

/**
 * Add an image or video to download to a group by id
 * @param {String} id
 * @param {Object} item
 */
const addMediaItem = (id, item) => {
  db.get('groups')
    .find({ id })
    .get('media')
    .push(item)
    .write();
};

/**
 * Nuke an image or video to download to a group by id
 * @param {String} id
 * @param {Object} item
 */
const removeMediaItem = (id, item) => {
  db.get('groups')
    .find({ id })
    .get('media')
    .remove(item)
    .write();
};

export default {
  addMediaItem,
  createDb,
  createGroup,
  deleteGroup,
  deleteToken,
  getToken,
  removeMediaItem,
  setToken,
};
