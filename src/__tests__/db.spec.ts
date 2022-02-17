import mock from 'mock-fs';
import { describe, it } from '@jest/globals';
import * as db from '../db';

describe('DB', () => {
  beforeAll(() => {
    mock({
      db: {
        'data.json': JSON.stringify({ groups: [], token: '' }),
      },
    });
  });

  afterAll(() => {
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
