import { ADB_USB_DEVICE_FILTER } from './constants';
import configureForADB from './configureForADB';

export default class Connection {
  private device: USBDevice;

  private readEndpoint: number;

  private sendEndpoint: number;

  private constructor(device, readEndpoint: number, sendEndpoint: number) {
    this.device = device;
    this.readEndpoint = readEndpoint;
    this.sendEndpoint = sendEndpoint;
  }

  public static async connect(device: USBDevice): Promise<Connection> {
    const endpoints = await configureForADB(device);
    return new this(device, endpoints.read, endpoints.send);
  }

  public static findAdbDevice(): Promise<USBDevice> {
    return navigator.usb.requestDevice({
      filters: [ADB_USB_DEVICE_FILTER],
    });
  }

  public async read(length): Promise<DataView> {
    const result = await this.device.transferIn(this.readEndpoint, length);
    return result.data || new DataView(new ArrayBuffer(0));
  }

  public async send(buffer: BufferSource): Promise<void> {
    await this.device.transferOut(this.sendEndpoint, buffer);
  }
}