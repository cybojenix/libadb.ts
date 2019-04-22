// https://github.com/aosp-mirror/platform_system_core/blob/9b33cbc0cbe92e7f1e60f7b8a3c2fc35976aadbc/adb/adb.h#L198-L200
export const ADB_USB_DEVICE_FILTER: USBDeviceFilter = {
  classCode: 0xFF,
  subclassCode: 0x42,
  protocolCode: 0x1,
};

export const COMMAND_NAME = {
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

export const WIRE_COMMAND_IDS = {
  [COMMAND_NAME.SYNC]: 0x434e5953,
  [COMMAND_NAME.CONNECTION]: 0x4e584e43,
  [COMMAND_NAME.AUTH]: 0x48545541,
  [COMMAND_NAME.OPEN]: 0x4e45504f,
  [COMMAND_NAME.OKAY]: 0x59414b4f,
  [COMMAND_NAME.WRITE]: 0x45545257,
  [COMMAND_NAME.CLOSE]: 0x45534c43,
};

export const WIRE_TO_COMMAND_NAME = {
  [WIRE_COMMAND_IDS[COMMAND_NAME.SYNC]]: COMMAND_NAME.SYNC,
  [WIRE_COMMAND_IDS[COMMAND_NAME.CONNECTION]]: COMMAND_NAME.CONNECTION,
  [WIRE_COMMAND_IDS[COMMAND_NAME.AUTH]]: COMMAND_NAME.AUTH,
  [WIRE_COMMAND_IDS[COMMAND_NAME.OPEN]]: COMMAND_NAME.OPEN,
  [WIRE_COMMAND_IDS[COMMAND_NAME.OKAY]]: COMMAND_NAME.OKAY,
  [WIRE_COMMAND_IDS[COMMAND_NAME.WRITE]]: COMMAND_NAME.WRITE,
  [WIRE_COMMAND_IDS[COMMAND_NAME.CLOSE]]: COMMAND_NAME.CLOSE,
};

export const enum VERSION {
  MIN = 0x10000000,
  MAX = 0x10000001,
  CURRENT = VERSION.MAX,

  NO_CHECKSUMS_FROM = 0x10000001,
}

export const DEFAULT_MAX_BYTES = 4096;
