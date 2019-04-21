import { ADB_USB_DEVICE_FILTER } from './constants';

function isAdbAlternate(alternate: USBAlternateInterface): boolean {
  return alternate.interfaceClass === ADB_USB_DEVICE_FILTER.classCode
    && alternate.interfaceSubclass === ADB_USB_DEVICE_FILTER.subclassCode
    && alternate.interfaceProtocol === ADB_USB_DEVICE_FILTER.protocolCode;
}

// eslint-disable-next-line max-len
function getAdbInterface(interfaces: USBInterface[]): [USBInterface, USBAlternateInterface] | undefined {
  // eslint-disable-next-line no-restricted-syntax
  for (const usbInterface of interfaces) {
    // eslint-disable-next-line no-restricted-syntax
    for (const alternateInterface of usbInterface.alternates) {
      if (isAdbAlternate(alternateInterface)) {
        return [
          usbInterface, alternateInterface,
        ];
      }
    }
  }
  return undefined;
}

// eslint-disable-next-line max-len
function getAdbConfiguration(configurations: USBConfiguration[]): [USBConfiguration, USBInterface, USBAlternateInterface] | undefined {
  // eslint-disable-next-line no-restricted-syntax
  for (const configuration of configurations) {
    const adbInterface = getAdbInterface(configuration.interfaces);
    if (adbInterface !== undefined) {
      return [
        configuration, adbInterface[0], adbInterface[1],
      ];
    }
  }
  return undefined;
}

function getAdbEndpoints(alternate: USBAlternateInterface): { read: number; send: number } {
  let readEndpoint: number = -1;
  let sendEndpoint: number = -1;
  // eslint-disable-next-line no-restricted-syntax
  for (const endpoint of alternate.endpoints) {
    if (endpoint.type === 'bulk') {
      if (endpoint.direction === 'in') {
        readEndpoint = endpoint.endpointNumber;
      } else if (endpoint.direction === 'out') {
        sendEndpoint = endpoint.endpointNumber;
      }
    }
  }

  return {
    read: readEndpoint,
    send: sendEndpoint,
  };
}

export default async function configureForADB(
  device: USBDevice,
): Promise<{ read: number; send: number }> {
  const adbConfigChain = getAdbConfiguration(device.configurations);
  if (!adbConfigChain) return { read: -1, send: -1 };

  const [
    usbConfiguration,
    usbInterface,
    usbAlternate,
  ] = adbConfigChain;

  await device.selectConfiguration(usbConfiguration.configurationValue);
  await device.claimInterface(usbInterface.interfaceNumber);
  await device.selectAlternateInterface(
    usbInterface.interfaceNumber, usbAlternate.alternateSetting,
  );
  return getAdbEndpoints(usbAlternate);
}
