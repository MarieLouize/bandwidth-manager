import React, { createContext, useContext, useState, type ReactNode } from 'react';

// Define the shape of our authentication state
interface AuthContextType {
  isAuthenticated: boolean;
  user: { username: string } | null;
  login: (username: string) => void;
  logout: () => void;
}

// Create the context with default values
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create a provider component to wrap our app
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Check localStorage to see if user was already mocked as logged in
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('mock_auth') === 'true';
  });
  
  const [user, setUser] = useState<{ username: string } | null>(() => {
    const savedUser = localStorage.getItem('mock_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const login = (username: string) => {
    setIsAuthenticated(true);
    setUser({ username });
    localStorage.setItem('mock_auth', 'true');
    localStorage.setItem('mock_user', JSON.stringify({ username }));
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('mock_auth');
    localStorage.removeItem('mock_user');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to easily use the auth context in any component
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
