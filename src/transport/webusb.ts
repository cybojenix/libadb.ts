// client docs: https://wicg.github.io/webusb/
// available in recent versions of Chrome


export default class WebUSBTransport {
  public device: USBDevice;

  public constructor(device: USBDevice) {
    this.device = device;
  }

  public static async open(): Promise<WebUSBTransport> {
    const device = await navigator.usb.requestDevice();
    return new this(device);
  }
}
