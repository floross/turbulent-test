import { createConnection, Connection, ConnectionOptions, Raw } from 'typeorm';

import { getDateFromTime, getTimeFromDate } from './convert-time-and-date';
import { EventReminderEntity } from './entity/EventReminder';
import { EventReminder } from '../event-reminder/event-reminder.interface';

export async function createOrmConnection(
  options?: ConnectionOptions,
): Promise<Connection> {
  // The declaration of the createConnection do not take optional argument
  // Typescrypt complain if use directly like this: return createConnection(options);
  if (options) return createConnection(options);
  return createConnection();
}

export async function findAllEventReminder(
  connection: Connection,
): Promise<EventReminderEntity[]> {
  const repository = await connection.getRepository(EventReminderEntity);
  return repository.find();
}

export async function purgeOldEventReminder(
  connection: Connection,
): Promise<EventReminderEntity[]> {
  const repository = await connection.getRepository(EventReminderEntity);
  const toRemove = await repository.find({
    where: {
      eventDate: Raw(
        (alias) => `${alias} <= datetime("${new Date().toISOString()}")`,
      ),
    },
  });

  return repository.remove(toRemove);
}

export async function saveEventReminder(
  connection: Connection,
  eventReminder: EventReminder,
): Promise<EventReminderEntity> {
  const repository = await connection.getRepository(EventReminderEntity);
  const eventToSave = new EventReminderEntity();
  eventToSave.name = eventReminder.name;
  eventToSave.eventDate = getDateFromTime(eventReminder.time);

  return repository.save(eventToSave);
}

export function convertEntityToEventReminder(
  entity: EventReminderEntity,
): EventReminder {
  return {
    name: entity.name,
    time: getTimeFromDate(entity.eventDate),
  };
}
