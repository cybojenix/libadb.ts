import BaseCommand from './base';

type defaultArg0Name = 'default';
type storedArg0 = defaultArg0Name | number;
const defaultArg0Name: defaultArg0Name = 'default';
const fallbackCommand = BaseCommand;

interface Store {
  [commandName: string]: {
    [defaultArg0Name]: typeof BaseCommand;
    [arg0: number]: typeof BaseCommand;
  };
}

export class Registry {
  private store: Store = {};

  public register<T extends typeof BaseCommand>(
    { commandName, arg0 }: { commandName: string; arg0?: number },
    command: T,
  ): T;

  public register(
    { commandName, arg0 }: { commandName: string; arg0?: number },
  ): <T extends typeof BaseCommand>(constructor: T) => T;

  public register<T extends typeof BaseCommand>(
    { commandName, arg0 }: { commandName: string; arg0?: number },
    command?: T,
  ): T | (<T extends typeof BaseCommand>(constructor: T) => T) {
    if (command) {
      return this.storeCommand({ commandName, arg0 }, command);
    }
    return (
      <T extends typeof BaseCommand>(constructor: T): T => this.storeCommand({ commandName, arg0 }, constructor)
    );
  }

  public retrieve(
    { commandName, arg0 }: { commandName: string; arg0?: number },
  ): typeof BaseCommand {
    const commands = this.store[commandName];
    if (!commands) return fallbackCommand;

    const storedArg0 = Registry.constructStoredArg0(arg0);
    const command = commands[storedArg0] || commands[defaultArg0Name];
    if (!command) return fallbackCommand;
    return command;
  }

  private static constructStoredArg0(arg0?: number): storedArg0 {
    return (arg0 === undefined) ? defaultArg0Name : arg0;
  }

  private storeCommand<T extends typeof BaseCommand>(
    { commandName, arg0 }: { commandName: string; arg0?: number },
    command: T,
  ): T {
    const storedArg0 = Registry.constructStoredArg0(arg0);
    this.store[commandName] = this.store[commandName] || {};
    this.store[commandName][storedArg0] = command;
    return command;
  }
}

export const commandRegistry = new Registry();
