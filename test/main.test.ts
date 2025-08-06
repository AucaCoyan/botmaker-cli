import { expect, test } from 'bun:test';

import { getCa } from '../src/bmService';
import getStatus from '../src/getStatus';
import getWorkspacePath from '../src/getWorkspacePath';

test('It works', () => {
  expect(true).toBe(true);
});

test.failing('getCa', async () => {
  expect(await getCa('ASSF', 'adsf')).toBe(undefined);
});

test.failing('getStatus', async () => {
  expect(await getStatus('ASSF', undefined)).toBe(undefined);
});

test('getWorkspacePath fails to find the path', async () => {
  expect(await getWorkspacePath('.')).toThrow('file not found');
});
