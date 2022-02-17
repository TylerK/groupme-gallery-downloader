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

  it('getToken() will initially be unset', () => {
    expect(db.getToken()).toBe('');
  });

  it('setToken() sets a new token', () => {
    db.setToken('abc123');
    expect(db.getToken()).toBe('abc123');
  });
});
