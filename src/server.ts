import * as WebSocket from 'ws';

import { parseCommandMessage } from './command-message/command-message.service';
import { ERROR_COMMAND_NOT_FOUND } from './constants/error.constant';
import {
  EVENT_REMINDER_COMMAND,
  parseEventReminder,
  addEventReminder,
} from './event-reminder/event-reminder.service';
import {
  createWebSocketServer,
  broadcastMessage,
} from './websocket/websocket.service';

// Entrypoint of our event reminder application
export async function bootstrapServer(
  options?: WebSocket.ServerOptions,
): Promise<WebSocket.Server> {
  const webSocketServer = createWebSocketServer(options);

  webSocketServer.on('connection', (ws: WebSocket) => {
    // a new connection has been open we will bind the event 'message'
    // to let the client send command to the server
    ws.on('message', (message) => {
      ws.send(`Command received: ${message}`);
      const commandMessage = parseCommandMessage(message);

      switch (commandMessage.command) {
        case EVENT_REMINDER_COMMAND: {
          const eventReminderCommand = parseEventReminder(commandMessage);
          addEventReminder(eventReminderCommand, ({ name, time }) =>
            broadcastMessage(
              webSocketServer,
              `Event reminder reach: ${name} (time was ${time})`,
            ),
          );
          break;
        }
        default:
          ws.send(ERROR_COMMAND_NOT_FOUND);
          break;
      }
    });
  });

  return webSocketServer;
}
