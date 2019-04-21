// client docs: https://wicg.github.io/webusb/
// available in recent versions of Chrome

import * as constants from './constants';
import { DEFAULT_MAX_BYTES, ADB_USB_DEVICE_FILTER } from './constants';
import configureForADB from './configureForADB';
import { Reader, Sender } from './interface';
import Message, { Response } from './message';
import AuthHandshake from './authHandshake';


export default class WebUSBTransport implements Reader, Sender {
  public device: USBDevice;

  public static Message = Message;

  public static Response = Response;

  public static Constants = constants;

  public static AuthHandshake = AuthHandshake;

  private endpoint: {
    read: number;
    send: number;
  } = { read: -1, send: -1 };

  private maxBytes = DEFAULT_MAX_BYTES;

  public useChecksum = true;

  public constructor(device: USBDevice) {
    this.device = device;
    this.configure();
  }

  public static async open(): Promise<WebUSBTransport> {
    const device = await navigator.usb.requestDevice({
      filters: [ADB_USB_DEVICE_FILTER],
    });
    await device.open();
    return new this(device);
  }

  public async read(length?: number): Promise<DataView> {
    // TODO: we need to do chunking for when we request over our max byte limit
    const result = await this.device.transferIn(this.endpoint.read, length || this.maxBytes);
    return result.data || new DataView(new ArrayBuffer(0));
  }

  public async send(buffer: BufferSource): Promise<void> {
    await this.device.transferOut(this.endpoint.send, buffer);
  }

  private async configure(): Promise<void> {
    this.endpoint = await configureForADB(this.device);
  }

  public configureForDevice(connectionResponse: Response): void {
    if (connectionResponse.command !== constants.COMMANDS.CONNECTION) return;
    this.useChecksum = connectionResponse.arg0 >= constants.VERSION.NO_CHECKSUMS_FROM;
    this.maxBytes = connectionResponse.arg1;
  }
}
