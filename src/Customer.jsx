import { InviteProvider } from './customer/context/InviteContext';
import CustomerRouter from './customer/router';

export default function CustomerApp() {
  return (
    <InviteProvider>
      <CustomerRouter />
    </InviteProvider>
  );
}