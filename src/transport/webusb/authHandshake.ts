import AdbMessage, { Response } from './message';
import { COMMANDS } from './constants';
import { Sender, Reader } from './interface';

const enum AUTH_SUBCOMMANDS {
  AUTH_TOKEN = 1,
  AUTH_SIGNATURE = 2,
  AUTH_RSAPUBLICKEY = 3,
}

export default class AuthHandshake {
  public transport: Reader & Sender;

  private rsaKey?: CryptoKeyPair;

  public constructor(transport: Reader & Sender) {
    this.transport = transport;
  }

  public async handle(authResponse: Response): Promise<Response> {
    if (
      authResponse.command !== COMMANDS.AUTH
      || authResponse.arg0 !== AUTH_SUBCOMMANDS.AUTH_TOKEN
    ) {
      console.log('not expected: ', authResponse);
      throw Error;
    }

    let response = await this.trySignedToken(authResponse);
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

  private async trySignedToken(authResponse: Response): Promise<Response> {
    const rsaKey = await this.getRsaKey();
    const signedToken = await window.crypto.subtle.sign(
      rsaKey.privateKey.algorithm.name,
      rsaKey.privateKey,
      authResponse.rawData.buffer,
    );
    const signatureMessage = new AdbMessage(
      COMMANDS.AUTH,
      AUTH_SUBCOMMANDS.AUTH_SIGNATURE,
      0,
      signedToken,
    );
    signatureMessage.send(this.transport);

    return Response.read(this.transport);
  }

  private async authoriseKey(): Promise<Response> {
    const message = new AdbMessage(
      COMMANDS.AUTH,
      AUTH_SUBCOMMANDS.AUTH_RSAPUBLICKEY,
      0,
      `${await this.getPubKeyB64()}\0`,
    );
    message.send(this.transport);
    return Response.read(this.transport);
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

  private static isConnected(response: Response): boolean {
    return response.command === COMMANDS.CONNECTION;
  }
}
