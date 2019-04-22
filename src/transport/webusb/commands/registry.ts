import BaseCommand from './base';

type defaultArg0Name = 'default';
type storedArg0 = defaultArg0Name | number;
const defaultArg0Name: defaultArg0Name = 'default';

interface Store {
  [commandName: string]: {
    [defaultArg0Name]: typeof BaseCommand;
    [arg0: number]: typeof BaseCommand;
  };
}

class Registry {
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
    if (!commands) throw Error(`Command not found: ${commandName}`);

    const storedArg0 = Registry.constructStoredArg0(arg0);
    const command = commands[storedArg0] || commands[defaultArg0Name];
    if (!command) throw Error(`Command not found: {commandName: ${commandName}, arg0: ${arg0}`);
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
    this.store[commandName][storedArg0] = command;
    return command;
  }
}


const registry = new Registry();
export default registry;
