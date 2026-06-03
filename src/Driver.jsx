import DriverRouter from './driver/router';
import { RegisterProvider } from './driver/context/RegisterContext';

export default function DriverApp() {
  return (
    <RegisterProvider>
      <DriverRouter />
    </RegisterProvider>
  );
}