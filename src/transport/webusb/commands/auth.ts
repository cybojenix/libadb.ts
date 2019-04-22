import { COMMANDS } from '../constants';
import { Command } from './interface';
import registry from './registry';

const enum AuthSubcommands {
  Token = 1,
  Signature = 2,
  RsaPublicKey = 3,
}

@registry.register({ commandName: COMMANDS.AUTH, arg0: AuthSubcommands.Token })
export class AuthToken implements Command {
  public command = COMMANDS.AUTH;

  public arg0 = AuthSubcommands.Token;

  public arg1 = 0;

  public data: ArrayBuffer;

  public constructor({ data }: { data: ArrayBuffer }) {
    this.data = data;
  }
}

@registry.register({ commandName: COMMANDS.AUTH, arg0: AuthSubcommands.Signature })
export class AuthSignature implements Command {
  public command = COMMANDS.AUTH;

  public arg0 = AuthSubcommands.Signature;

  public arg1 = 0;

  public data: ArrayBuffer;

  public constructor({ data }: { data: ArrayBuffer }) {
    this.data = data;
  }
}

@registry.register({ commandName: COMMANDS.AUTH, arg0: AuthSubcommands.RsaPublicKey })
export class AuthRsaPublicKey implements Command {
  public command = COMMANDS.AUTH;

  public arg0 = AuthSubcommands.RsaPublicKey;

  public arg1 = 0;

  public data: ArrayBuffer | string;

  public constructor({ data }: { data: ArrayBuffer | string }) {
    this.data = data;
  }
}
