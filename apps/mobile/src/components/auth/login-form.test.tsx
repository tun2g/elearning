import * as React from 'react';

import { cleanup, screen, setup, waitFor } from '@/lib/test-utils';
import { LoginForm } from './login-form';

afterEach(cleanup);

function mockProps() {
  return {
    onPasswordLogin: jest.fn().mockResolvedValue(undefined),
    onSendMagicLink: jest.fn().mockResolvedValue(undefined),
    onResendVerification: jest.fn().mockResolvedValue(undefined),
    onGoogle: jest.fn().mockResolvedValue(undefined),
  };
}

describe('loginForm (email-first wizard)', () => {
  it('renders the identifier step', async () => {
    setup(<LoginForm {...mockProps()} />);
    expect(await screen.findByTestId('form-title')).toBeOnTheScreen();
    expect(screen.getByTestId('continue-button')).toBeOnTheScreen();
  });

  it('shows an error for an invalid email', async () => {
    const { user } = setup(<LoginForm {...mockProps()} />);
    await user.type(screen.getByTestId('email-input'), 'not-an-email');
    await user.press(screen.getByTestId('continue-button'));
    expect(await screen.findByText(/Enter a valid email/i)).toBeOnTheScreen();
  });

  it('sends a magic link as the primary method', async () => {
    const props = mockProps();
    const { user } = setup(<LoginForm {...props} />);
    await user.type(screen.getByTestId('email-input'), 'youssef@gmail.com');
    await user.press(screen.getByTestId('continue-button'));

    await user.press(await screen.findByText(/Email me a login link/i));
    await waitFor(() => {
      expect(props.onSendMagicLink).toHaveBeenCalledWith('youssef@gmail.com');
    });
  });

  it('logs in with a password shown directly on the method step', async () => {
    const props = mockProps();
    const { user } = setup(<LoginForm {...props} />);
    await user.type(screen.getByTestId('email-input'), 'youssef@gmail.com');
    await user.press(screen.getByTestId('continue-button'));

    await user.type(await screen.findByTestId('password-input'), 'password');
    await user.press(screen.getByTestId('login-button'));

    await waitFor(() => {
      expect(props.onPasswordLogin).toHaveBeenCalledWith('youssef@gmail.com', 'password');
    });
  });
});
