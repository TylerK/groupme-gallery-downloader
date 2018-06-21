import fs from 'fs';
import lowdb from 'lowdb';
import FileSync from 'lowdb/adapters/FileSync';

let adapter, db;

/**
 * If a local DB doesn't exist, create it.
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

  if (!!groupExists) {
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
 * Add media to download to a group by id
 * @param {String} id
 * @param {Object} media
 */
const addMedia = (id, media) => {
  db.get('groups')
    .find({ id })
    .set('media', media)
    .write();
};

/**
 * Grab media to download by group
 * @param {String} id
 * @param {Object} media
 */
const getMedia = (id) => {
  db.get('groups')
    .find({ id })
    .get('media')
    .value();
};

/**
 * Nuke an image or video to download to a group by url
 * @param {String} id
 * @param {Object} item
 */
const removeMediaItem = (id, url) => {
  db.get('groups')
    .find({ id })
    .get('media')
    .remove({ url })
    .write();
};

export default {
  addMedia,
  createDb,
  createGroup,
  deleteGroup,
  deleteToken,
  getMedia,
  getToken,
  removeMediaItem,
  setToken,
};
