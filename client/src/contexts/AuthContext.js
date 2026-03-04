import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { ethers } from 'ethers';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

const PRIVATE_KEY_STORAGE_KEY = 'wallet_private_key';
const MNEMONIC_STORAGE_KEY = 'wallet_mnemonic';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [privateKey, setPrivateKey] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedPrivateKey = localStorage.getItem(PRIVATE_KEY_STORAGE_KEY);

    if (storedPrivateKey) {
      setPrivateKey(storedPrivateKey);
      console.log('AuthContext: Private Key loaded from localStorage.');
    }

    const fetchWalletInfo = async () => {
      if (token) {
        try {
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          const response = await axios.get(`${API_URL}/api/wallet/user-wallet`);
          if (response.data.walletAddress) {
            setUser(prev => prev ? { ...prev, walletAddress: response.data.walletAddress } : { walletAddress: response.data.walletAddress });
          }
        } catch (err) {
          console.error('Error fetching wallet info:', err);
        }
      }
    };

    if (token) {
      axios.get(`${API_URL}/api/auth/me`)
        .then(response => {
          console.log('Auth verification successful:', response.data);
          setUser(response.data);
          setIsAuthenticated(true);
          fetchWalletInfo();
        })
        .catch((err) => {
          console.error('Auth verification failed:', err.response?.status, err.response?.data || err.message);
          // Keep user logged in if token exists, but log the error
          // This prevents logout on network errors or temporary backend issues
          if (token) {
            console.log('Token exists but verification failed. Keeping user logged in.');
            setIsAuthenticated(true);
            setUser({ email: 'Unknown', walletAddress: null });
            fetchWalletInfo();
          } else {
            localStorage.removeItem('token');
            localStorage.removeItem(PRIVATE_KEY_STORAGE_KEY);
            localStorage.removeItem(MNEMONIC_STORAGE_KEY);
            delete axios.defaults.headers.common['Authorization'];
            setPrivateKey(null);
          }
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    try {
      console.log('Attempting login with:', { email });
      const response = await axios.post(`${API_URL}/api/auth/login`, {
        email,
        password
      });
      console.log('Login response:', response.data);
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(user);
      setIsAuthenticated(true);
      if (user?.walletAddress) {
        const storedPrivateKey = localStorage.getItem(PRIVATE_KEY_STORAGE_KEY);
        if (storedPrivateKey) {
          setPrivateKey(storedPrivateKey);
          console.log('AuthContext: Private Key set after login.');
        } else {
          const storedMnemonic = localStorage.getItem(MNEMONIC_STORAGE_KEY);
          if (storedMnemonic) {
            try {
              const wallet = ethers.Wallet.fromPhrase(storedMnemonic);
              setPrivateKey(wallet.privateKey);
              localStorage.setItem(PRIVATE_KEY_STORAGE_KEY, wallet.privateKey);
              console.log('AuthContext: Private Key derived from mnemonic after login.');
            } catch (e) {
              console.error("AuthContext: Invalid mnemonic after login", e);
              localStorage.removeItem(MNEMONIC_STORAGE_KEY);
              localStorage.removeItem(PRIVATE_KEY_STORAGE_KEY);
            }
          }
        }
      }
      // Fetch wallet info after login
      try {
        const responseWallet = await axios.get(`${API_URL}/api/wallet/user-wallet`);
        if (responseWallet.data.walletAddress) {
          setUser(prev => prev ? { ...prev, walletAddress: responseWallet.data.walletAddress } : { walletAddress: responseWallet.data.walletAddress });
        }
      } catch (err) {
        console.error('Error fetching wallet info after login:', err);
      }
      return true;
    } catch (error) {
      console.error('Login error:', error.response?.data || error.message);
      throw error.response?.data || { message: 'Failed to login' };
    }
  };

  const loginWithWallet = async (walletAddress) => {
    try {
      console.log('Attempting login with wallet address:', { walletAddress });
      const response = await axios.post(`${API_URL}/api/auth/login-with-wallet`, {
        walletAddress
      });
      console.log('Login with wallet response:', response.data);
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(user);
      setIsAuthenticated(true);
      const storedPrivateKey = localStorage.getItem(PRIVATE_KEY_STORAGE_KEY);
      if (storedPrivateKey) {
        setPrivateKey(storedPrivateKey);
        console.log('AuthContext: Private Key set after loginWithWallet.');
      }
      return true;
    } catch (error) {
      console.error('Login with wallet error:', error.response?.data || error.message);
      throw error.response?.data || { message: 'Failed to login with wallet' };
    }
  };

  const register = async (email, password) => {
    try {
      const response = await axios.post(`${API_URL}/api/auth/register`, {
        email,
        password
      });
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(user);
      setIsAuthenticated(true);
      return true;
    } catch (error) {
      throw error.response.data;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem(PRIVATE_KEY_STORAGE_KEY);
    localStorage.removeItem(MNEMONIC_STORAGE_KEY);
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    setIsAuthenticated(false);
    setPrivateKey(null);
  };

  const updatePrivateKey = (key) => {
    setPrivateKey(key);
    if (key) {
      localStorage.setItem(PRIVATE_KEY_STORAGE_KEY, key);
      console.log('AuthContext: Private Key updated externally and saved to localStorage. Key provided:', key ? 'Yes' : 'No', 'Value:', key);
    } else {
      localStorage.removeItem(PRIVATE_KEY_STORAGE_KEY);
      console.log('AuthContext: Private Key cleared externally.');
    }
  };

  const refreshUser = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        const response = await axios.get(`${API_URL}/api/auth/me`);
        setUser(response.data);
        setIsAuthenticated(true);
        const storedPrivateKey = localStorage.getItem(PRIVATE_KEY_STORAGE_KEY);
        if (storedPrivateKey) {
          setPrivateKey(storedPrivateKey);
          console.log('AuthContext: Private Key refreshed with user data.');
        }
      } catch (error) {
        console.error('Error refreshing user data:', error.response?.status, error.response?.data || error.message);
        // Keep authenticated state if token exists, but log the error
        if (token) {
          console.log('Token exists but user refresh failed. Keeping authenticated state.');
          setIsAuthenticated(true);
        } else {
          localStorage.removeItem('token');
          localStorage.removeItem(PRIVATE_KEY_STORAGE_KEY);
          localStorage.removeItem(MNEMONIC_STORAGE_KEY);
          delete axios.defaults.headers.common['Authorization'];
          setUser(null);
          setIsAuthenticated(false);
          setPrivateKey(null);
        }
      }
    }
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    loginWithWallet,
    register,
    logout,
    refreshUser,
    privateKey,
    updatePrivateKey
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}; 