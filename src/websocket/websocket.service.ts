import WebSocket from 'ws';

export const WEBSOCKET_DEFAULT_PORT = 8999;

// Do a minimalist options that can be changed by setting env (only the port)
export const TURBULENT_WEBSOCKET_SERVER_DEFAULT_OPTIONS: WebSocket.ServerOptions = {
  port: process.env.TURBULENT_WS_PORT
    ? Number(process.env.TURBULENT_WS_PORT)
    : WEBSOCKET_DEFAULT_PORT,
};

export function createWebSocketServer(
  options?: WebSocket.ServerOptions,
): WebSocket.Server {
  return new WebSocket.Server({
    ...TURBULENT_WEBSOCKET_SERVER_DEFAULT_OPTIONS,
    ...(options || {}),
  });
}
