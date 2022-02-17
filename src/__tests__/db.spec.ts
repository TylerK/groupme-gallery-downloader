import path from 'path';
import mock from 'mock-fs';
import * as db from '../db';

describe('DB', () => {
  it('Token should initially be unset', () => {
    expect(db.getToken()).toBe('');
  });
});
