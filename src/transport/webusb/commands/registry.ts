import { Command } from './interface';

interface Store {
  [commandName: string]: {
    default: Command;
    [arg0: number]: Command;
  };
}

class Registry {
  private store: Store = {};

  public register<T extends Command>(
    { commandName, arg0 }: { commandName: string; arg0?: number },
    command?: T,
  ): T | (<T extends Command>(constructor: T) => T) {
    if (command) {
      return this.storeCommand({ commandName, arg0 }, command);
    }
    return (
      <T extends Command>(constructor: T): T => this.storeCommand({ commandName, arg0 }, constructor)
    );
  }

  private storeCommand<T extends Command>(
    { commandName, arg0 }: { commandName: string; arg0?: number },
    command: T,
  ): T {
    const storedArg0: 'default' | number = (arg0 === undefined) ? 'default' : arg0;
    this.store[commandName][storedArg0] = command;
    return command;
  }
}


const registry = new Registry();
export default registry;
