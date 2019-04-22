import { COMMANDS } from '../constants';
import BaseCommand from './base';

const enum AuthSubcommands {
  Token = 1,
  Signature = 2,
  RsaPublicKey = 3,
}

export class AuthToken extends BaseCommand {
  public static command = COMMANDS.AUTH;

  public static arg0 = AuthSubcommands.Token;

  public static arg1 = 0;
}

export class AuthSignature extends BaseCommand {
  public static command = COMMANDS.AUTH;

  public static arg0 = AuthSubcommands.Signature;

  public static arg1 = 0;
}

export class AuthRsaPublicKey extends BaseCommand {
  public static command = COMMANDS.AUTH;

  public static arg0 = AuthSubcommands.RsaPublicKey;

  public static arg1 = 0;
}
