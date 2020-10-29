import React from 'react';
import { fireEvent, render, wait } from '@testing-library/react';
import MockAdapter from 'axios-mock-adapter';
import Profile from '../../pages/Profile';
import api from '../../services/api';

const apiMock = new MockAdapter(api);

const mockedHistoryPush = jest.fn();
const mockedAddToast = jest.fn();
const mockedUpdated = jest.fn();

jest.mock('react-router-dom', () => {
  return {
    useHistory: () => ({
      push: mockedHistoryPush,
    }),
    Link: ({ children }: { children: React.ReactNode }) => children,
  };
});

jest.mock('../../hooks/toast', () => {
  return {
    useToast: () => ({
      addToast: mockedAddToast,
    }),
  };
});

jest.mock('../../hooks/auth', () => {
  return {
    useAuth: () => ({
      updatedUser: mockedUpdated,
      user: {
        id: '123',
        name: 'Bar Foo',
        email: 'bar.foo@example.com',
        avatar_url: 'avatar',
        created_at: new Date(),
        updated_at: new Date(),
      },
    }),
  };
});

describe('Profile page', () => {
  beforeEach(() => {
    mockedHistoryPush.mockClear();
    mockedAddToast.mockClear();
    apiMock.reset();
  });

  it('should be able to update profile', async () => {
    apiMock.onPut('profile').replyOnce(200);

    const { getByPlaceholderText, getByText } = render(<Profile />);

    const nameField = getByPlaceholderText('Nome');
    const emailField = getByPlaceholderText('E-mail');
    const passwordField = getByPlaceholderText('Senha atual');
    const newPasswordField = getByPlaceholderText('Nova senha');
    const confirmationPasswordField = getByPlaceholderText('Confirmar senha');
    const buttonElement = getByText('Confirmar mudanças');

    fireEvent.change(nameField, { target: { value: 'Foo Bar' } });
    fireEvent.change(emailField, { target: { value: 'foo.bar@example.com' } });
    fireEvent.change(passwordField, { target: { value: '123456' } });
    fireEvent.change(newPasswordField, { target: { value: '12345678' } });
    fireEvent.change(confirmationPasswordField, {
      target: { value: '12345678' },
    });

    fireEvent.click(buttonElement);

    await wait(() => {
      expect(mockedHistoryPush).toHaveBeenCalledWith('/');
      expect(mockedAddToast).toHaveBeenLastCalledWith(
        expect.objectContaining({ type: 'success' }),
      );
    });
  });

  it('should be able to update name and email profile', async () => {
    apiMock.onPut('profile').replyOnce(200);

    const { getByPlaceholderText, getByText } = render(<Profile />);

    const nameField = getByPlaceholderText('Nome');
    const emailField = getByPlaceholderText('E-mail');
    const buttonElement = getByText('Confirmar mudanças');

    fireEvent.change(nameField, { target: { value: 'Foo Bar' } });
    fireEvent.change(emailField, { target: { value: 'foo.bar@example.com' } });

    fireEvent.click(buttonElement);

    await wait(() => {
      expect(mockedHistoryPush).toHaveBeenCalledWith('/');
      expect(mockedAddToast).toHaveBeenLastCalledWith(
        expect.objectContaining({ type: 'success' }),
      );
    });
  });

  it('should not be able to update profile with invalid email', async () => {
    apiMock.onPut('profile').replyOnce(200);

    const { getByPlaceholderText, getByText } = render(<Profile />);

    const nameField = getByPlaceholderText('Nome');
    const emailField = getByPlaceholderText('E-mail');
    const passwordField = getByPlaceholderText('Senha atual');
    const newPasswordField = getByPlaceholderText('Nova senha');
    const confirmationPasswordField = getByPlaceholderText('Confirmar senha');
    const buttonElement = getByText('Confirmar mudanças');

    fireEvent.change(nameField, { target: { value: 'Foo Bar' } });
    fireEvent.change(emailField, { target: { value: 'invalid-email' } });
    fireEvent.change(passwordField, { target: { value: '123456' } });
    fireEvent.change(newPasswordField, { target: { value: '12345678' } });
    fireEvent.change(confirmationPasswordField, {
      target: { value: '12345678' },
    });

    fireEvent.click(buttonElement);

    await wait(() => {
      expect(mockedHistoryPush).not.toHaveBeenCalled();
    });
  });

  it('should not be able to update profile with invalid password confirmation', async () => {
    apiMock.onPut('profile').replyOnce(200);

    const { getByPlaceholderText, getByText } = render(<Profile />);

    const nameField = getByPlaceholderText('Nome');
    const emailField = getByPlaceholderText('E-mail');
    const passwordField = getByPlaceholderText('Senha atual');
    const newPasswordField = getByPlaceholderText('Nova senha');
    const confirmationPasswordField = getByPlaceholderText('Confirmar senha');
    const buttonElement = getByText('Confirmar mudanças');

    fireEvent.change(nameField, { target: { value: 'Foo Bar' } });
    fireEvent.change(emailField, { target: { value: 'foo.bar@example.com' } });
    fireEvent.change(passwordField, { target: { value: '123456' } });
    fireEvent.change(newPasswordField, { target: { value: '12345678' } });
    fireEvent.change(confirmationPasswordField, {
      target: { value: '1234567' },
    });

    fireEvent.click(buttonElement);

    await wait(() => {
      expect(mockedHistoryPush).not.toHaveBeenCalled();
    });
  });

  it('should not be able to update profile with invalid form', async () => {
    apiMock.onPut('profile').networkError();

    const { getByPlaceholderText, getByText } = render(<Profile />);

    const nameField = getByPlaceholderText('Nome');
    const emailField = getByPlaceholderText('E-mail');
    const buttonElement = getByText('Confirmar mudanças');

    fireEvent.change(nameField, { target: { value: 'Foo Bar' } });
    fireEvent.change(emailField, { target: { value: 'foo.bar@example.com' } });

    fireEvent.click(buttonElement);

    await wait(() => {
      expect(mockedHistoryPush).not.toHaveBeenCalled();
      expect(mockedAddToast).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'error' }),
      );
    });
  });

  it('should be able to update profile avatar', async () => {
    apiMock.onPatch('users/avatar').replyOnce(200);

    const { getByTestId } = render(<Profile />);

    const avatarField = getByTestId('avatar');

    fireEvent.change(avatarField, { target: { files: ['avatar'] } });

    await wait(() => {
      expect(mockedAddToast).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'success' }),
      );
    });
  });

  it('should not be able to update profile avatar', async () => {
    apiMock.onPatch('users/avatar').replyOnce(200);

    const { getByTestId } = render(<Profile />);

    const avatarField = getByTestId('avatar');

    fireEvent.change(avatarField, { target: { files: false } });

    await wait(() => {
      expect(mockedAddToast).not.toHaveBeenCalled();
    });
  });
});
