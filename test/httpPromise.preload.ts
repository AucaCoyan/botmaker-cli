/// Preload a module before the tests
///
/// This is the way of mocking an entire module to modify responses
/// check:
///     https://bun.sh/docs/test/mocks#hoisting-preloading
import { mock } from 'bun:test';

mock.module('../src/httpPromise', () => {
  return {
    https: mock(),
  };
});
