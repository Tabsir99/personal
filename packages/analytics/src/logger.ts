import { config } from './config';
import { LogLevel } from './types';
import { APP_NAME } from './constants';

export function log(level: LogLevel, message: string, ...args: unknown[]) {
  if (config.disableConsole) return;
  const prefix = `${APP_NAME.toUpperCase()}:`;
  switch (level) {
    case 'warn':
      console.warn(prefix, message, ...args);
      break;
    case 'error':
      console.error(prefix, message, ...args);
      break;
    case 'info':
    default:
      console.log(prefix, message, ...args);
      break;
  }
}
