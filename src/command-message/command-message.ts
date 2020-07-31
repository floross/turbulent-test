import WebSocket from 'ws';

import { ERROR_COMMAND_BAD_REQUEST } from '../constants/error.constant';
import { CommandMessage } from './command-message.interface';

export function parseCommandMessage(message: WebSocket.Data): CommandMessage {
  // For this exemple we will not support messages that are not a string
  if (typeof message !== 'string')
    throw new Error(
      `${ERROR_COMMAND_BAD_REQUEST}: Websocket message must be a string`,
    );

  let parsedMessage;

  // First we parse the string as we expect a JSON.stringify when the client communicate with us
  try {
    parsedMessage = JSON.parse(message);
  } catch (e) {
    throw new Error(
      `${ERROR_COMMAND_BAD_REQUEST}: Fail to parse the string into JSON format`,
    );
  }

  if (!isCommandMessage(parsedMessage))
    throw new Error(
      `${ERROR_COMMAND_BAD_REQUEST}: command object is malformed`,
    );

  return parsedMessage as CommandMessage;
}

/**
 * Check if the param implement the CommandMessage interface
 * @param commandMessage the variable to check
 */
export function isCommandMessage(commandMessage: any): boolean {
  return (
    typeof commandMessage === 'object' &&
    typeof commandMessage?.command === 'string'
  );
}
