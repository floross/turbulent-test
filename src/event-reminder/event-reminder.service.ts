import { ERROR_COMMAND_EVENT_EMITTER_BAD_REQUEST } from '../constants/error.constant';
import { CommandMessage } from '../command-message/command-message.interface';
import {
  EventReminder,
  EventReminderHandler,
} from './event-reminder.interface';
import { isCommandMessage } from '../command-message/command-message.service';

export const EVENT_REMINDER_COMMAND = 'ADD_EVENT_REMINDER';

export function isEventReminder(commandMessage: CommandMessage): boolean {
  const reminder = commandMessage.options as EventReminder;
  return (
    isCommandMessage(commandMessage) &&
    typeof reminder.name === 'string' &&
    (typeof reminder.time === 'string' || typeof reminder.time === 'number') &&
    !isNaN(Number(reminder.time))
  );
}

export function parseEventReminder(
  commandMessage: CommandMessage,
): CommandMessage<EventReminder> {
  if (!isEventReminder(commandMessage))
    throw new Error(
      `${ERROR_COMMAND_EVENT_EMITTER_BAD_REQUEST}: Fail to parse add event emitter options`,
    );

  return commandMessage as CommandMessage<EventReminder>;
}

export function addEventReminder(
  eventReminderCommand: CommandMessage<EventReminder>,
  eventReminderHandler: EventReminderHandler,
): void {
  if (!isEventReminder(eventReminderCommand))
    throw new Error(
      `${ERROR_COMMAND_EVENT_EMITTER_BAD_REQUEST}: Fail to parse add event emitter options`,
    );

  const eventReminder = eventReminderCommand.options as EventReminder;

  setTimeout(
    () => eventReminderHandler(eventReminder),
    Number(eventReminder.time),
  );
}
