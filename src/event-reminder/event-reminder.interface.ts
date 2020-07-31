export interface EventReminder {
  name: string;
  time: string | number;
}

export type EventReminderHandler = (eventReminder: EventReminder) => void;
