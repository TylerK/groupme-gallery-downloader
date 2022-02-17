import chalk from 'chalk';
import { LowSync, JSONFileSync } from 'lowdb';

type Media = {};

type Group = {
  id: string;
  media: Media[];
};

type Data = {
  groups: Group[];
  token: string;
};

const adapter = new JSONFileSync<Data>('../db/data.json');
const db = new LowSync(adapter);

const getGroupById = (id: string): Group | undefined => {
  if (db.data) {
    return db.data.groups.find((group) => group.id === id);
  }
};

/**
 * Cache off the user's developer token
 */
export function setToken(token: string): void {
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
 * Grab the user's developer token
 */
export function getToken(): string | undefined {
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
export function createGroup(id: string): void {
  try {
    if (db.data) {
      const groupExists = getGroup(id);

      if (groupExists) {
        console.log(chalk.green('Group with id already exists:', id));
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
 * Nuke a group once we're done with it
 */
export function deleteGroup(id: string): void {
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
export function addMedia(id: string, media: any): void {
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
 * Gets the group by id
 */
export function getGroup(id: string): Group | undefined {
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
 * Media to download by group id
 */
export function getMedia(id: string): Media | undefined {
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
export function removeMediaItem(id: string, url: string): void {
  try {
    if (db.data) {
      const group = getGroupById(id);
      if (group) {
        group.media = group.media.filter((m) => m !== url);
        db.data.groups = db.data.groups.filter((group) => group.id !== id);
        db.data.groups.push(group as Group);
        db.write();
      }
    }
  } catch (error: any) {
    console.log(chalk.red('Something went wrong looking up group with id:', id));
    throw new Error(error);
  }
}
