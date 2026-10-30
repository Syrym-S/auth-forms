import DriverRouter from './driver/router';
import { RegisterProvider } from './driver/context/RegisterContext';
import AuthLanguagesProvider from './shared/AuthLanguagesProvider';

export default function DriverApp() {
  return (
    <AuthLanguagesProvider role="driver">
      <RegisterProvider>
        <DriverRouter />
      </RegisterProvider>
    </AuthLanguagesProvider>
  );
}
