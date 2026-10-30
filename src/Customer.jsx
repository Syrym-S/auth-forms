import { InviteProvider } from './customer/context/InviteContext';
import CustomerRouter from './customer/router';
import AuthLocaleProvider from './i18n/AuthLocaleProvider';

export default function CustomerApp() {
  return (
    <AuthLocaleProvider role="customer">
      <InviteProvider>
        <CustomerRouter />
      </InviteProvider>
    </AuthLocaleProvider>
  );
}
