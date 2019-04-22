export interface Command {
  command: string;
  arg0: number;
  arg1: number;
  data?: ArrayBuffer | string;
}
