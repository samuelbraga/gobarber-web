import { renderHook, act } from '@testing-library/react-hooks';
import MockAdapter from 'axios-mock-adapter';
import { AuthProvider, useAuth } from '../../hooks/auth';
import api from '../../services/api';

const apiMock = new MockAdapter(api);

describe('Auth hook', () => {
  it('should be able to sign in', async () => {
    const apiResponse = {
      user: {
        id: '123',
        name: 'Foo bar',
        email: 'foo.bar@example.com',
      },
      token: 'token',
    };

    apiMock.onPost('sessions').reply(200, apiResponse);

    const setItemSpy = jest.spyOn(Storage.prototype, 'setItem');

    const { result, waitForNextUpdate } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    result.current.signIn({
      email: 'foo.bar@example.com',
      password: '123456',
    });

    await waitForNextUpdate();

    expect(result.current.user.email).toEqual('foo.bar@example.com');
    expect(setItemSpy).toHaveBeenCalledWith(
      'GoBarber:token',
      apiResponse.token,
    );
    expect(setItemSpy).toHaveBeenCalledWith(
      'GoBarber:user',
      JSON.stringify(apiResponse.user),
    );
  });

  it('should be restore saved data from storage when auth inits', () => {
    const { user, token } = {
      user: {
        id: '123',
        name: 'Foo bar',
        email: 'foo.bar@example.com',
      },
      token: 'token',
    };

    jest.spyOn(Storage.prototype, 'getItem').mockImplementation((key) => {
      switch (key) {
        case 'GoBarber:token':
          return token;
        case 'GoBarber:user':
          return JSON.stringify(user);
        default:
          return null;
      }
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    expect(result.current.user.email).toEqual('foo.bar@example.com');
  });

  it('should be able to sign out', () => {
    const { user, token } = {
      user: {
        id: '123',
        name: 'Foo bar',
        email: 'foo.bar@example.com',
      },
      token: 'token',
    };

    jest.spyOn(Storage.prototype, 'getItem').mockImplementation((key) => {
      switch (key) {
        case 'GoBarber:token':
          return token;
        case 'GoBarber:user':
          return JSON.stringify(user);
        default:
          return null;
      }
    });

    const removeItemSpy = jest.spyOn(Storage.prototype, 'removeItem');

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    act(() => {
      result.current.signOut();
    });

    expect(removeItemSpy).toHaveBeenCalledTimes(2);
    expect(result.current.user).toBeUndefined();
  });

  it('should be able to update user data', () => {
    const setItemSpy = jest.spyOn(Storage.prototype, 'setItem');

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    const user = {
      id: '123',
      name: 'Foo bar',
      email: 'foo.bar@example.com',
      avatar_url: 'avatar',
      created_at: new Date(),
      updated_at: new Date(),
    };

    act(() => {
      result.current.updatedUser(user);
    });

    expect(setItemSpy).toBeCalledWith('GoBarber:user', JSON.stringify(user));
    expect(result.current.user).toEqual(user);
  });
});
