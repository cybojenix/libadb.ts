export interface Sender {
  send(buffer: BufferSource): Promise<void>;
  useChecksum: boolean;
}

export interface Reader {
  read(length?: number): Promise<DataView>;
  useChecksum: boolean;
}
