import lowdb from 'lowdb';
import FileSync from 'lowdb/adapters/FileSync';

const adapter = new FileSync('data/groups.json');
const db = lowdb(adapter);

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
const createGroup = async (id) => {
  const groupExists = await db
    .get('groups')
    .has({ id })
    .value();

  console.log('__GROUP_EXISTS__');

  if (groupExists) {
    return;
  }

  await db
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
  createGroup,
  deleteGroup,
  deleteToken,
  getToken,
  removeMediaItem,
  setToken,
};
