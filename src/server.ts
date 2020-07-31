import * as WebSocket from 'ws';
import { createWebSocketServer } from './websocket/websocket.service';
import { parseCommandMessage } from './command-message/command-message.service';

// Entrypoint of our event reminder application
export async function bootstrapServer(): Promise<void> {
  const webSocketServer = createWebSocketServer();

  webSocketServer.on('connection', (ws: WebSocket) => {
    // a new connection has been open we will bind the event 'message'
    // to let the client send command to the server
    ws.on('message', (message) => {
      ws.send(`Command received: ${message}`);
      const commandMessage = parseCommandMessage(message);
    });
  });
}
