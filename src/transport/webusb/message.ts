/* eslint-disable no-bitwise */
import { WIRE_COMMAND_IDS, WIRE_TO_COMMAND_NAME } from './constants';
import { Reader, Sender } from './interface';
import { Command } from './commands/interface';
import { commandRegistry } from './commands/registry';

// strictly speaking, this is Uint32Array<6>.
type Header = DataView;

// strictly speaking, these are all Uint32, however JS can't handle that.
// We never need to read the checksum, only write it for legacy implementations
type UnpackedHeader = {
  commandID: number;
  arg0: number;
  arg1: number;
  dataLength: number;
  //checksum?: number;
  magic: number;
}

export default class Message {
  private commandID: number;

  private magic: number;

  private arg0: number;

  private arg1: number;

  private data: DataView;

  public constructor(commandName: string, arg0: number, arg1: number, data: ArrayBuffer | DataView | string = '') {
    this.commandID = WIRE_COMMAND_IDS[commandName];
    this.magic = this.commandID ^ 0xffffffff;
    this.arg0 = arg0;
    this.arg1 = arg1;

    if (typeof data === 'string') {
      this.data = new DataView(new TextEncoder().encode(data).buffer);
    } else if (data instanceof ArrayBuffer) {
      this.data = new DataView(data);
    } else {
      this.data = data;
    }
  }

  public static fromCommand(command: Command): Message {
    return new this(
      command.commandName, command.arg0, command.arg1, command.data,
    );
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

    view.setUint32(0, this.commandID, isLittleEndian);
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
  public commandName: string;

  public arg0: number;

  public arg1: number;

  public magic: number;

  public rawData: DataView;

  public data: string;

  private constructor(
    commandName: string, arg0: number, arg1: number, magic: number, rawData: DataView,
  ) {
    this.commandName = commandName;
    this.arg0 = arg0;
    this.arg1 = arg1;
    this.magic = magic;
    this.rawData = rawData;
    this.data = new TextDecoder().decode(rawData);
  }

  public toCommand(): Command {
    const CommandConstruct = commandRegistry.retrieve(
      { commandName: this.commandName, arg0: this.arg0 },
    );
    return new CommandConstruct({
      commandName: this.commandName,
      arg0: this.arg0,
      arg1: this.arg1,
      data: this.rawData.buffer,
    });
  }

  public static async read(transport: Reader): Promise<Response> {
    const view = await transport.read();
    const unpacked = this.unpack(view);
    return new this(
      WIRE_TO_COMMAND_NAME[unpacked.commandID],
      unpacked.arg0,
      unpacked.arg1,
      unpacked.magic,
      await this.fetchDataOrEmpty(transport, unpacked.dataLength),
    );
  }

  private static unpack(view: Header): UnpackedHeader {
    const isLittleEndian = true;

    return {
      commandID: view.getUint32(0, isLittleEndian),
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
