import Transport from './transport/webusb/index';

export default class LibADB {
  private transport?: Transport;

  public static Transport = Transport;


  public async start(): Promise<void> {
    console.log('starting');
    await this.getTransport();
  }

  private async getTransport(): Promise<Transport> {
    if (!this.transport) this.transport = await Transport.open();
    return this.transport;
  }
}
