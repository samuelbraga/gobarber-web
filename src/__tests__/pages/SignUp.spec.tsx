import React from 'react';
import { fireEvent, render, wait } from '@testing-library/react';
import MockAdapter from 'axios-mock-adapter';
import SingUp from '../../pages/SignUp';
import api from '../../services/api';

const mockedHistoryPush = jest.fn();
const mockedAddToast = jest.fn();
const apiMock = new MockAdapter(api);

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

describe('Sign up Page', () => {
  beforeEach(() => {
    mockedHistoryPush.mockClear();
    mockedAddToast.mockClear();
  });

  it('should be able to sign up', async () => {
    apiMock.onPost('users').replyOnce(200);
    const { getByPlaceholderText, getByText } = render(<SingUp />);

    const nameField = getByPlaceholderText('Nome');
    const emailField = getByPlaceholderText('E-mail');
    const passwordField = getByPlaceholderText('Senha');
    const buttonElement = getByText('Cadastrar');

    fireEvent.change(nameField, { target: { value: 'Foo bar' } });
    fireEvent.change(emailField, { target: { value: 'foo.bar@example.com' } });
    fireEvent.change(passwordField, { target: { value: '123456' } });

    fireEvent.click(buttonElement);

    await wait(() => {
      expect(mockedHistoryPush).toHaveBeenCalledWith('/');
      expect(mockedAddToast).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'success' }),
      );
    });
  });

  it('should not be able to sign up with invalid fields', async () => {
    const { getByPlaceholderText, getByText } = render(<SingUp />);

    const nameField = getByPlaceholderText('Nome');
    const emailField = getByPlaceholderText('E-mail');
    const passwordField = getByPlaceholderText('Senha');
    const buttonElement = getByText('Cadastrar');

    fireEvent.change(nameField, { target: { value: 'Foo bar' } });
    fireEvent.change(emailField, { target: { value: 'invalid-email' } });
    fireEvent.change(passwordField, { target: { value: '123456' } });

    fireEvent.click(buttonElement);

    await wait(() => {
      expect(mockedHistoryPush).not.toHaveBeenCalled();
    });
  });

  it('should not be able to sign up with invalid credentials', async () => {
    apiMock.onPost('users').networkErrorOnce();

    const { getByPlaceholderText, getByText } = render(<SingUp />);

    const nameField = getByPlaceholderText('Nome');
    const emailField = getByPlaceholderText('E-mail');
    const passwordField = getByPlaceholderText('Senha');
    const buttonElement = getByText('Cadastrar');

    fireEvent.change(nameField, { target: { value: 'Foo bar' } });
    fireEvent.change(emailField, { target: { value: 'foo.bar@example.com' } });
    fireEvent.change(passwordField, { target: { value: '123456' } });

    fireEvent.click(buttonElement);

    await wait(() => {
      expect(mockedHistoryPush).not.toHaveBeenCalled();
      expect(mockedAddToast).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'error' }),
      );
    });
  });
});
