import { expect, mock, test, beforeEach } from 'bun:test';

// 1. Mock the entire module. Bun/Jest will replace its export
// with a mock function automatically.
// jest.mock('../src/httpPromise');

mock.module('../src/httpPromise', () => {
  return {
    readFile: () => Promise.resolve('hello world'),
  };
});

import httpPromise from '../src/httpPromise';
console.log(httpPromise.toString());
// outputs:
// test\bmService.test.ts:
// (url, urlOptions, data) => {
//     return new Promise((resolve, reject) => {
//       const req = https.request(url, urlOptions, (res) => {
//         res.setEncoding("utf8");
//         let body = "";
//         res.on("data", (chunk) => body += chunk);
//         res.on("error", reject);
//         res.on("end", () => {
//           if (res.statusCode >= 200 && res.statusCode <= 299)
//             resolve({
//               statusCode: res.statusCode,
//               headers: res.headers,
//               body
//             });
//           else
//             reject(`Request failed. status: ${res.statusCode}, body: ${body}`);
//         });
//       });
//       req.on("error", reject);
//       if (data)
//         req.write(data, "UTF-8");
//       req.end();
//     });
//   }

// it doesnt mock the module :sad:

// 2. NOW import the modules. You'll get the MOCKED httpPromise.
import bmService from '../src/bmService'; // The service you are testing

// 3. (Optional but good practice) Cast the mock for better type-safety and autocompletion.
// const mockedHttpPromise = httpPromise as jest.Mock;

// // Clean up mocks between tests to ensure they don't leak state.
// beforeEach(() => {
//   mockedHttpPromise.mockClear();
// });

test('getCa should fetch and return client action data successfully', async () => {
  const token = 'a-valid-token';
  const caId = '12345';
  const successfulReturn = { data: { id: caId, status: 'completed' } };
  const baseUrl = 'https://go.botmaker.com';
  httpPromise.mockImplementation();

  // 4. Set up the mock's return value for THIS test.
  httpPromise.mockResolvedValue(); // makes it return a resolved Promise.
  httpPromise.mock;

  // 5. Call the function you are testing.
  const result = await bmService.getCa(token, caId);

  // 6. Assert the outcome.
  expect(result).toEqual(successfulReturn);

  // 7. Assert that the mock was called correctly.
  expect(mockedHttpPromise).toHaveBeenCalledTimes(1);
  expect(mockedHttpPromise).toHaveBeenCalledWith(
    `${baseUrl}/api/v1.0/clientAction/${caId}`,
    {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
        'access-token': token,
      },
    },
  );
});
