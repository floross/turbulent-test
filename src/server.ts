import * as WebSocket from 'ws';
import { Connection, ConnectionOptions } from 'typeorm';

import { parseCommandMessage } from './command-message/command-message.service';
import { ERROR_COMMAND_NOT_FOUND } from './constants/error.constant';
import {
  EVENT_REMINDER_COMMAND,
  parseEventReminder,
  addEventReminder,
} from './event-reminder/event-reminder.service';
import {
  createOrmConnection,
  findAllEventReminder,
  convertEntityToEventReminder,
  purgeOldEventReminder,
  saveEventReminder,
} from './orm/orm.service';
import {
  createWebSocketServer,
  broadcastMessage,
} from './websocket/websocket.service';
import { EventReminder } from './event-reminder/event-reminder.interface';

export type ShutdownServerCallback = (done?: () => void) => void;

export function addAndBroadCastEventReminder(
  webSocketServer: WebSocket.Server,
  eventReminder: EventReminder,
): void {
  addEventReminder(eventReminder, ({ name }) =>
    broadcastMessage(webSocketServer, `Event reminder reach: ${name}`),
  );
}

export async function loadEventReminders(
  connection: Connection,
  webSocketServer: WebSocket.Server,
): Promise<void> {
  await purgeOldEventReminder(connection);
  const eventReminders = await findAllEventReminder(connection);

  const commands = eventReminders.map(convertEntityToEventReminder);
  commands.forEach((eventReminder) =>
    addAndBroadCastEventReminder(webSocketServer, eventReminder),
  );
}

export function createShutdown(
  connection: Connection,
  webSocketServer: WebSocket.Server,
): ShutdownServerCallback {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  return async (done = (): void => {}): Promise<void> => {
    await connection.close();
    await new Promise((resolve) => webSocketServer.close(resolve));
    done();
  };
}

// Entrypoint of our event reminder application
export async function bootstrapServer(
  webSocketOptions?: WebSocket.ServerOptions,
  connectionOptions?: ConnectionOptions,
): Promise<ShutdownServerCallback> {
  const webSocketServer = createWebSocketServer(webSocketOptions);
  const connection = await createOrmConnection(connectionOptions);

  // Load All the event stored in the database
  await loadEventReminders(connection, webSocketServer);

  webSocketServer.on('connection', (ws: WebSocket) => {
    // a new connection has been open we will bind the event 'message'
    // to let the client send command to the server
    ws.on('message', async (message) => {
      ws.send(`Command received: ${message}`);
      const commandMessage = parseCommandMessage(message);

      switch (commandMessage.command) {
        case EVENT_REMINDER_COMMAND: {
          const eventReminder = parseEventReminder(commandMessage);
          addAndBroadCastEventReminder(webSocketServer, eventReminder);
          await saveEventReminder(connection, eventReminder);
          break;
        }
        default:
          ws.send(ERROR_COMMAND_NOT_FOUND);
          break;
      }
    });
  });

  return createShutdown(connection, webSocketServer);
}
