export interface CommandMessage<T = unknown> {
  command: string;
  options?: T;
}
