import { expect, test } from 'bun:test';

import bmcConfig from '../src/bmcConfig';
import bmService from '../src/bmService';
import caEndpointRunner from '../src/caEndpointRunner';
import caRunner from '../src/caRunner';
import getDiff from '../src/getDiff';
import getStatus from '../src/getStatus';
import getWorkspacePath from '../src/getWorkspacePath';
import importWorkspace from '../src/importWorkspace';
import main from '../src/index';
import listCas from '../src/listCas';
import newCa from '../src/newCa';
import publish from '../src/publish';
import pull from '../src/pull';
import push from '../src/push';
import rename from '../src/rename';
import resultRenderer from '../src/resultRenderer';
import run from '../src/run';
import setCustomer from '../src/setCustomer';
import utils from '../src/utils';

const mockedHttpPromiseModule = require('../src/httpPromise'); // a mock() function

test('getBmc reads properly', async () => {
  await Bun.write('./.bmc', JSON.stringify({ hello: 'world' }));
  expect(await bmcConfig.getBmc('.')).toEqual({ hello: 'world' });
  Bun.file('./.bmc').delete();
});

test('getBmc writes properly', async () => {
  await bmcConfig.saveBmc('.', 'secret-token', ['ca1', 'ca2']);
  expect(await Bun.file('./.bmc').json()).toEqual({
    token: 'secret-token',
    cas: ['ca1', 'ca2'],
  });
  Bun.file('./.bmc').delete();
});

test('getCa', async () => {
  // parameters
  const token = 'a token';
  const caId = '12345';
  const headers = {
    Accept: 'application/json',
    'Content-Type': 'application/x-www-form-urlencoded',
    'access-token': token,
  };

  // mocked https return
  mockedHttpPromiseModule.https.mockReset();
  mockedHttpPromiseModule.https.mockReturnValue({ sample: 'return' });

  expect(await bmService.getCa(token, caId)).toEqual({ sample: 'return' });
  expect(mockedHttpPromiseModule.https).toHaveBeenCalledTimes(1);
  expect(mockedHttpPromiseModule.https).toHaveBeenCalledWith(
    `https://go.botmaker.com/api/v1.0/clientAction/${caId}`,
    { headers },
  );
});

test.todo('caEndpointRunner', async () => {
  expect(caEndpointRunner()).fail;
});

test.todo('caRunner', async () => {
  expect(caRunner()).fail;
});

test.todo('getDiff', async () => {
  expect(await getDiff('ASSF', undefined)).toBe(undefined);
});

test.todo('getStatus', async () => {
  expect(await getStatus('ASSF', undefined)).toBe(undefined);
});

test.todo('getWorkspacePath fails to find the path', async () => {
  expect(await getWorkspacePath('.')).toThrow('file not found');
});

test.todo('httpPromise', async () => {
  expect(httpPromise()).fail;
});

test.todo('httpPromise', async () => {
  expect(httpPromise()).fail;
});

test.todo('importWorkspace', async () => {
  expect(importWorkspace()).fail;
});

test.todo('main without args', async () => {
  expect(main()).toThrow('Not enough non-option arguments');
});

test.todo('listCas', async () => {
  expect(listCas()).fail;
});

test.todo('newCa', async () => {
  expect(newCa()).fail;
});

test.todo('publish', async () => {
  expect(publish()).fail;
});

test.todo('pull', async () => {
  expect(pull()).fail;
});

test.todo('push', async () => {
  expect(push()).fail;
});

test.todo('rename', async () => {
  expect(rename()).fail;
});

test.todo('resultRenderer', async () => {
  expect(resultRenderer()).fail;
});

test.todo('run', async () => {
  expect(run()).fail;
});

test.todo('setCustomer', async () => {
  expect(setCustomer()).fail;
});

test.todo('utils', async () => {
  expect(utils.makeid()).fail;
});
