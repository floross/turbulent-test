import WebSocket from 'ws';
import delay from 'delay';

import { bootstrapServer } from '../src/server';
import { EVENT_REMINDER_COMMAND } from '../src/event-reminder/event-reminder.service';
import { ERROR_COMMAND_NOT_FOUND } from '../src/constants/error.constant';
import { DB_TEST_CONNECTION } from './db-test.config';
import { createOrmConnection } from '../src/orm/orm.service';

const TEST_SERVER_PORT = 9001;

describe('Server', () => {
  afterEach(async (done) => {
    const connection = await createOrmConnection(DB_TEST_CONNECTION);
    // await connection.dropDatabase();
    await connection.close();
    done();
  });

  test('server is able to start', async (done) => {
    const shutdown = await bootstrapServer(
      { port: TEST_SERVER_PORT },
      DB_TEST_CONNECTION,
    );

    const websocketClient1 = new WebSocket(
      `ws://localhost:${TEST_SERVER_PORT}`,
    );

    await new Promise((resolve) => websocketClient1.on('open', resolve));

    shutdown(done);
  });

  test('send a event emitter command and wait for the response on all clients', async (done) => {
    const shutdown = await bootstrapServer(
      { port: TEST_SERVER_PORT },
      DB_TEST_CONNECTION,
    );

    const messages: { [key: string]: WebSocket.Data[] } = {
      websocketClient1: [],
      websocketClient2: [],
    };

    const websocketClient1 = new WebSocket(
      `ws://localhost:${TEST_SERVER_PORT}`,
    );
    const websocketClient2 = new WebSocket(
      `ws://localhost:${TEST_SERVER_PORT}`,
    );

    websocketClient1.on('message', (message) =>
      messages.websocketClient1.push(message),
    );
    websocketClient2.on('message', (message) =>
      messages.websocketClient2.push(message),
    );

    // Wait for all connection to open before sending a test
    const waitToOpen = [
      new Promise((resolve) => websocketClient1.on('open', resolve)),
      new Promise((resolve) => websocketClient2.on('open', resolve)),
    ];

    await Promise.all(waitToOpen);

    const name = 'FOO';
    const time = 1000;
    websocketClient1.send(
      JSON.stringify({
        command: EVENT_REMINDER_COMMAND,
        options: { name, time },
      }),
    );

    // Check the result after a small delay to let time to the message to reach the clients
    setTimeout(() => {
      expect(messages).toEqual({
        websocketClient1: [
          `Command received: {"command":"${EVENT_REMINDER_COMMAND}","options":{"name":"${name}","time":${time}}}`,
          `Event reminder reach: ${name}`,
        ],
        websocketClient2: [`Event reminder reach: ${name}`],
      });
      shutdown(done);
    }, 1100);
  });

  test('server called with a wrong command', async (done) => {
    const shutdown = await bootstrapServer(
      { port: TEST_SERVER_PORT },
      DB_TEST_CONNECTION,
    );

    const messages: { [key: string]: WebSocket.Data[] } = {
      websocketClient1: [],
    };

    const websocketClient1 = new WebSocket(
      `ws://localhost:${TEST_SERVER_PORT}`,
    );

    await new Promise((resolve) => websocketClient1.on('open', resolve));

    websocketClient1.on('message', (message) =>
      messages.websocketClient1.push(message),
    );

    const name = 'FOO';
    const time = 1000;
    websocketClient1.send(
      JSON.stringify({
        command: 'BAR',
        options: { name, time },
      }),
    );

    // Check the result after a small delay to let time to the message to reach the clients
    setTimeout(() => {
      expect(messages).toEqual({
        websocketClient1: [
          `Command received: {"command":"BAR","options":{"name":"${name}","time":${time}}}`,
          ERROR_COMMAND_NOT_FOUND,
        ],
      });
      shutdown(done);
    }, 100);
  });

  test('server persistance when shutdown and restart', async (done) => {
    const shutdownFirstInstance = await bootstrapServer(
      { port: TEST_SERVER_PORT },
      DB_TEST_CONNECTION,
    );

    const messages: { [key: string]: WebSocket.Data[] } = {
      websocketClient1: [],
    };

    let websocketClient1 = new WebSocket(`ws://localhost:${TEST_SERVER_PORT}`);

    websocketClient1.on('message', (message) =>
      messages.websocketClient1.push(message),
    );

    await new Promise((resolve) => websocketClient1.on('open', resolve));

    const name = 'FOO';
    const time = 3000;
    websocketClient1.send(
      JSON.stringify({
        command: EVENT_REMINDER_COMMAND,
        options: { name, time },
      }),
    );

    await delay(1000);

    await shutdownFirstInstance();

    const shutdownSecondInstance = await bootstrapServer(
      { port: TEST_SERVER_PORT },
      DB_TEST_CONNECTION,
    );

    websocketClient1 = new WebSocket(`ws://localhost:${TEST_SERVER_PORT}`);

    websocketClient1.on('message', (message) =>
      messages.websocketClient1.push(message),
    );

    await new Promise((resolve) => websocketClient1.on('open', resolve));

    // Check the result after a small delay to let time to the message to reach the clients
    setTimeout(() => {
      expect(messages).toEqual({
        websocketClient1: [
          `Command received: {"command":"${EVENT_REMINDER_COMMAND}","options":{"name":"${name}","time":${time}}}`,
          `Event reminder reach: ${name}`,
        ],
      });
      shutdownSecondInstance(done);
    }, 2100);
  });
});
