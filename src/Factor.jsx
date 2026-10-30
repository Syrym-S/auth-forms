import FactorRouter from './factor/router';
import AuthLocaleProvider from './i18n/AuthLocaleProvider';

export default function FactorApp() {
  return (
    <AuthLocaleProvider>
      <FactorRouter />
    </AuthLocaleProvider>
  );
}
