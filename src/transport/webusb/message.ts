/* eslint-disable no-bitwise */
import { WIRE_COMMANDS, WIRE_TO_COMMAND } from './constants';
import { Reader, Sender } from './interface';

// strictly speaking, this is Uint32Array<6>.
type Header = DataView;

// strictly speaking, these are all Uint32, however JS can't handle that.
// We never need to read the checksum, only write it for legacy implementations
type UnpackedHeader = {
  command: number;
  arg0: number;
  arg1: number;
  dataLength: number;
  //checksum?: number;
  magic: number;
}

export default class Message {
  private command: number;

  private magic: number;

  private arg0: number;

  private arg1: number;

  private data: DataView;

  public constructor(command: string, arg0: number, arg1: number, data: ArrayBuffer | string = '') {
    this.command = WIRE_COMMANDS[command];
    this.magic = this.command ^ 0xffffffff;
    this.arg0 = arg0;
    this.arg1 = arg1;

    if (typeof data === 'string') {
      this.data = new DataView(new TextEncoder().encode(data).buffer);
    } else {
      this.data = new DataView(data);
    }
  }

  public getHeader(useChecksum = true): BufferSource {
    return this.pack(useChecksum);
  }

  public getData(): BufferSource {
    return this.data;
  }

  public async send(transport: Sender): Promise<void> {
    await transport.send(this.getHeader(transport.useChecksum));
    if (this.hasData()) await transport.send(this.getData());
  }

  private hasData(): boolean {
    return this.data.byteLength > 0;
  }

  private get checksum(): number {
    let sum = 0;
    for (let i = 0; i < this.data.byteLength; i++) {
      sum += this.data.getUint8(i);
    }
    return sum & 0xffffffff;
  }

  private pack(useChecksum = true): DataView {
    const buffer = new ArrayBuffer(6 * 4); // message is 6*32bit
    const view = new DataView(buffer);
    const isLittleEndian = true;

    view.setUint32(0, this.command, isLittleEndian);
    view.setUint32(4, this.arg0, isLittleEndian);
    view.setUint32(8, this.arg1, isLittleEndian);
    view.setUint32(12, this.data.byteLength, isLittleEndian);
    view.setUint32(20, this.magic, isLittleEndian);

    if (useChecksum) {
      view.setUint32(16, this.checksum, isLittleEndian);
    }

    return view;
  }
}

export class Response {
  public command: string;

  public arg0: number;

  public arg1: number;

  public magic: number;

  public rawData: DataView;

  public data: string;

  private constructor(
    command: string, arg0: number, arg1: number, magic: number, rawData: DataView,
  ) {
    this.command = command;
    this.arg0 = arg0;
    this.arg1 = arg1;
    this.magic = magic;
    this.rawData = rawData;
    this.data = new TextDecoder().decode(rawData);
  }

  public static async read(transport: Reader): Promise<Response> {
    const view = await transport.read();
    const unpacked = this.unpack(view);
    return new this(
      WIRE_TO_COMMAND[unpacked.command],
      unpacked.arg0,
      unpacked.arg1,
      unpacked.magic,
      await this.fetchDataOrEmpty(transport, unpacked.dataLength),
    );
  }

  private static unpack(view: Header): UnpackedHeader {
    const isLittleEndian = true;

    return {
      command: view.getUint32(0, isLittleEndian),
      arg0: view.getUint32(4, isLittleEndian),
      arg1: view.getUint32(8, isLittleEndian),
      dataLength: view.getUint32(12, isLittleEndian),
      // we don't need to check the checksum, and it isn't available on modern implementations
      //checksum: useChecksum ? view.getUint32(16, isLittleEndian) : undefined,
      magic: view.getUint32(20, isLittleEndian),
    };
  }

  private static async fetchDataOrEmpty(transport: Reader, length: number): Promise<DataView> {
    if (length > 0) {
      return transport.read(length);
    }
    return new DataView(new ArrayBuffer(0));
  }
}
