export function getDateFromTime(time: string | number): Date {
  return new Date(Date.now() + Number(time));
}

export function getTimeFromDate(date: Date): number {
  return date.getTime() - new Date().getTime();
}
