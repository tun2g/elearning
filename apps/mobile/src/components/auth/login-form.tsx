import type { ReactNode } from 'react';
import { useForm } from '@tanstack/react-form';
import { Link } from 'expo-router';
import * as React from 'react';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';

import { Button, Input, Text, View } from '@/components/ui';
import { GoogleIcon } from '@/components/ui/google-icon';
import { AuthError } from '@/lib/auth/auth-actions';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RESEND_COOLDOWN_S = 30;

type Step = 'identifier' | 'method' | 'sent';

export type LoginFormProps = {
  onPasswordLogin: (email: string, password: string) => Promise<void>;
  onSendMagicLink: (email: string) => Promise<void>;
  onResendVerification: (email: string) => Promise<void>;
  onGoogle: () => Promise<void>;
};

function ErrorText({ error }: { error: string | null }) {
  if (!error)
    return null;
  return <Text className="mt-1 text-center text-sm text-danger-600">{error}</Text>;
}

function Divider() {
  return (
    <View className="my-4 flex-row items-center gap-3">
      <View className="h-px flex-1 bg-neutral-200 dark:bg-neutral-700" />
      <Text className="text-xs text-neutral-400">or</Text>
      <View className="h-px flex-1 bg-neutral-200 dark:bg-neutral-700" />
    </View>
  );
}

