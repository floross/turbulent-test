import * as WebSocket from 'ws';
import { createWebSocketServer } from './websocket/server';

// Entrypoint of our event reminder application
async function eventReminderBootstrap() {
  const webSocketServer = createWebSocketServer();

  webSocketServer.on('connection', (ws: WebSocket) => {
    // a new connection has been open we will bind the event 'message'
    // to let the client send command to the server
    ws.on('message', (message: string) => {
      ws.send(`Command received: ${message}`);
    });
  });
}

eventReminderBootstrap();
