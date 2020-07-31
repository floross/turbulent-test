import { createWebSocketServer, WEBSOCKET_DEFAULT_PORT } from './server';
import WebSocket from 'ws';

describe('Websocket server', () => {
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
    const webSocketServer = require('./server').createWebSocketServer();
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
      webSocketServer.close(done);
    });
  });
});
