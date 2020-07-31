import {
  createWebSocketServer,
  WEBSOCKET_DEFAULT_PORT,
  broadcastMessage,
} from '../src/websocket/websocket.service';
import WebSocket from 'ws';

describe('Websocket Service', () => {
  const PROCESS_ENV_SAVED = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...PROCESS_ENV_SAVED };
  });

  afterAll(() => {
    process.env = PROCESS_ENV_SAVED;
  });

  test('creation of a websocket server', (done) => {
    const webSocketServer = createWebSocketServer();
    expect(webSocketServer).toBeInstanceOf(WebSocket.Server);
    webSocketServer.close(done);
  });

  test('creation of a websocket server on the default port (WEBSOCKET_DEFAULT_PORT)', (done) => {
    const webSocketServer = createWebSocketServer();
    expect(webSocketServer.options.port).toBe(WEBSOCKET_DEFAULT_PORT);
    webSocketServer.close(done);
  });

  test('creation of a websocket server on a specific port', (done) => {
    const webSocketServer = createWebSocketServer({ port: 9000 });
    expect(webSocketServer.options.port).toBe(9000);
    webSocketServer.close(done);
  });

  test('creation of a websocket server with the port set with env', (done) => {
    process.env.TURBULENT_WS_PORT = '9000';
    const webSocketServer = require('../src/websocket/websocket.service').createWebSocketServer();
    expect(webSocketServer.options.port).toBe(9000);
    webSocketServer.close(done);
  });

  test('connection of a client to the server', (done) => {
    const webSocketServer = createWebSocketServer();

    const websocketClient = new WebSocket(
      `ws://localhost:${WEBSOCKET_DEFAULT_PORT}`,
    );

    const errorTimout = setTimeout(
      () => done(`Fail to connect to ws://localhost:${WEBSOCKET_DEFAULT_PORT}`),
      2000,
    );
    websocketClient.on('open', () => {
      clearTimeout(errorTimout);
      expect(websocketClient.readyState).toBe(WebSocket.OPEN);
      websocketClient.terminate();
      webSocketServer.close(done);
    });
  });

  test('broadcast message over all cliemts', async (done) => {
    const webSocketServer = createWebSocketServer();

    const messages: { [key: string]: WebSocket.Data[] } = {
      websocketClient1: [],
      websocketClient2: [],
      websocketClient3: [],
    };

    const websocketClient1 = new WebSocket(
      `ws://localhost:${WEBSOCKET_DEFAULT_PORT}`,
    );
    const websocketClient2 = new WebSocket(
      `ws://localhost:${WEBSOCKET_DEFAULT_PORT}`,
    );
    const websocketClient3 = new WebSocket(
      `ws://localhost:${WEBSOCKET_DEFAULT_PORT}`,
    );

    websocketClient1.on('message', (message) =>
      messages.websocketClient1.push(message),
    );
    websocketClient2.on('message', (message) =>
      messages.websocketClient2.push(message),
    );
    websocketClient3.on('message', (message) =>
      messages.websocketClient3.push(message),
    );

    // Wait for all connection to open before sending a test
    const waitToOpen = [
      new Promise((resolve) => websocketClient1.on('open', resolve)),
      new Promise((resolve) => websocketClient2.on('open', resolve)),
      new Promise((resolve) => websocketClient3.on('open', resolve)),
    ];

    await Promise.all(waitToOpen);

    // Create a last client that will be closed before the message is broadcast
    // This message will not be received
    websocketClient3.terminate();

    broadcastMessage(webSocketServer, 'MESSAGE_TEST');

    // Check the result after a small delay to let time to the message to reach the clients
    setTimeout(() => {
      expect(messages).toEqual({
        websocketClient1: ['MESSAGE_TEST'],
        websocketClient2: ['MESSAGE_TEST'],
        websocketClient3: [],
      });
      webSocketServer.close(done);
    }, 500);
  });
});
