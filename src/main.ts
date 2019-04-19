import Transport from './transport/webusb';

document.onclick = (async (): Promise<void> => {
  const transport = Transport.open();
  console.log(transport);
});
