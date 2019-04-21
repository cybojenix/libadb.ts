// https://github.com/aosp-mirror/platform_system_core/blob/9b33cbc0cbe92e7f1e60f7b8a3c2fc35976aadbc/adb/adb.h#L198-L200
export const ADB_USB_DEVICE_FILTER: USBDeviceFilter = {
  classCode: 0xFF,
  subclassCode: 0x42,
  protocolCode: 0x1,
};

export const COMMANDS = {
  SYNC: 'SYNC',
  CONNECTION: 'CNXN',
  AUTH: 'AUTH',
  OPEN: 'OPEN',
  OKAY: 'OKAY',
  WRITE: 'WRTE',
  CLOSE: 'CLSE',
};

/* These are calculated with this method:
<command>
  .split('')
  .reduce((current_total, char, index) => {
    current_total + (char.charCodeAt(0) << (index * 8))
  }, 0).toString(16)
*/

export const WIRE_COMMANDS = {
  [COMMANDS.SYNC]: 0x434e5953,
  [COMMANDS.CONNECTION]: 0x4e584e43,
  [COMMANDS.AUTH]: 0x48545541,
  [COMMANDS.OPEN]: 0x4e45504f,
  [COMMANDS.OKAY]: 0x59414b4f,
  [COMMANDS.WRITE]: 0x45545257,
  [COMMANDS.CLOSE]: 0x45534c43,
};

export const WIRE_TO_COMMAND = {
  [WIRE_COMMANDS[COMMANDS.SYNC]]: COMMANDS.SYNC,
  [WIRE_COMMANDS[COMMANDS.CONNECTION]]: COMMANDS.CONNECTION,
  [WIRE_COMMANDS[COMMANDS.AUTH]]: COMMANDS.AUTH,
  [WIRE_COMMANDS[COMMANDS.OPEN]]: COMMANDS.OPEN,
  [WIRE_COMMANDS[COMMANDS.OKAY]]: COMMANDS.OKAY,
  [WIRE_COMMANDS[COMMANDS.WRITE]]: COMMANDS.WRITE,
  [WIRE_COMMANDS[COMMANDS.CLOSE]]: COMMANDS.CLOSE,
};

export const enum VERSION {
  MIN = 0x10000000,
  MAX = 0x10000001,
  CURRENT = VERSION.MAX,

  NO_CHECKSUMS_FROM = 0x10000001,
}

export const DEFAULT_MAX_BYTES = 4096;
