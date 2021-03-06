import { COMMAND_NAME } from '../constants';
import BaseCommand from './base';
import { commandRegistry } from './registry';

const enum AuthSubcommands {
  Token = 1,
  Signature = 2,
  RsaPublicKey = 3,
}

@commandRegistry.register({ commandName: COMMAND_NAME.AUTH, arg0: AuthSubcommands.Token })
export class AuthToken extends BaseCommand {
  public static commandName = COMMAND_NAME.AUTH;

  public static arg0 = AuthSubcommands.Token;

  public static arg1 = 0;
}

@commandRegistry.register({ commandName: COMMAND_NAME.AUTH, arg0: AuthSubcommands.Signature })
export class AuthSignature extends BaseCommand {
  public static commandName = COMMAND_NAME.AUTH;

  public static arg0 = AuthSubcommands.Signature;

  public static arg1 = 0;
}

@commandRegistry.register({ commandName: COMMAND_NAME.AUTH, arg0: AuthSubcommands.RsaPublicKey })
export class AuthRsaPublicKey extends BaseCommand {
  public static commandName = COMMAND_NAME.AUTH;

  public static arg0 = AuthSubcommands.RsaPublicKey;

  public static arg1 = 0;
}
