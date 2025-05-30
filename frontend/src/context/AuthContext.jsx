import { useState, useEffect, createContext, useCallback } from 'react';
import axios from 'axios'; // For API calls

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(null); // Stores user object { id, username, email, role, currentPackage }
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Derived from user object or token presence
  const [isAdmin, setIsAdmin] = useState(false); // Derived from user.role
  const [loadingAuth, setLoadingAuth] = useState(true); // For initial auth check

  const fetchUserData = useCallback(async (currentToken) => {
    if (currentToken) {
      try {
        const response = await axios.get('http://localhost:5000/api/auth/me', {
          headers: { 'Authorization': `Bearer ${currentToken}` },
        });
        const userData = response.data;
        setUser(userData);
        setIsAuthenticated(true);
        setIsAdmin(userData.role === 'admin');
        localStorage.setItem('token', currentToken); // Ensure token is in localStorage
        setToken(currentToken); // Ensure token state is also set
      } catch (error) {
        console.error('Failed to fetch user data or token invalid:', error);
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
        setIsAuthenticated(false);
        setIsAdmin(false);
      }
    } else {
      // No token, ensure all auth state is cleared
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
      setIsAdmin(false);
    }
    setLoadingAuth(false);
  }, []);

  useEffect(() => {
    // Initial load: Check for token and fetch user data
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      fetchUserData(storedToken);
    } else {
      setLoadingAuth(false); // No token, so not loading auth data
    }

    // Optional: Listen for storage changes (e.g., logout in another tab)
    const handleStorageChange = (event) => {
      if (event.key === 'token') {
        const newToken = event.newValue;
        if (newToken) {
          fetchUserData(newToken);
        } else {
          // Token removed from storage (logout in another tab)
          setToken(null);
          setUser(null);
          setIsAuthenticated(false);
          setIsAdmin(false);
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [fetchUserData]);

  const login = async (newToken) => {
    setLoadingAuth(true); // Start loading as we'll fetch user data
    // Store token immediately, then fetch user data
    localStorage.setItem('token', newToken);
    setToken(newToken); // Set token state immediately for responsiveness
    await fetchUserData(newToken); // This will set user, isAuthenticated, isAdmin, and stop loading
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    setIsAdmin(false);
    // setLoadingAuth(false); // Not strictly necessary here unless there's a post-logout action
  };

  // Function to refresh user data using the current token
  const refreshUserData = async () => {
    if (!token) { // Check current token from state
      console.log("refreshUserData: No token available, ensuring logout state.");
      // Ensure all auth states are cleared if no token
      setUser(null);
      setIsAuthenticated(false);
      setIsAdmin(false);
      setLoadingAuth(false); // Ensure loading is false
      return;
    }
    
    // Optional: Indicate loading if this refresh can be slow or UI should react
    // setLoadingAuth(true); // Already part of fetchUserData

    // Leverage the existing fetchUserData logic
    await fetchUserData(token); 

    // setLoadingAuth(false); // fetchUserData already handles this
  };

  return (
    <AuthContext.Provider value={{ token, user, isAuthenticated, isAdmin, loadingAuth, login, logout, refreshUserData, setUser }}>
      {/* Exposing setUser directly might be too broad, consider if only refreshUserData is needed externally */}
      {/* For this task, refreshUserData is the key. Keeping setUser for now as it was from previous step. */}
      {children}
    </AuthContext.Provider>
  );
};
