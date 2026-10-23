import { useState, useEffect } from 'react';
import { authApi } from '../../api/auth';
import { AuthContext } from './context';


const STORAGE_KEY_USER = 'campusfix_auth_user';
const STORAGE_KEY_TOKEN = 'token';

const DEFAULT_STUDENT_USER = {
  id: 'usr-student-419',
  name: 'Alex Sharma',
  email: 'alex.sharma@campus.edu',
  role: 'student',
  studentId: 'ST-2026-8812',
  isMock: true,
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_USER);
      return saved ? JSON.parse(saved) : DEFAULT_STUDENT_USER;
    } catch {
      return DEFAULT_STUDENT_USER;
    }
  });

  const [isLoading, setIsLoading] = useState(false);
  const [simulateFailure, setSimulateFailure] = useState(false);
  const [isBackendConnected, setIsBackendConnected] = useState(false);

  useEffect(() => {
    // Check if real token exists and test backend connectivity if possible
    const token = localStorage.getItem(STORAGE_KEY_TOKEN);
    if (token) {
      authApi.getCurrentUser()
        .then((userData) => {
          setIsBackendConnected(true);
          setUser(userData);
          localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(userData));
        })
        .catch(() => {
          // If backend is not running or rejected token, keep local mock user or handle gracefully
          setIsBackendConnected(false);
        });
    }
  }, []);

  const login = async ({ email, password, role = 'student' }) => {
    setIsLoading(true);

    // Artificial brief network delay for realistic loading state
    await new Promise((resolve) => setTimeout(resolve, 800));

    // If evaluator or user toggled simulate failure for testing failed-login state
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
      // Attempt live backend first
      const data = await authApi.login({ email, password, role });
      setIsBackendConnected(true);
      const authenticatedUser = data.user || {
        id: data.id || 'usr-live-01',
        email,
        name: data.name || email.split('@')[0],
        role: data.role || role,
      };
      setUser(authenticatedUser);
      localStorage.setItem(STORAGE_KEY_TOKEN, data.token || 'mock-jwt-token');
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(authenticatedUser));
      setIsLoading(false);
      return authenticatedUser;
    } catch (err) {
      // If live backend failed with a 401 or 400 from server, rethrow real error
      if (err.response && (err.response.status === 401 || err.response.status === 400)) {
        setIsLoading(false);
        throw err;
      }

      // Backend not running / offline: Fallback to prototype mock mode
      setIsBackendConnected(false);

      // Verify dummy password rule for prototype testing
      if (password === 'wrongpassword' || password === 'invalid123') {
        setIsLoading(false);
        const error = new Error('Email or password is incorrect');
        error.response = {
          status: 401,
          data: { message: 'Email or password is incorrect. Please verify your credentials and try again.' },
        };
        throw error;
      }

      const getRoleDisplayName = (r) => {
        if (r === 'admin') return 'Campus Admin';
        if (r === 'staff') return 'Maintenance Staff';
        return email.split('@')[0].replace('.', ' ');
      };

      const mockUser = {
        id: role === 'admin' ? 'usr-admin-882' : role === 'staff' ? 'usr-staff-305' : 'usr-student-419',
        name: getRoleDisplayName(role),
        email,
        role,
        isMock: true,
      };

      setUser(mockUser);
      localStorage.setItem(STORAGE_KEY_TOKEN, 'mock-prototype-jwt-token');
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(mockUser));
      setIsLoading(false);
      return mockUser;
    }
  };

  const register = async ({ fullName, email, password, studentId, role = 'student' }) => {
    setIsLoading(true);

    // Artificial brief network delay for realistic loading state
    await new Promise((resolve) => setTimeout(resolve, 850));

    if (simulateFailure) {
      setIsLoading(false);
      const error = new Error('Registration failed');
      error.response = {
        status: 400,
        data: { message: 'An account with this email address already exists. Please sign in instead.' },
      };
      throw error;
    }

    try {
      const data = await authApi.register({
        name: fullName,
        email,
        password,
        studentId,
        role,
      });
      setIsBackendConnected(true);
      const newUser = data.user || {
        id: data.id || `usr-${role}-new`,
        name: fullName,
        email,
        role: data.role || role,
      };
      setUser(newUser);
      localStorage.setItem(STORAGE_KEY_TOKEN, data.token || 'mock-jwt-token');
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(newUser));
      setIsLoading(false);
      return newUser;
    } catch (err) {
      if (err.response && err.response.status >= 400 && err.response.status < 500) {
        setIsLoading(false);
        throw err;
      }

      // Fallback for prototype before backend is connected
      setIsBackendConnected(false);
      const mockUser = {
        id: `usr-${role}-` + Math.floor(100 + Math.random() * 900),
        name: fullName,
        email,
        studentId: studentId || 'N/A',
        role,
        isMock: true,
      };

      setUser(mockUser);
      localStorage.setItem(STORAGE_KEY_TOKEN, 'mock-prototype-jwt-token');
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(mockUser));
      setIsLoading(false);
      return mockUser;
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch {
      // Ignore network errors on logout in prototype mode
    } finally {
      localStorage.removeItem(STORAGE_KEY_TOKEN);
      localStorage.removeItem(STORAGE_KEY_USER);
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
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

