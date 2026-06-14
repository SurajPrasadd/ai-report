import authReducer, { clearError, setUser } from '../store/slices/authSlice';

const initialState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

describe('authSlice', () => {
  it('should return initial state', () => {
    expect(authReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  it('should clear error', () => {
    const state = { ...initialState, error: 'Some error' };
    expect(authReducer(state, clearError()).error).toBeNull();
  });

  it('should set user', () => {
    const user = {
      id: '1', employeeId: 'EMP001', email: 'test@test.com',
      firstName: 'John', lastName: 'Smith', role: 'Developer' as const,
    };
    const newState = authReducer(initialState, setUser(user));
    expect(newState.user).toEqual(user);
  });

  it('should handle login pending', () => {
    const action = { type: 'auth/login/pending' };
    const state = authReducer(initialState, action);
    expect(state.isLoading).toBe(true);
    expect(state.error).toBeNull();
  });

  it('should handle login rejected', () => {
    const action = { type: 'auth/login/rejected', payload: 'Invalid credentials' };
    const state = authReducer(initialState, action);
    expect(state.isLoading).toBe(false);
    expect(state.error).toBe('Invalid credentials');
  });

  it('should handle login fulfilled', () => {
    const payload = {
      accessToken: 'token123',
      refreshToken: 'refresh123',
      user: { id: '1', employeeId: 'EMP001', email: 'a@b.com', firstName: 'A', lastName: 'B', role: 'Developer' as const },
    };
    const action = { type: 'auth/login/fulfilled', payload };
    const state = authReducer(initialState, action);
    expect(state.isAuthenticated).toBe(true);
    expect(state.accessToken).toBe('token123');
    expect(state.user).toEqual(payload.user);
  });
});
