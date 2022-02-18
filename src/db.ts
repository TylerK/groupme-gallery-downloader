import fs from 'node:fs';
import chalk from 'chalk';
import { LowSync, JSONFileSync } from 'lowdb';
import { Group, GroupmeData, Media } from './types';

const adapter = new JSONFileSync<GroupmeData>('./db/data.json');
const db = new LowSync(adapter);
db.read();

const getGroupById = (id: string) => {
  try {
    if (db.data) {
      return db.data.groups.find((group) => group.id === id);
    }
  } catch (error: any) {
    console.log(chalk.red('Something went wrong getting getting the group by id', id));
    throw new Error(error);
  }
};

export function createDb(name = 'data') {
  const DB = `./db/${name}.json`;
  if (fs.existsSync(DB)) {
    return;
  }
  fs.writeFileSync(DB, JSON.stringify({ groups: [], token: '' }));
}

/**
 * Grab the user's developer token
 */
export function getToken() {
  try {
    if (db.data) {
      return db.data.token;
    }
  } catch (error: any) {
    console.log(chalk.red('Something went wrong getting the token from db/data.json'));
    throw new Error(error);
  }
}

/**
 * Cache off the user's developer token
 */
export function setToken(token: string) {
  try {
    if (db.data) {
      db.data.token = token;
      db.write();
    }
  } catch (error: any) {
    console.log(chalk.red('Something went wrong writing the token to db/data.json'));
    throw new Error(error);
  }
}

/**
 * Nuke the user's developer token
 */
export function deleteToken() {
  try {
    if (db.data) {
      db.data.token = '';
    }
    db.write();
  } catch (error: any) {
    console.log(chalk.red('Something went wrong deleting the token from db/data.json'));
    throw new Error(error);
  }
}

/**
 * Create a new group in the groups array by ID
 */
export function createGroup(id: string) {
  try {
    if (db.data) {
      const groupExists = getGroup(id);

      if (groupExists) {
        console.log(chalk.green('Skipping group creation. Group with id already exists:', id));
        return;
      }

      db.data.groups.push({ id, media: [] });
      db.write();
    }
  } catch (error: any) {
    console.log(chalk.red('Something went wrong creating a group with id:', id));
    throw new Error(error);
  }
}

/**
 * Gets the group by id
 */
export function getGroup(id: string) {
  try {
    if (db.data) {
      return getGroupById(id);
    }
  } catch (error: any) {
    console.log(chalk.red('Something went wrong looking up group with id:', id));
    throw new Error(error);
  }
}

/**
 * List all groups
 */
export function listGroups() {
  try {
    if (db.data) {
      return db.data.groups;
    }
  } catch (error: any) {
    console.log(chalk.red('Something went wrong listing groups'));
    throw new Error(error);
  }
}

/**
 * Nuke a group once we're done with it
 */
export function deleteGroup(id: string) {
  try {
    if (db.data) {
      const filteredGroups = db.data.groups.filter((group) => group.id !== id);
      db.data.groups = filteredGroups;
      db.write();
    }
  } catch (error: any) {
    console.log(chalk.red('Something went wrong with deleting group with id:', id));
    throw new Error(error);
  }
}

/**
 * Add media to download to a group by id
 */
export function addMedia(id: string, media: any) {
  try {
    if (db.data) {
      const group = getGroupById(id);
      if (group) {
        group.media.push(media);
      }
    }
  } catch (error: any) {
    console.log(chalk.red('Something went wrong adding media to group with id:', id));
    throw new Error(error);
  }
}

/**
 * Media to download by group id
 */
export function getMedia(id: string) {
  try {
    if (db.data) {
      return getGroupById(id)?.media;
    }
  } catch (error: any) {
    console.log(chalk.red('Something went wrong looking up group with id:', id));
    throw new Error(error);
  }
}

/**
 * Nuke an image or video to download to a group by url
 */
export function removeMediaItem(id: string, url: string) {
  try {
    if (db.data) {
      const group = getGroupById(id);
      if (group) {
        const media = group.media.filter((m) => m !== url);
        group.media = media;
        db.write();
      }
    }
  } catch (error: any) {
    console.log(chalk.red('Something went wrong looking up group with id:', id));
    throw new Error(error);
  }
}