function useLoginForm({ onPasswordLogin, onSendMagicLink, onGoogle }: Omit<LoginFormProps, 'onResendVerification'>) {
  const form = useForm({ defaultValues: { email: '', password: '' } });
  const [step, setStep] = React.useState<Step>('identifier');
  const [error, setError] = React.useState<string | null>(null);
  const [info, setInfo] = React.useState<string | null>(null);
  const [unverified, setUnverified] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [cooldown, setCooldown] = React.useState(0);

  React.useEffect(() => {
    if (cooldown <= 0)
      return;
    const t = setTimeout(() => setCooldown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const email = () => form.getFieldValue('email').trim();

  const goIdentifier = () => {
    setStep('identifier');
    form.setFieldValue('password', '');
    setError(null);
    setInfo(null);
    setUnverified(false);
  };

  const continueWithEmail = () => {
    if (!EMAIL_RE.test(email()))
      return setError('Enter a valid email');
    setError(null);
    setStep('method');
  };

  const sendLink = async () => {
    setBusy(true);
    setError(null);
    try {
      await onSendMagicLink(email());
      setCooldown(RESEND_COOLDOWN_S);
      setStep('sent');
    }
    catch {
      setError('Could not send link');
    }
    finally {
      setBusy(false);
    }
  };

  const submitPassword = async () => {
    const password = form.getFieldValue('password');
    if (!password)
      return setError('Enter your password');
    setBusy(true);
    setError(null);
    setUnverified(false);
    try {
      await onPasswordLogin(email(), password);
    }
    catch (err) {
      if (err instanceof AuthError && err.code === 'EMAIL_NOT_VERIFIED')
        setUnverified(true);
      setError(err instanceof Error ? err.message : 'Invalid email or password');
    }
    finally {
      setBusy(false);
    }
  };

  const onGooglePress = async () => {
    setError(null);
    try {
      await onGoogle();
    }
    catch {
      setError('Google sign-in failed');
    }
  };

  const resend = async () => {
    if (cooldown > 0)
      return;
    setInfo(null);
    await onSendMagicLink(email()).catch(() => {});
    setCooldown(RESEND_COOLDOWN_S);
    setInfo('Sent again — check your inbox.');
  };

  return { form, step, error, info, busy, cooldown, unverified, email, goIdentifier, continueWithEmail, sendLink, submitPassword, onGooglePress, resend };
}

function IdentifierStep({ emailField, error, onGoogle, onContinue }: {
  emailField: ReactNode;
  error: string | null;
  onGoogle: () => void;
  onContinue: () => void;
}) {
  return (
    <View className="flex-1 justify-center p-4">
      <View className="items-center justify-center">
        <Text testID="form-title" className="pb-3 text-center text-4xl font-extrabold">Log in or sign up</Text>
        <Text className="mb-6 max-w-xs text-center text-neutral-500">Pick up your streak where you left off.</Text>
      </View>

      <Button
        testID="google-button"
        onPress={onGoogle}
        className="h-12 flex-row gap-2 rounded-full border border-neutral-300 bg-transparent dark:border-neutral-700"
      >
        <GoogleIcon size={18} />
        <Text className="text-base font-semibold text-foreground">Continue with Google</Text>
      </Button>

      <Divider />
      {emailField}
      <ErrorText error={error} />
      <Button testID="continue-button" label="Continue" onPress={onContinue} className="mt-2 h-12 rounded-full bg-primary-500" textClassName="text-white" />

      <View className="mt-4 flex-row justify-center">
        <Text className="text-neutral-500">Prefer a password? </Text>
        <Link href="/register" className="font-semibold text-primary-500">Create an account</Link>
      </View>
    </View>
  );
}

function MethodStep({ passwordField, emailLabel, busy, error, unverified, onBack, onSignIn, onMagicLink, onResendVerification }: {
  passwordField: ReactNode;
  emailLabel: string;
  busy: boolean;
  error: string | null;
  unverified: boolean;
  onBack: () => void;
  onSignIn: () => void;
  onMagicLink: () => void;
  onResendVerification: () => void;
}) {
  return (
    <View className="flex-1 justify-center p-4">
      <Button label={`‹  ${emailLabel}`} onPress={onBack} className="mb-4 self-start bg-transparent px-0" textClassName="text-neutral-500" />
      <Text className="pb-6 text-center text-3xl font-extrabold">Welcome back</Text>

      {passwordField}
      <Button label="Forgot password?" onPress={onMagicLink} className="-mt-1 self-end bg-transparent px-0" textClassName="text-sm text-primary-500" />
      <ErrorText error={error} />
      {unverified ? <Button label="Resend verification email" onPress={onResendVerification} className="bg-transparent" textClassName="text-primary-500" /> : null}
      <Button testID="login-button" label="Sign in" loading={busy} onPress={onSignIn} className="mt-1 h-12 rounded-full bg-primary-500" textClassName="text-white" />

      <Divider />
      <Button label="Email me a login link" onPress={onMagicLink} className="h-12 rounded-full border border-neutral-300 bg-transparent dark:border-neutral-700" textClassName="text-primary-500" />
    </View>
  );
}

function SentStep({ emailLabel, info, cooldown, onResend, onUseDifferent }: {
  emailLabel: string;
  info: string | null;
  cooldown: number;
  onResend: () => void;
  onUseDifferent: () => void;
}) {
  return (
    <View className="flex-1 items-center justify-center p-4">
      <Text className="pb-3 text-center text-3xl font-extrabold">Check your email</Text>
      <Text className="mb-6 max-w-xs text-center text-neutral-500">
        We sent a login link to
        {' '}
        <Text className="font-semibold">{emailLabel}</Text>
        . Tap it to sign in — it expires in 15 minutes.
      </Text>
      {info ? <Text className="mb-3 text-center text-sm text-primary-500">{info}</Text> : null}
      <Button label={cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend email'} disabled={cooldown > 0} onPress={onResend} className="bg-transparent" textClassName="text-primary-500" />
      <Button label="Use a different email" onPress={onUseDifferent} className="bg-transparent" textClassName="text-neutral-500" />
    </View>
  );
}

export function LoginForm({ onResendVerification, ...rest }: LoginFormProps) {
  const s = useLoginForm(rest);

  const emailField = (
    <s.form.Field
      name="email"
      children={field => (
        <Input
          testID="email-input"
          label="Email"
          placeholder="you@example.com"
          autoCapitalize="none"
          keyboardType="email-address"
          value={field.state.value}
          onBlur={field.handleBlur}
          onChangeText={field.handleChange}
        />
      )}
    />
  );

  const passwordField = (
    <s.form.Field
      name="password"
      children={field => (
        <Input
          testID="password-input"
          label="Password"
          placeholder="***"
          secureTextEntry
          value={field.state.value}
          onBlur={field.handleBlur}
          onChangeText={field.handleChange}
        />
      )}
    />
  );

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding" keyboardVerticalOffset={10}>
      {s.step === 'sent'
        ? <SentStep emailLabel={s.email()} info={s.info} cooldown={s.cooldown} onResend={s.resend} onUseDifferent={s.goIdentifier} />
        : s.step === 'method'
          ? (
              <MethodStep
                passwordField={passwordField}
                emailLabel={s.email()}
                busy={s.busy}
                error={s.error}
                unverified={s.unverified}
                onBack={s.goIdentifier}
                onSignIn={s.submitPassword}
                onMagicLink={s.sendLink}
                onResendVerification={() => onResendVerification(s.email())}
              />
            )
          : <IdentifierStep emailField={emailField} error={s.error} onGoogle={s.onGooglePress} onContinue={s.continueWithEmail} />}
    </KeyboardAvoidingView>
  );
}
