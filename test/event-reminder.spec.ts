import { ERROR_COMMAND_EVENT_EMITTER_BAD_REQUEST } from '../src/constants/error.constant';
import {
  isEventReminder,
  EVENT_REMINDER_COMMAND,
  parseEventReminder,
  addEventReminder,
} from '../src/event-reminder/event-reminder.service';

describe('Event reminder parser Service', () => {
  test('isEventReminder: assert EventReminder format', () => {
    // expect to be the EventReminder format
    expect(
      isEventReminder({
        command: EVENT_REMINDER_COMMAND,
        options: { name: 'foo', time: '123' },
      }),
    ).toBe(true);
    expect(
      isEventReminder({
        command: EVENT_REMINDER_COMMAND,
        options: { name: 'foo', time: 123 },
      }),
    ).toBe(true);

    // Verify if other format does not work
    expect(
      isEventReminder({
        command: EVENT_REMINDER_COMMAND,
        options: { name: 'foo', time: 'bar' },
      }),
    ).toBe(false);
    expect(
      isEventReminder({
        command: EVENT_REMINDER_COMMAND,
        options: { foo: 'foo', time: 123 },
      }),
    ).toBe(false);
    expect(
      isEventReminder({
        command: EVENT_REMINDER_COMMAND,
        options: { name: 'foo', bar: 123 },
      }),
    ).toBe(false);
  });

  test('parseCommandMessage: parse a string message to a EventReminder object', () => {
    // expect to be the EventReminder format
    expect(
      parseEventReminder({
        command: EVENT_REMINDER_COMMAND,
        options: { name: 'foo', time: '123' },
      }),
    ).toEqual({
      command: EVENT_REMINDER_COMMAND,
      options: { name: 'foo', time: '123' },
    });
    expect(
      parseEventReminder({
        command: EVENT_REMINDER_COMMAND,
        options: { name: 'foo', time: 123 },
      }),
    ).toEqual({
      command: EVENT_REMINDER_COMMAND,
      options: { name: 'foo', time: 123 },
    });

    // Verify if other format does not work
    const errorRegex = new RegExp(
      `^${ERROR_COMMAND_EVENT_EMITTER_BAD_REQUEST}.*`,
    );
    expect(() =>
      parseEventReminder({
        command: EVENT_REMINDER_COMMAND,
        options: { name: 'foo', time: 'bar' },
      }),
    ).toThrowWithMessage(Error, errorRegex);
    expect(() =>
      parseEventReminder({
        command: EVENT_REMINDER_COMMAND,
        options: { foo: 'foo', time: 123 },
      }),
    ).toThrowWithMessage(Error, errorRegex);
    expect(() =>
      parseEventReminder({
        command: EVENT_REMINDER_COMMAND,
        options: { name: 'foo', bar: 123 },
      }),
    ).toThrowWithMessage(Error, errorRegex);
  });

  test('addEventReminder: call a function after a time with the event reminder informations', (done) => {
    const callback = jest.fn();
    addEventReminder(
      {
        command: EVENT_REMINDER_COMMAND,
        options: { name: 'foo', time: '1000' },
      },
      callback,
    );

    setTimeout(() => {
      expect(callback.mock.calls.length).toBe(1);
      expect(callback).toHaveBeenCalledWith({ name: 'foo', time: '1000' });
      done();
    }, 1100);
  });

  test('addEventReminder: check that the addEventEmitter is not execute with bad arguments', (done) => {
    // Verify if other format does not work
    const errorRegex = new RegExp(
      `^${ERROR_COMMAND_EVENT_EMITTER_BAD_REQUEST}.*`,
    );
    const callback = jest.fn();
    expect(() =>
      addEventReminder(
        {
          command: EVENT_REMINDER_COMMAND,
          options: { name: 'foo', time: 'Wrong Value' },
        },
        callback,
      ),
    ).toThrowWithMessage(Error, errorRegex);

    setTimeout(() => {
      expect(callback.mock.calls.length).toBe(0);
      done();
    }, 1100);
  });
});
