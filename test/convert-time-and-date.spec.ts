import {
  getDateFromTime,
  getTimeFromDate,
} from '../src/orm/convert-time-and-date';

describe('Convert time and date to save and load the entity', () => {
  test('getDateFromTime', () => {
    expect(
      getDateFromTime(1000).getTime() - new Date().getTime(),
    ).toBeLessThanOrEqual(1005);
    expect(
      getDateFromTime(1000).getTime() - new Date().getTime(),
    ).toBeGreaterThanOrEqual(995);
  });

  test('getTimeFromDate', () => {
    expect(getTimeFromDate(getDateFromTime(1000))).toBeLessThanOrEqual(1005);
    expect(getTimeFromDate(getDateFromTime(1000))).toBeGreaterThanOrEqual(995);
  });
});
