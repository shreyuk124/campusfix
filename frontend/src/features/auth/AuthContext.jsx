import { useState, useEffect } from 'react';
import { authApi } from '../../api/auth';
import { AuthContext } from './context';

const STORAGE_KEY_USER = 'campusfix_auth_user';
const STORAGE_KEY_TOKEN = 'token';

export function AuthProvider({ children }) {
  // Initialize user from local storage so session persists across reloads
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_USER);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isLoading, setIsLoading] = useState(false);
  const [simulateFailure, setSimulateFailure] = useState(false);
  const [isBackendConnected, setIsBackendConnected] = useState(false);

  // Validate existing session on app startup or mobile tab focus
  useEffect(() => {
    const token = localStorage.getItem(STORAGE_KEY_TOKEN);
    if (token) {
      authApi.getCurrentUser()
        .then((data) => {
          setIsBackendConnected(true);
          // Extract the clean student user object from the response
          const loggedInUser = data?.user || data;
          if (loggedInUser && (loggedInUser.email || loggedInUser.name)) {
            setUser(loggedInUser);
            localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(loggedInUser));
          }
        })
        .catch(() => {
          // If network is offline or server temporarily restarts, preserve existing local user
          setIsBackendConnected(false);
        });
    }
  }, []);

  const login = async ({ email, password, role = 'student' }) => {
    setIsLoading(true);

    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPassword = (password || '').trim();

    // Strict Admin Access Control:
    // Supports both admin@coeptech.ac.in and admin@coeptech.ac with password admin123
    const isAdminEmail = cleanEmail === 'admin@coeptech.ac.in' || cleanEmail === 'admin@coeptech.ac';
    if (role === 'admin' || isAdminEmail) {
      if (!isAdminEmail || cleanPassword !== 'admin123') {
        setIsLoading(false);
        const error = new Error('Invalid email or password');
        error.response = {
          status: 401,
          data: { message: 'Invalid email or password. Access to Admin requires valid administrator credentials.' },
        };
        throw error;
      }
    }

    if (simulateFailure) {
      setIsLoading(false);
      const error = new Error('Email or password is incorrect');
      error.response = {
        status: 401,
        data: { message: 'Email or password is incorrect. Please verify your credentials and try again.' },
      };
      throw error;
    }

    try {
      // 1. Attempt live backend login
      const data = await authApi.login({ email: cleanEmail, password: cleanPassword, role });
      setIsBackendConnected(true);
      const authenticatedUser = data.user || {
        id: data.id || 'usr-live-01',
        email: cleanEmail,
        name: data.name || (role === 'admin' ? 'COEP Admin' : cleanEmail.split('@')[0]),
        role: data.role || role,
      };
      setUser(authenticatedUser);
      if (data.token) {
        localStorage.setItem(STORAGE_KEY_TOKEN, data.token);
      }
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(authenticatedUser));
      setIsLoading(false);
      return authenticatedUser;
    } catch (err) {
      setIsLoading(false);
      if (err.response && (err.response.status === 401 || err.response.status === 400)) {
        throw err;
      }

      setIsBackendConnected(false);

      if (role === 'admin' || isAdminEmail) {
        if (!isAdminEmail || cleanPassword !== 'admin123') {
          const error = new Error('Invalid email or password');
          error.response = {
            status: 401,
            data: { message: 'Invalid email or password. Access to Admin requires valid administrator credentials.' },
          };
          throw error;
        }

        const adminUser = {
          id: 'usr-admin-coep',
          name: 'COEP Admin',
          email: cleanEmail,
          role: 'admin',
        };
        setUser(adminUser);
        localStorage.setItem(STORAGE_KEY_TOKEN, 'admin-live-auth-token');
        localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(adminUser));
        return adminUser;
      }

      const netErr = new Error(
        err.response?.data?.message || 'Unable to connect to live authentication service. Please check your network.'
      );
      netErr.response = err.response || {
        status: 503,
        data: { message: 'Unable to connect to live authentication service. Please try again.' },
      };
      throw netErr;
    }
  };

  /**
   * Initiate student registration -> Dispatches OTP to institutional email
   */
  const register = async ({ fullName, name, email, password, studentId, role = 'student' }) => {
    const studentName = fullName || name;
    setIsLoading(true);

    try {
      const data = await authApi.register({
        name: studentName,
        fullName: studentName,
        email: email.trim().toLowerCase(),
        password,
        studentId,
        role: 'student',
      });
      setIsBackendConnected(true);
      setIsLoading(false);
      return {
        requiresOtp: true,
        email: email.trim().toLowerCase(),
        message: data.message,
        data: data.data,
      };
    } catch (err) {
      setIsLoading(false);
      throw err;
    }
  };

  /**
   * Verify email OTP and activate student account
   */
  const verifyEmail = async ({ email, otp }) => {
    setIsLoading(true);

    try {
      const data = await authApi.verifyEmail({
        email: email.trim().toLowerCase(),
        otp: String(otp).trim(),
      });
      setIsBackendConnected(true);
      const authenticatedUser = data.user;
      setUser(authenticatedUser);
      localStorage.setItem(STORAGE_KEY_TOKEN, data.token);
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(authenticatedUser));
      setIsLoading(false);
      return authenticatedUser;
    } catch (err) {
      setIsLoading(false);
      throw err;
    }
  };

  /**
   * Resend OTP with cooldown enforcement
   */
  const resendOtp = async ({ email }) => {
    return await authApi.resendOtp({
      email: email.trim().toLowerCase(),
    });
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch {
      // Ignore network errors on logout
    } finally {
      localStorage.removeItem(STORAGE_KEY_TOKEN);
      localStorage.removeItem(STORAGE_KEY_USER);
      localStorage.removeItem('campusfix_coep_issues_v2');
      setUser(null);
    }
  };

  const toggleSimulateFailure = () => {
    setSimulateFailure((prev) => !prev);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || null,
        isAuthenticated: Boolean(user),
        isLoading,
        simulateFailure,
        toggleSimulateFailure,
        isBackendConnected,
        login,
        register,
        verifyEmail,
        resendOtp,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;
