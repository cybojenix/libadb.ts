// client docs: https://wicg.github.io/webusb/
// available in recent versions of Chrome

import * as constants from './constants';
import { DEFAULT_MAX_BYTES } from './constants';
import { Reader, Sender } from './interface';
import Message, { Response } from './message';
import AuthHandshake from './authHandshake';
import Connection from './connection';
import { AuthToken, AuthSignature, AuthRsaPublicKey } from './commands/auth';
import { commandRegistry } from './commands/registry';
import { Command } from './commands/interface';

export default class WebUSBTransport implements Reader, Sender {
  public connection: Connection;

  public static Message = Message;

  public static Response = Response;

  public static Constants = constants;

  public static Commands = {
    AuthToken, AuthSignature, AuthRsaPublicKey,
  }

  public static commandRegistry = commandRegistry;

  private maxBytes = DEFAULT_MAX_BYTES;

  public useChecksum = true;

  public constructor(connection: Connection) {
    this.connection = connection;
  }

  public static async open(): Promise<WebUSBTransport> {
    const device = await Connection.findAdbDevice();
    return new this(await Connection.connect(device));
  }

  public async connect(): Promise<void> {
    const openMessage = new Message(
      constants.COMMAND_NAME.CONNECTION,
      constants.VERSION.CURRENT,
      this.maxBytes,
      'host::LibADB.ts\0',
    );
    await openMessage.send(this);
    let connectionResponse = (await Response.read(this)).toCommand();
    if (connectionResponse instanceof AuthToken) {
      const auth = new AuthHandshake(this);
      connectionResponse = await auth.handle(connectionResponse);
    }
    if (connectionResponse.commandName === constants.COMMAND_NAME.CONNECTION) {
      this.configureForDevice(connectionResponse);
    }
  }

  public async read(length?: number): Promise<DataView> {
    return this.connection.read(length || this.maxBytes);
  }

  public async send(buffer: BufferSource): Promise<void> {
    return this.connection.send(buffer);
  }

  public configureForDevice(connectionResponse: Command): void {
    if (connectionResponse.commandName !== constants.COMMAND_NAME.CONNECTION) return;
    this.useChecksum = connectionResponse.arg0 >= constants.VERSION.NO_CHECKSUMS_FROM;
    this.maxBytes = connectionResponse.arg1;
  }

}
