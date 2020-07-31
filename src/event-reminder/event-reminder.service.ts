import { ERROR_COMMAND_EVENT_REMINDER_BAD_REQUEST } from '../constants/error.constant';
import { CommandMessage } from '../command-message/command-message.interface';
import {
  EventReminder,
  EventReminderHandler,
} from './event-reminder.interface';
import { isCommandMessage } from '../command-message/command-message.service';

export const EVENT_REMINDER_COMMAND = 'ADD_EVENT_REMINDER';

export function isEventReminder(eventReminder: EventReminder): boolean {
  return (
    typeof eventReminder.name === 'string' &&
    (typeof eventReminder.time === 'string' ||
      typeof eventReminder.time === 'number') &&
    !isNaN(Number(eventReminder.time))
  );
}

export function isEventReminderCommand(
  commandMessage: CommandMessage,
): boolean {
  const reminder = commandMessage.options as EventReminder;
  return isCommandMessage(commandMessage) && isEventReminder(reminder);
}

export function parseEventReminder(
  commandMessage: CommandMessage,
): EventReminder {
  if (!isEventReminderCommand(commandMessage))
    throw new Error(
      `${ERROR_COMMAND_EVENT_REMINDER_BAD_REQUEST}: Fail to parse add event emitter options`,
    );

  return commandMessage.options as EventReminder;
}

export function addEventReminder(
  eventReminder: EventReminder,
  eventReminderHandler: EventReminderHandler,
): void {
  if (!isEventReminder(eventReminder))
    throw new Error(
      `${ERROR_COMMAND_EVENT_REMINDER_BAD_REQUEST}: Fail to parse add event emitter options`,
    );
  setTimeout(
    () => eventReminderHandler(eventReminder),
    Number(eventReminder.time),
  );
}
