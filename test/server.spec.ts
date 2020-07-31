import WebSocket from 'ws';
import { bootstrapServer } from '../src/server';
import { WEBSOCKET_DEFAULT_PORT } from '../src/websocket/websocket.service';
import { EVENT_REMINDER_COMMAND } from '../src/event-reminder/event-reminder.service';
import { ERROR_COMMAND_NOT_FOUND } from '../src/constants/error.constant';

const TEST_SERVER_PORT = 9001;

describe('Server', () => {
  test('server is able to start', async (done) => {
    const webSocketServer = await bootstrapServer({ port: TEST_SERVER_PORT });

    const websocketClient1 = new WebSocket(
      `ws://localhost:${TEST_SERVER_PORT}`,
    );

    await new Promise((resolve) => websocketClient1.on('open', resolve));

    expect(webSocketServer.clients.size).toBe(1);

    webSocketServer.close(done);
  });

  test('send a event emitter command and wait for the response on all clients', async (done) => {
    const webSocketServer = await bootstrapServer({ port: TEST_SERVER_PORT });

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
          `Event reminder reach: ${name} (time was ${time})`,
        ],
        websocketClient2: [`Event reminder reach: ${name} (time was ${time})`],
      });
      webSocketServer.close(done);
    }, 1100);
  });
  test('server called with a wrong command', async (done) => {
    const webSocketServer = await bootstrapServer({ port: TEST_SERVER_PORT });

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
      webSocketServer.close(done);
    }, 100);
  });
});
