import { ResetPasswordForm } from '../../../shared/ResetPasswordForm';
import AuthLayout from '../../components/AuthLayout';
import FormInput from '../../../shared/FormInput';
import FormButton from '../../../shared/FormButton';

export default function ResetPassword() {
  return (
    <AuthLayout>
      <ResetPasswordForm InputComponent={FormInput} ButtonComponent={FormButton} />
    </AuthLayout>
  );
}
