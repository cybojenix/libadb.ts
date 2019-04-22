export interface Command {
  commandName: string;
  arg0: number;
  arg1: number;
  data: DataView;
  text: string;
}
