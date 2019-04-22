import AdbMessage, { Response } from './message';
import { COMMAND_NAME } from './constants';
import { Sender, Reader } from './interface';
import { AuthToken, AuthRsaPublicKey, AuthSignature } from './commands/auth';
import { Command } from './commands/interface';

export default class AuthHandshake {
  public transport: Reader & Sender;

  private rsaKey?: CryptoKeyPair;

  public constructor(transport: Reader & Sender) {
    this.transport = transport;
  }

  public async handle(authTokenCommand: AuthToken): Promise<Command> {
    let response = await this.trySignedToken(authTokenCommand);
    if (AuthHandshake.isConnected(response)) {
      console.log('hackervoice:', "we're in");
      return response;
    }
    console.log('failed token:', response);

    response = await this.authoriseKey();
    if (AuthHandshake.isConnected(response)) {
      console.log('hackervoice:', "we're in");
      return response;
    }

    console.warn('auth: failed to get in', response);
    throw Error;
  }

  private async trySignedToken(authResponse: AuthToken): Promise<Command> {
    const rsaKey = await this.getRsaKey();
    const signedToken = await window.crypto.subtle.sign(
      rsaKey.privateKey.algorithm.name,
      rsaKey.privateKey,
      authResponse.data,
    );
    const signatureMessage = AdbMessage.fromCommand(new AuthSignature({ data: signedToken }));
    await signatureMessage.send(this.transport);

    return (await Response.read(this.transport)).toCommand();
  }

  private async authoriseKey(): Promise<Command> {
    const message = AdbMessage.fromCommand(
      new AuthRsaPublicKey({ data: `${await this.getPubKeyB64()}\0` }),
    );
    message.send(this.transport);
    return (await Response.read(this.transport)).toCommand();
  }

  private async getRsaKey(): Promise<CryptoKeyPair> {
    if (!this.rsaKey) {
      this.rsaKey = await window.crypto.subtle.generateKey(
        {
          name: 'RSASSA-PKCS1-v1_5',
          modulusLength: 2048,
          publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
          hash: { name: 'SHA-256' },
        },
        false,
        ['sign', 'verify'],
      );
    }
    return this.rsaKey;
  }

  private async getPubKeyB64(): Promise<string> {
    const pubKey = await window.crypto.subtle.exportKey(
      'spki',
      (await this.getRsaKey()).publicKey,
    );

    // This is to fool String.fromCharCode. It is safe in this context.
    const view = new Uint8Array(pubKey) as unknown as number[];

    return window.btoa(
      String.fromCharCode.apply(null, view),
    );
  }

  private static isConnected(command: Command): boolean {
    return command.commandName === COMMAND_NAME.CONNECTION;
  }
}
