import { expect, spyOn, test } from 'bun:test';

import bmcConfig from '../src/bmcConfig';
import bmService from '../src/bmService';
import caEndpointRunner from '../src/caEndpointRunner';
import caRunner from '../src/caRunner';
import getDiff from '../src/getDiff';
import getStatus from '../src/getStatus';
import getWorkspacePath from '../src/getWorkspacePath';
import httpPromise from '../src/httpPromise';
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

test('getBmc reads properly', async () => {
  Bun.write('./.bmc', JSON.stringify({ hello: 'world' }));
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
  const succesfulreturn = { a: 'return' };
  const httpSpy = spyOn(bmService, 'getCa').mockResolvedValue(succesfulreturn);
  expect(await bmService.getCa('a token', 'ca ID')).toEqual({ a: 'return' });
  expect(httpSpy).toHaveBeenCalled();
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
