import { ForgotPasswordForm } from '../../../shared/ForgotPasswordForm';
import AuthLayout from '../../components/AuthLayout';
import FormInput from '../../../shared/FormInput';
import FormButton from '../../../shared/FormButton';

export default function ForgotPassword() {
  return (
    <AuthLayout>
      <ForgotPasswordForm InputComponent={FormInput} ButtonComponent={FormButton} />
    </AuthLayout>
  );
}
