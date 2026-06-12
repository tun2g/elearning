import { useForm } from '@tanstack/react-form';

import * as React from 'react';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import * as z from 'zod';

import { Button, Input, Text, View } from '@/components/ui';
import { getFieldError } from '@/components/ui/form-utils';

const schema = z.object({
  name: z.string().optional(),
  email: z
    .string({
      message: 'Email is required',
    })
    .min(1, 'Email is required')
    .email('Invalid email format'),
  password: z
    .string({
      message: 'Password is required',
    })
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters'),
});

export type FormType = z.infer<typeof schema>;

export type LoginFormProps = {
  onSubmit?: (data: FormType) => void;
};

export function LoginForm({ onSubmit = () => {} }: LoginFormProps) {
  const form = useForm({
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },

    validators: {
      onChange: schema as any,
    },
    onSubmit: async ({ value }) => {
      onSubmit(value);
    },
  });

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior="padding"
      keyboardVerticalOffset={10}
    >
      <View className="flex-1 justify-center p-4">
        <View className="items-center justify-center">
          <Text
            testID="form-title"
            className="pb-3 text-center text-4xl font-extrabold"
          >
            Welcome back
          </Text>

          <Text className="mb-6 max-w-xs text-center text-neutral-500">
            Sign in to pick up your streak where you left off.
          </Text>
        </View>

        <form.Field
          name="name"
          children={field => (
            <Input
              testID="name"
              label="Name"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChangeText={field.handleChange}
              error={getFieldError(field)}
            />
          )}
        />

        <form.Field
          name="email"
          children={field => (
            <Input
              testID="email-input"
              label="Email"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChangeText={field.handleChange}
              error={getFieldError(field)}
            />
          )}
        />

        <form.Field
          name="password"
          children={field => (
            <Input
              testID="password-input"
              label="Password"
              placeholder="***"
              secureTextEntry={true}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChangeText={field.handleChange}
              error={getFieldError(field)}
            />
          )}
        />

        <form.Subscribe
          selector={state => [state.isSubmitting]}
          children={([isSubmitting]) => (
            <Button
              testID="login-button"
              label="Sign in"
              onPress={form.handleSubmit}
              loading={isSubmitting}
              className="mt-2 h-12 rounded-full bg-primary-500"
              textClassName="text-white"
            />
          )}
        />
      </View>
    </KeyboardAvoidingView>
  );
}
