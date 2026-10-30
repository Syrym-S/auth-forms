import ForwarderRouter from './forwarder/router';
import AuthLocaleProvider from './i18n/AuthLocaleProvider';

export default function ForwarderApp() {
  return (
    <AuthLocaleProvider>
      <ForwarderRouter />
    </AuthLocaleProvider>
  );
}
