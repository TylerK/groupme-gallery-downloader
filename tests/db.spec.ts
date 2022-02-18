import fs from 'node:fs';
import mock from 'mock-fs';
import { describe, it } from '@jest/globals';

import * as db from '../src/db';

const MOCK_DB = 'db/mock.json';

describe('DB', () => {
  beforeAll(() => {
    db.createDb('mock');

    mock({
      db: {
        'data.json': mock.load(MOCK_DB),
      },
    });
  });

  afterAll(() => {
    if (fs.existsSync(MOCK_DB)) {
      fs.rmSync(MOCK_DB);
    }
    mock.restore();
  });

  it('Token will initially be unset', () => {
    expect(db.getToken()).toBe('');
  });

  it('Token can be set', () => {
    db.setToken('abc123');
    expect(db.getToken()).toBe('abc123');
  });

  it('Token can be unset', () => {
    db.deleteToken();
    expect(db.getToken()).toBe('');
  });

  it('Group can be created', () => {
    db.createGroup('abc');
    const group = db.getGroup('abc');
    expect(group).toHaveProperty('id', 'abc');
    expect(group).toHaveProperty('media', []);
  });

  it('Will not create group with the same name', () => {
    db.createGroup('abc');
    expect(db.listGroups()).toHaveLength(1);
  });

  it('Will delete a group by a given id', () => {
    db.deleteGroup('abc');
    expect(db.listGroups()).toHaveLength(0);
  });
});