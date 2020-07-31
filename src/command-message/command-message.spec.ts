import {
  isCommandMessage,
  parseCommandMessage,
} from './command-message.service';
import { ERROR_COMMAND_BAD_REQUEST } from '../constants/error.constant';

describe('Command message parser', () => {
  test('isCommandMessage: assert CommandMessage format', () => {
    // expect to be the CommandMessage format
    expect(isCommandMessage({ command: 'any' })).toBe(true);
    expect(isCommandMessage({ command: 'any', options: {} })).toBe(true);

    // Verify if other format does not work
    expect(isCommandMessage(null)).toBe(false);
    expect(isCommandMessage('test')).toBe(false);
    expect(isCommandMessage({ foo: 'any' })).toBe(false);
    expect(isCommandMessage({ command: {} })).toBe(false);
  });

  test('parseCommandMessage: parse a string message to a CommandMessage object', () => {
    // Check for valid command message to work
    expect(parseCommandMessage(JSON.stringify({ command: 'any' }))).toEqual({
      command: 'any',
    });
    expect(
      parseCommandMessage(JSON.stringify({ command: 'any', options: {} })),
    ).toEqual({ command: 'any', options: {} });

    // assert invalid parameter throw an error
    const errorRegex = new RegExp(`^${ERROR_COMMAND_BAD_REQUEST}.*`);
    expect(() => parseCommandMessage('test')).toThrowWithMessage(
      Error,
      errorRegex,
    );
    expect(() => parseCommandMessage(new Buffer('test'))).toThrowWithMessage(
      Error,
      errorRegex,
    );
    expect(() =>
      parseCommandMessage(JSON.stringify({ foo: 'any', options: {} })),
    ).toThrowWithMessage(Error, errorRegex);
  });
});
