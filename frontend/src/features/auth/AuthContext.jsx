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
        .then((userData) => {
          setIsBackendConnected(true);
          // Extract the clean student user object from the response
          const loggedInUser = userData?.user || userData;
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

    // Artificial brief network delay for realistic loading state
    await new Promise((resolve) => setTimeout(resolve, 600));

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
      if (err.response && (err.response.status === 401 || err.response.status === 400)) {
        setIsLoading(false);
        throw err;
      }

      // 2. Fallback to prototype mock mode if backend offline
      setIsBackendConnected(false);

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

  const register = async ({ fullName, name, email, password, studentId, role = 'student' }) => {
    const studentName = fullName || name;
    setIsLoading(true);

    await new Promise((resolve) => setTimeout(resolve, 600));

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
        name: studentName,
        fullName: studentName,
        email,
        password,
        studentId,
        role,
      });
      setIsBackendConnected(true);
      const newUser = data.user || {
        id: data.id || `usr-${role}-new`,
        name: studentName,
        fullName: studentName,
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

      setIsBackendConnected(false);
      const mockUser = {
        id: `usr-${role}-` + Math.floor(100 + Math.random() * 900),
        name: studentName,
        fullName: studentName,
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
      // Ignore network errors on logout
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
