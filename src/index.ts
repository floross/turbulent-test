import { bootstrapServer } from './server';

// Entrypoint of our event reminder application
async function eventReminderBootstrap(): Promise<void> {
  return bootstrapServer();
}

eventReminderBootstrap();
