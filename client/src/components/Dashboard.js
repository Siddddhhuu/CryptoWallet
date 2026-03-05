import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  TextField,
  Grid,
  Alert,
  CircularProgress,
  IconButton,
  Divider,
  Tooltip,
  useTheme,
  alpha,
  FormControl,
  Select,
  MenuItem,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment
} from '@mui/material';
import {
  ContentCopy as CopyIcon,
  Refresh as RefreshIcon,
  Send as SendIcon,
  Add as AddIcon,
  Logout as LogoutIcon,
  AccountBalanceWallet as WalletIcon,
  ArrowDropDown as ArrowDropDownIcon,
  History as HistoryIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Key as KeyIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useNetwork } from '../contexts/NetworkContext';
import axios from 'axios';
import { ethers } from 'ethers';
import { QRCodeSVG } from 'qrcode.react';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const MNEMONIC_STORAGE_KEY = 'wallet_mnemonic';

function Dashboard() {
  const { user, logout, refreshUser, privateKey, updatePrivateKey } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const { currentNetwork, networks, selectNetwork } = useNetwork();
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [nodeStatus, setNodeStatus] = useState('checking');
  const [transactions, setTransactions] = useState([]);
  const [selectedTab, setSelectedTab] = useState(0);
  const [generatedMnemonic, setGeneratedMnemonic] = useState('');
  const [showMnemonicDialog, setShowMnemonicDialog] = useState(false);
  const [showMnemonic, setShowMnemonic] = useState(false);
  const [showPrivateKey, setShowPrivateKey] = useState(true);
  const [showReceiveDialog, setShowReceiveDialog] = useState(false);
  const [showTransactionDialog, setShowTransactionDialog] = useState(false);
  const [transactionPrivateKey, setTransactionPrivateKey] = useState('');
  const [showTransactionPrivateKey, setShowTransactionPrivateKey] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [importMnemonic, setImportMnemonic] = useState('');
  const [importError, setImportError] = useState('');
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [exportPassword, setExportPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const isFetchingTransactions = useRef(false);
  // eslint-disable-next-line

  useEffect(() => {
    console.log('Dashboard useEffect triggered. User:', user, 'Private Key from AuthContext:', privateKey);

    if (user?.walletAddress) {
      fetchBalance();
      fetchTransactions();
    } else if (user && !user.walletAddress) {
      const storedMnemonic = localStorage.getItem(MNEMONIC_STORAGE_KEY);
      if (storedMnemonic) {
        try {
          const wallet = ethers.Wallet.fromPhrase(storedMnemonic);
          updatePrivateKey(wallet.privateKey);
          console.log('Dashboard: Private Key derived from mnemonic and updated via AuthContext.');
        } catch (e) {
          console.error("Invalid mnemonic in localStorage", e);
          localStorage.removeItem(MNEMONIC_STORAGE_KEY);
          updatePrivateKey(null);
        }
      }
    }
  }, [user, currentNetwork, privateKey, updatePrivateKey]);

  const fetchBalance = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.post(`${API_URL}/api/wallet/balance`, { 
        rpcUrl: currentNetwork.rpcUrl 
      });
      setBalance(response.data.balance);
      setNodeStatus('connected');
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        if (err.response.status === 400 && err.response.data.message === 'No wallet address found') {
          setError('No wallet address found. Please create a wallet.');
        } else if (err.response?.data?.error === 'ETHEREUM_NODE_ERROR') {
          setNodeStatus('disconnected');
          setError('Ethereum node is not available.');
        } else {
          setError(err.response?.data?.message || 'Failed to fetch balance');
        }
      } else {
        setError('An unexpected error occurred.');
        console.error('Error fetching balance:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    if (isFetchingTransactions.current) {
      console.log('fetchTransactions already running — skipping duplicate call');
      return;
    }
    isFetchingTransactions.current = true;
    setLoadingTransactions(true);
    try {
      setError('');
      console.log('Attempting to fetch transactions...');

      // Trigger a scan but don't let it block indefinitely — wait up to 2s for scan to finish
      const scanPromise = axios.post(`${API_URL}/api/wallet/scan-received`, {
        rpcUrl: currentNetwork.rpcUrl
      }).then(() => console.log('Received transactions scanned'))
        .catch(scanErr => console.warn('Warning: Could not scan received transactions:', scanErr));

      await Promise.race([scanPromise, new Promise(res => setTimeout(res, 2000))]);

      const response = await axios.post(`${API_URL}/api/wallet/transactions`, {
        rpcUrl: currentNetwork.rpcUrl
      });
      console.log('Transactions fetched successfully:', response.data.transactions);

      // Deduplicate transactions by hash (fallback to composite key)
      const transactionsRaw = response.data.transactions || [];
      const seen = new Set();
      const unique = [];
      for (const tx of transactionsRaw) {
        const key = tx.hash || `${tx.from}-${tx.to}-${tx.value}-${tx.timestamp}`;
        if (!seen.has(key)) {
          seen.add(key);
          unique.push(tx);
        }
      }

      // Sort by timestamp descending so newest show first
      unique.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      setTransactions(unique);
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError(err.response?.data?.message || 'Failed to fetch transaction history');
    } finally {
      isFetchingTransactions.current = false;
      setLoadingTransactions(false);
    }
  };

  const createWallet = async () => {
    try {
      setLoading(true);
      setError('');

      const wallet = ethers.Wallet.createRandom();
      const newMnemonic = wallet.mnemonic.phrase;
      const newAddress = wallet.address;
      const newPrivateKey = wallet.privateKey;

      console.log('Generated Mnemonic:', newMnemonic);
      console.log('Setting showMnemonicDialog to true');

      setGeneratedMnemonic(newMnemonic);
      setShowMnemonicDialog(true);

      localStorage.setItem(MNEMONIC_STORAGE_KEY, newMnemonic);
      updatePrivateKey(newPrivateKey);

      // Sync wallet address with backend
      await axios.post(`${API_URL}/api/wallet/user-wallet`, { walletAddress: newAddress });
      await refreshUser();
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        if (err.response?.data?.error === 'ETHEREUM_NODE_ERROR') {
          setNodeStatus('disconnected');
          setError('Ethereum node is not available');
        } else {
          setError(err.response?.data?.message || 'Failed to create wallet');
        }
      } else {
        setError('An unexpected error occurred during wallet creation.');
        console.error('Error creating wallet:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleMnemonicSaved = async () => {
    setShowMnemonicDialog(false);
    setLoading(true);
    try {
      const storedMnemonic = localStorage.getItem(MNEMONIC_STORAGE_KEY);
      if (!storedMnemonic) {
        throw new Error("Mnemonic not found after creation. Please try again.");
      }
      const wallet = ethers.Wallet.fromPhrase(storedMnemonic);
      const walletAddressToSend = wallet.address;

      updatePrivateKey(wallet.privateKey);

      // Sync wallet address with backend
      await axios.post(`${API_URL}/api/wallet/user-wallet`, { walletAddress: walletAddressToSend });
      await refreshUser();
    } catch (err) {
      console.error('Error saving wallet address on server:', err);
      setError(err.response?.data?.message || 'Failed to save wallet address on server.');
    } finally {
      setLoading(false);
    }
  };

  const sendTransaction = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');

      if (!transactionPrivateKey) {
        setError('Please enter your private key to confirm the transaction.');
        setLoading(false);
        return;
      }

      if (transactionPrivateKey !== privateKey) {
        setError('Invalid private key. Please try again.');
        setLoading(false);
        return;
      }

      await axios.post(`${API_URL}/api/wallet/send`, {
          to: recipient,
          amount,
          privateKey: transactionPrivateKey,
          rpcUrl: currentNetwork.rpcUrl,
          tokenSymbol: currentNetwork.currency
      });
      alert('Transaction sent successfully!');
      setRecipient('');
      setAmount('');
      setTransactionPrivateKey('');
      setShowTransactionDialog(false);
      fetchBalance();
      fetchTransactions();
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        if (err.response?.data?.error === 'ETHEREUM_NODE_ERROR') {
          setNodeStatus('disconnected');
          setError('Ethereum node is not available');
        } else {
          setError(err.response?.data?.message || 'Failed to send transaction');
        }
      } else {
        setError('An unexpected error occurred during transaction.');
        console.error('Error sending transaction:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem(MNEMONIC_STORAGE_KEY);
    logout();
    navigate('/login');
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const handleNetworkChange = (event) => {
    selectNetwork(event.target.value);
  };

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
    if (newValue === 1) {
      fetchTransactions();
    }
  };

  const truncateAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatBalance = (balance) => {
    if (!balance) return '0.0000';
    return parseFloat(balance).toFixed(4);
  };

  return (
    <React.Fragment>
      <Box
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #0a0e27 0%, #1a1f3a 50%, #2a1a4a 100%)',
          py: 3,
          px: 2
        }}
      >
        <Container sx={{ width: '100%', maxWidth: 420 }}>
          <Paper 
            elevation={0}
            sx={{ 
              borderRadius: 3,
              overflow: 'hidden',
              background: 'linear-gradient(135deg, rgba(20, 24, 41, 0.8) 0%, rgba(20, 24, 41, 0.6) 100%)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(0, 212, 255, 0.1)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
              overflow: 'hidden'
            }}
          >
            {/* Header */}
            <Box sx={{ 
              p: 3, 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              borderBottom: '1px solid rgba(0, 212, 255, 0.1)',
              background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.05) 0%, rgba(255, 0, 110, 0.02) 100%)'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{
                  p: 1,
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, #00d4ff 0%, #0099cc 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <WalletIcon sx={{ color: '#fff', fontWeight: 700 }} />
                </Box>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: '-0.01em' }}>Kaay</Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>Manage your assets</Typography>
                </Box>
              </Box>
              <Tooltip title="Logout">
                <IconButton 
                  onClick={handleLogout} 
                  color="inherit"
                  sx={{
                    color: '#ff006e',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 0, 110, 0.1)'
                    }
                  }}
                >
                  <LogoutIcon />
                </IconButton>
              </Tooltip>
            </Box>

            {/* Network Status */}
            <Box sx={{ 
              p: 2.5, 
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              justifyContent: 'space-between',
              background: 'rgba(255, 255, 255, 0.02)',
              borderBottom: '1px solid rgba(0, 212, 255, 0.1)'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1, minWidth: 0 }}>
                <Box sx={{ 
                  width: 10, 
                  height: 10, 
                  borderRadius: '50%',
                  bgcolor: nodeStatus === 'connected' ? '#00f779' : '#ff3366',
                  animation: nodeStatus === 'checking' ? 'pulse 2s infinite' : 'none',
                  '@keyframes pulse': {
                    '0%, 100%': { opacity: 1 },
                    '50%': { opacity: 0.5 }
                  }
                }} />
                <Typography variant="body2" sx={{ color: 'text.secondary', minWidth: 0 }}>
                  {currentNetwork.name.charAt(0).toUpperCase() + currentNetwork.name.slice(1)}
                  {nodeStatus === 'checking' && ' (Checking...)'}
                  {nodeStatus === 'disconnected' && ' (Disconnected)'}
                </Typography>
              </Box>
              <FormControl variant="standard" sx={{ minWidth: 100 }}>
                <Select
                  value={currentNetwork.name}
                  onChange={handleNetworkChange}
                  displayEmpty
                  inputProps={{ 'aria-label': 'Network selection' }}
                  IconComponent={ArrowDropDownIcon}
                  sx={{
                    color: '#00d4ff',
                    fontSize: '0.9rem',
                    '.MuiSvgIcon-root': { color: '#00d4ff' },
                    '&:before': { borderBottom: 'none !important' },
                    '&:after': { borderBottom: 'none !important' },
                    '&:hover:not(.Mui-disabled):before': { borderBottom: 'none !important' }
                  }}
                >
                  {networks.map((network) => (
                    <MenuItem key={network.name} value={network.name}>
                      {network.name.charAt(0).toUpperCase() + network.name.slice(1)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            {error && (
              <Alert 
                severity="error" 
                sx={{ 
                  m: 2,
                  backgroundColor: 'rgba(255, 51, 102, 0.1)',
                  borderColor: '#ff3366',
                  borderRadius: 2,
                  color: '#ff99bb'
                }}
              >
                {error}
              </Alert>
            )}

            {/* Main Content */}
            <Box sx={{ p: 3, maxHeight: 'calc(650px - 280px)', overflowY: 'auto' }}>
              {!user?.walletAddress ? (
                <Box sx={{ textAlign: 'center', py: 6 }}>
                  <Box sx={{
                    mb: 3,
                    fontSize: '3rem',
                    animation: 'float 3s ease-in-out infinite',
                    '@keyframes float': {
                      '0%, 100%': { transform: 'translateY(0px)' },
                      '50%': { transform: 'translateY(-10px)' }
                    }
                  }}>
                    📁
                  </Box>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                    Create or Import Your Wallet
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
                    Get started with crypto
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={createWallet}
                    disabled={loading || nodeStatus === 'disconnected'}
                    sx={{ 
                      borderRadius: 2, 
                      px: 4, 
                      mb: 2,
                      width: '100%',
                      fontWeight: 600
                    }}
                  >
                    {loading ? <CircularProgress size={24} /> : 'Create Wallet'}
                  </Button>
                </Box>
              ) : (
                <Grid container spacing={2.5}>
                  {/* Wallet Address Card */}
                  <Grid item xs={12}>
                    <Paper 
                      elevation={0}
                      sx={{ 
                        p: 2.5,
                        background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.1) 0%, rgba(255, 0, 110, 0.05) 100%)',
                        border: '1px solid rgba(0, 212, 255, 0.2)',
                        borderRadius: 2.5,
                        transition: 'all 0.3s',
                        '&:hover': {
                          backgroundColor: 'rgba(0, 212, 255, 0.15)',
                          boxShadow: '0 4px 20px rgba(0, 212, 255, 0.2)'
                        }
                      }}
                    >
                      <Typography variant="subtitle2" sx={{ color: 'text.secondary', fontWeight: 600, mb: 1 }}>
                        Wallet Address
                      </Typography>
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 1,
                        mb: 2
                      }}>
                        <Typography variant="body2" sx={{ flex: 1, fontFamily: 'monospace', fontSize: '0.9rem' }}>
                          {truncateAddress(user.walletAddress)}
                        </Typography>
                        <Tooltip title="Copy Address">
                          <IconButton 
                            size="small" 
                            onClick={() => copyToClipboard(user.walletAddress)}
                            sx={{
                              color: '#00d4ff',
                              '&:hover': { backgroundColor: 'rgba(0, 212, 255, 0.1)' }
                            }}
                          >
                            <CopyIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>

                      {/* Private Key Display */}
                      {privateKey && (
                        <>
                          <Divider sx={{ my: 1.5, borderColor: 'rgba(0, 212, 255, 0.1)' }} />
                          <Box sx={{
                            mt: 2,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            flexWrap: 'nowrap',
                            minWidth: 0,
                            overflow: 'hidden'
                          }}>
                            <Typography 
                              variant="subtitle2" 
                              sx={{ 
                                color: 'text.secondary', 
                                flexShrink: 0, 
                                whiteSpace: 'nowrap',
                                fontWeight: 600,
                                fontSize: '0.75rem'
                              }}
                            >
                              Private Key:
                            </Typography>
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                flexGrow: 1, 
                                minWidth: 0, 
                                overflow: 'hidden', 
                                textOverflow: 'ellipsis', 
                                whiteSpace: 'nowrap',
                                fontFamily: 'monospace',
                                fontSize: '0.85rem'
                              }}
                            >
                              {showPrivateKey 
                                ? privateKey
                                : '●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●'}
                            </Typography>
                            <Tooltip title={showPrivateKey ? "Hide Private Key" : "Show Private Key"}>
                              <IconButton 
                                size="small"
                                onClick={() => { setShowPrivateKey(prev => !prev); }}
                                sx={{
                                  color: '#00d4ff',
                                  '&:hover': { backgroundColor: 'rgba(0, 212, 255, 0.1)' }
                                }}
                              >
                                {showPrivateKey ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                              </IconButton>
                            </Tooltip>
                            {showPrivateKey && (
                              <Tooltip title="Copy Private Key">
                                <IconButton 
                                  size="small" 
                                  onClick={() => copyToClipboard(privateKey)}
                                  sx={{
                                    color: '#ff006e',
                                    '&:hover': { backgroundColor: 'rgba(255, 0, 110, 0.1)' }
                                  }}
                                >
                                  <CopyIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                          </Box>
                        </>
                      )}
                      {!privateKey && (
                        <Alert 
                          severity="info" 
                          sx={{ 
                            mt: 2,
                            backgroundColor: 'rgba(0, 212, 255, 0.1)',
                            borderColor: '#00d4ff',
                            color: '#4dd9ff',
                            fontSize: '0.85rem'
                          }}
                        >
                          Private key not available. Import your mnemonic to restore.
                        </Alert>
                      )}
                    </Paper>
                  </Grid>

                  {/* Balance Card */}
                  <Grid item xs={12}>
                    <Paper 
                      elevation={0}
                      sx={{
                        p: 2.5,
                        background: 'linear-gradient(135deg, rgba(0, 247, 121, 0.1) 0%, rgba(0, 212, 255, 0.05) 100%)',
                        border: '1px solid rgba(0, 247, 121, 0.2)',
                        borderRadius: 2.5,
                        transition: 'all 0.3s',
                        '&:hover': {
                          boxShadow: '0 4px 20px rgba(0, 247, 121, 0.2)'
                        }
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="subtitle2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                          Balance
                        </Typography>
                        <Tooltip title="Refresh Balance">
                          <IconButton 
                            size="small" 
                            onClick={fetchBalance}
                            disabled={loading || nodeStatus === 'disconnected'}
                            sx={{
                              color: '#00f779',
                              '&:hover': { backgroundColor: 'rgba(0, 247, 121, 0.1)' }
                            }}
                          >
                            <RefreshIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                      <Typography variant="h4" sx={{ mt: 1.5, fontWeight: 700, letterSpacing: '-0.02em' }}>
                        {loading ? <CircularProgress size={32} /> : balance !== null ? `${formatBalance(balance)}` : `0.0000`}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                        {currentNetwork.currency}
                      </Typography>
                    </Paper>
                  </Grid>

                  {/* Action Buttons */}
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', gap: 2, mt: 1, justifyContent: 'center' }}>
                      <Button
                        variant="contained"
                        startIcon={<SendIcon />}
                        onClick={() => setShowTransactionDialog(true)}
                        disabled={loading || nodeStatus === 'disconnected'}
                        sx={{
                          borderRadius: 2,
                          flex: 1,
                          fontWeight: 600,
                          py: 1.25
                        }}
                      >
                        Send
                      </Button>
                      <Button
                        variant="outlined"
                        startIcon={<AddIcon />}
                        onClick={() => setShowReceiveDialog(true)}
                        sx={{
                          borderRadius: 2,
                          flex: 1,
                          fontWeight: 600,
                          py: 1.25,
                          borderColor: '#ff006e',
                          color: '#ff006e',
                          '&:hover': {
                            backgroundColor: 'rgba(255, 0, 110, 0.05)',
                            borderColor: '#ff99bb'
                          }
                        }}
                      >
                        Receive
                      </Button>
                    </Box>
                  </Grid>

                  {/* Transaction history displayed on dashboard */}
                  {loadingTransactions && transactions.length === 0 && (
                    <Grid item xs={12} sx={{ mt: 2 }}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 2,
                          background: 'linear-gradient(135deg, rgba(255,255,255,0.02) 0%, rgba(255,255,255,0.01) 100%)',
                          border: '1px solid rgba(255,255,255,0.04)',
                          borderRadius: 2,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          minHeight: 120
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <CircularProgress size={28} />
                          <Typography variant="body2" sx={{ color: 'text.secondary' }}>Loading transactions...</Typography>
                        </Box>
                      </Paper>
                    </Grid>
                  )}

                  {transactions.length > 0 && (
                    <Grid item xs={12} sx={{ mt: 2 }}>
                      <Grid container spacing={2}>
                        {/* Sent Transactions */}
                        {transactions.filter(tx => tx.type === 'sent').length > 0 && (
                          <Grid item xs={12} md={6}>
                            <Paper
                              elevation={0}
                              sx={{
                                p: 2,
                                background: 'linear-gradient(135deg, rgba(255, 105, 180, 0.05) 0%, rgba(255, 105, 180, 0.02) 100%)',
                                border: '1px solid rgba(255, 105, 180, 0.2)',
                                borderRadius: 2,
                                maxHeight: 400,
                                overflowY: 'auto'
                              }}
                            >
                              <Typography variant="subtitle2" sx={{ color: '#ff69b4', mb: 2, fontWeight: 700, fontSize: '1.1rem' }}>
                                📤 Sent Transactions
                              </Typography>
                              {transactions.filter(tx => tx.type === 'sent').map((tx) => (
                                <Box
                                  key={tx.hash}
                                  sx={{
                                    mb: 1.5,
                                    p: 1.5,
                                    background: 'rgba(255, 105, 180, 0.08)',
                                    border: '1px solid rgba(255, 105, 180, 0.15)',
                                    borderRadius: 1.5,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    fontSize: '0.85rem'
                                  }}
                                >
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Box sx={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                      <Link
                                        href={`https://${currentNetwork.name}.etherscan.io/tx/${tx.hash}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        variant="body2"
                                        sx={{ color: '#ff69b4', textDecoration: 'none', fontWeight: 500 }}
                                      >
                                        {truncateAddress(tx.hash)}
                                      </Link>
                                      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.3 }}>
                                        {new Date(tx.timestamp).toLocaleString()}
                                      </Typography>
                                    </Box>
                                    <Typography sx={{ ml: 1, fontWeight: 700, color: '#ff69b4' }}>
                                      -{tx.value} {tx.tokenSymbol || currentNetwork.currency}
                                    </Typography>
                                  </Box>
                                  <Box sx={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', mt: 1, fontSize: '0.75rem', color: 'text.secondary' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                      <Typography sx={{ mr: 0.5 }}>From: <span style={{ fontFamily: 'monospace', color: '#ff69b4' }}>{truncateAddress(tx.from)}</span></Typography>
                                      <Tooltip title="Copy from address">
                                        <IconButton size="small" sx={{ color: '#ff69b4', p: 0.4 }} onClick={() => copyToClipboard(tx.from)}>
                                          <CopyIcon fontSize="small" />
                                        </IconButton>
                                      </Tooltip>
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                      <Typography sx={{ mr: 0.5 }}>To: <span style={{ fontFamily: 'monospace', color: '#ff69b4' }}>{truncateAddress(tx.to)}</span></Typography>
                                      <Tooltip title="Copy to address">
                                        <IconButton size="small" sx={{ color: '#ff69b4', p: 0.4 }} onClick={() => copyToClipboard(tx.to)}>
                                          <CopyIcon fontSize="small" />
                                        </IconButton>
                                      </Tooltip>
                                    </Box>
                                  </Box>
                                </Box>
                              ))}
                            </Paper>
                          </Grid>
                        )}

                        {/* Received Transactions */}
                        {transactions.filter(tx => tx.type === 'received').length > 0 && (
                          <Grid item xs={12} md={6}>
                            <Paper
                              elevation={0}
                              sx={{
                                p: 2,
                                background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.05) 0%, rgba(0, 212, 255, 0.02) 100%)',
                                border: '1px solid rgba(0, 212, 255, 0.2)',
                                borderRadius: 2,
                                maxHeight: 400,
                                overflowY: 'auto'
                              }}
                            >
                              <Typography variant="subtitle2" sx={{ color: '#00d4ff', mb: 2, fontWeight: 700, fontSize: '1.1rem' }}>
                                📥 Received Transactions
                              </Typography>
                              {transactions.filter(tx => tx.type === 'received').map((tx) => (
                                <Box
                                  key={tx.hash}
                                  sx={{
                                    mb: 1.5,
                                    p: 1.5,
                                    background: 'rgba(0, 212, 255, 0.08)',
                                    border: '1px solid rgba(0, 212, 255, 0.15)',
                                    borderRadius: 1.5,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    fontSize: '0.85rem'
                                  }}
                                >
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Box sx={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                      <Link
                                        href={`https://${currentNetwork.name}.etherscan.io/tx/${tx.hash}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        variant="body2"
                                        sx={{ color: '#00d4ff', textDecoration: 'none', fontWeight: 500 }}
                                      >
                                        {truncateAddress(tx.hash)}
                                      </Link>
                                      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.3 }}>
                                        {new Date(tx.timestamp).toLocaleString()}
                                      </Typography>
                                    </Box>
                                    <Typography sx={{ ml: 1, fontWeight: 700, color: '#00d4ff' }}>
                                      +{tx.value} {tx.tokenSymbol || currentNetwork.currency}
                                    </Typography>
                                  </Box>
                                  <Box sx={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', mt: 1, fontSize: '0.75rem', color: 'text.secondary' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                      <Typography sx={{ mr: 0.5 }}>From: <span style={{ fontFamily: 'monospace', color: '#00d4ff' }}>{truncateAddress(tx.from)}</span></Typography>
                                      <Tooltip title="Copy from address">
                                        <IconButton size="small" sx={{ color: '#00d4ff', p: 0.4 }} onClick={() => copyToClipboard(tx.from)}>
                                          <CopyIcon fontSize="small" />
                                        </IconButton>
                                      </Tooltip>
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                      <Typography sx={{ mr: 0.5 }}>To: <span style={{ fontFamily: 'monospace', color: '#00d4ff' }}>{truncateAddress(tx.to)}</span></Typography>
                                      <Tooltip title="Copy to address">
                                        <IconButton size="small" sx={{ color: '#00d4ff', p: 0.4 }} onClick={() => copyToClipboard(tx.to)}>
                                          <CopyIcon fontSize="small" />
                                        </IconButton>
                                      </Tooltip>
                                    </Box>
                                  </Box>
                                </Box>
                              ))}
                            </Paper>
                          </Grid>
                        )}

                        {/* Empty Received State */}
                        {transactions.filter(tx => tx.type === 'sent').length > 0 && transactions.filter(tx => tx.type === 'received').length === 0 && (
                          <Grid item xs={12} md={6}>
                            <Paper
                              elevation={0}
                              sx={{
                                p: 2,
                                background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.05) 0%, rgba(0, 212, 255, 0.02) 100%)',
                                border: '1px dashed rgba(0, 212, 255, 0.3)',
                                borderRadius: 2,
                                minHeight: 200,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                            >
                              <Box sx={{ textAlign: 'center' }}>
                                <Typography variant="subtitle2" sx={{ color: '#00d4ff', mb: 2, fontWeight: 700, fontSize: '1.1rem' }}>
                                  📥 Received Transactions
                                </Typography>
                                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                  No received transactions yet
                                </Typography>
                                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 1 }}>
                                  Share your wallet address with others to receive funds
                                </Typography>
                              </Box>
                            </Paper>
                          </Grid>
                        )}
                      </Grid>
                    </Grid>
                  )}
                </Grid>
              )}
            </Box>
          </Paper>
        </Container>
      </Box>

      {/* Dialogs */}

      <Dialog 
        open={showMnemonicDialog} 
        onClose={() => setShowMnemonicDialog(false)} 
        PaperProps={{ 
          sx: {
            background: 'linear-gradient(135deg, rgba(20, 24, 41, 0.8) 0%, rgba(20, 24, 41, 0.6) 100%)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(0, 212, 255, 0.1)',
            borderRadius: 3,
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, fontSize: '1.3rem' }}>Your Secret Recovery Phrase</DialogTitle>
        <DialogContent>
          <Alert 
            severity="warning" 
            sx={{ 
              mb: 2,
              backgroundColor: 'rgba(255, 165, 0, 0.1)',
              borderColor: '#ffa500',
              color: '#ffb84d'
            }}
          >
            Write down these 12 words in the correct order and store them in a secure place. This is the **ONLY** way to recover your wallet.
          </Alert>
          <Paper 
            elevation={0}
            sx={{
              p: 2.5, 
              background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.1) 0%, rgba(255, 0, 110, 0.05) 100%)',
              border: '1px solid rgba(0, 212, 255, 0.2)',
              wordBreak: 'break-all',
              fontFamily: 'monospace',
              fontSize: '1rem',
              fontWeight: 600,
              textAlign: 'center',
              position: 'relative',
              borderRadius: 2.5,
              minHeight: 100,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <IconButton 
              onClick={() => setShowMnemonic(!showMnemonic)} 
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                color: '#00d4ff',
                '&:hover': { backgroundColor: 'rgba(0, 212, 255, 0.1)' }
              }}
            >
              {showMnemonic ? <VisibilityOffIcon /> : <VisibilityIcon />}
            </IconButton>
            {showMnemonic ? generatedMnemonic : '●●●●● ●●●●● ●●●●● ●●●●● ●●●●● ●●●●● ●●●●● ●●●●● ●●●●● ●●●●● ●●●●● ●●●●●'}
          </Paper>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={() => {
              copyToClipboard(generatedMnemonic);
              alert('Mnemonic copied to clipboard!');
            }}
            sx={{ color: '#00d4ff' }}
          >
            Copy
          </Button>
          <Button 
            onClick={handleMnemonicSaved} 
            variant="contained"
            sx={{ fontWeight: 600 }}
          >
            I've Saved It
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog 
        open={showReceiveDialog} 
        onClose={() => setShowReceiveDialog(false)} 
        PaperProps={{ 
          sx: {
            background: 'linear-gradient(135deg, rgba(20, 24, 41, 0.8) 0%, rgba(20, 24, 41, 0.6) 100%)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(0, 212, 255, 0.1)',
            borderRadius: 3,
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, fontSize: '1.3rem' }}>Receive Funds</DialogTitle>
        <DialogContent sx={{ textAlign: 'center', py: 3 }}>
          {user?.walletAddress ? (
            <>
              <Typography variant="body1" gutterBottom sx={{ color: 'text.secondary', mb: 2 }}>
                Scan this QR code to receive {currentNetwork.currency}:
              </Typography>
              <Box sx={{ p: 2.5, bgcolor: 'white', display: 'inline-block', borderRadius: 2, my: 2, boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)' }}>
                <QRCodeSVG value={user.walletAddress} size={200} level="H" />
              </Box>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                Or copy your address:
              </Typography>
              <Box 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1, 
                  justifyContent: 'center', 
                  mt: 2,
                  p: 1.5,
                  background: 'rgba(0, 212, 255, 0.1)',
                  border: '1px solid rgba(0, 212, 255, 0.2)',
                  borderRadius: 2
                }}
              >
                <Typography 
                  variant="body2" 
                  sx={{ 
                    fontWeight: 'bold',
                    fontFamily: 'monospace',
                    color: '#00d4ff',
                    wordBreak: 'break-all'
                  }}
                >
                  {truncateAddress(user.walletAddress)}
                </Typography>
                <Tooltip title="Copy Full Address">
                  <IconButton 
                    size="small" 
                    onClick={() => copyToClipboard(user.walletAddress)}
                    sx={{
                      color: '#00d4ff',
                      '&:hover': { backgroundColor: 'rgba(0, 212, 255, 0.1)' }
                    }}
                  >
                    <CopyIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            </>
          ) : (
            <Alert 
              severity="info"
              sx={{
                backgroundColor: 'rgba(0, 212, 255, 0.1)',
                borderColor: '#00d4ff',
                color: '#4dd9ff'
              }}
            >
              Please create a wallet first to receive funds.
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={() => setShowReceiveDialog(false)} 
            variant="outlined"
            sx={{
              borderColor: '#ff006e',
              color: '#ff006e',
              '&:hover': {
                backgroundColor: 'rgba(255, 0, 110, 0.05)',
              }
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Transaction Confirmation Dialog */}
      <Dialog 
        open={showTransactionDialog} 
        onClose={() => {
          setShowTransactionDialog(false);
          setTransactionPrivateKey('');
          setError('');
        }}
        PaperProps={{ 
          sx: {
            background: 'linear-gradient(135deg, rgba(20, 24, 41, 0.8) 0%, rgba(20, 24, 41, 0.6) 100%)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(0, 212, 255, 0.1)',
            borderRadius: 3,
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, fontSize: '1.3rem' }}>Send Transaction</DialogTitle>
        <DialogContent>
          <Alert 
            severity="info" 
            sx={{ 
              mb: 2.5,
              backgroundColor: 'rgba(0, 212, 255, 0.1)',
              borderColor: '#00d4ff',
              color: '#4dd9ff'
            }}
          >
            Enter recipient address and amount to send funds
          </Alert>
          
          {/* Recipient Address Input */}
          <TextField
            fullWidth
            label="Recipient Address"
            placeholder="0x742d35Cc6634C0532925a3b844Bc9e7595f42bE2"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            margin="normal"
            required
            sx={{ mb: 2 }}
          />
          
          {/* Amount Input */}
          <TextField
            fullWidth
            label={`Amount (${currentNetwork.currency})`}
            type="number"
            placeholder="0.0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            margin="normal"
            required
            inputProps={{ step: "0.0001", min: "0" }}
            sx={{ mb: 2.5 }}
          />
          
          {/* Transaction Details Summary */}
          {recipient && amount && (
            <Box sx={{ mb: 2.5, p: 2, background: 'rgba(255, 255, 255, 0.02)', borderRadius: 2, border: '1px solid rgba(0, 212, 255, 0.1)' }}>
              <Typography variant="subtitle2" sx={{ color: '#00d4ff', fontWeight: 600, mb: 1 }}>
                Transaction Details
              </Typography>
              <Box sx={{ space: 1 }}>
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
                  To: <span style={{ fontFamily: 'monospace', color: '#00d4ff', fontWeight: 600 }}>{truncateAddress(recipient)}</span>
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Amount: <span style={{ fontFamily: 'monospace', color: '#00d4ff', fontWeight: 600 }}>{amount} {currentNetwork.currency}</span>
                </Typography>
              </Box>
            </Box>
          )}

          {/* Private Key Confirmation */}
          <Alert 
            severity="warning" 
            sx={{ 
              mb: 2,
              backgroundColor: 'rgba(255, 165, 0, 0.1)',
              borderColor: '#ffa500',
              color: '#ffb84d'
            }}
          >
            Enter your private key to confirm this transaction.
          </Alert>
          <TextField
            fullWidth
            label="Private Key"
            type={showTransactionPrivateKey ? "text" : "password"}
            value={transactionPrivateKey}
            onChange={(e) => setTransactionPrivateKey(e.target.value)}
            margin="normal"
            required
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowTransactionPrivateKey(!showTransactionPrivateKey)}
                    edge="end"
                    sx={{ color: '#00d4ff' }}
                  >
                    {showTransactionPrivateKey ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          {error && (
            <Alert 
              severity="error" 
              sx={{ 
                mt: 2,
                backgroundColor: 'rgba(255, 51, 102, 0.1)',
                borderColor: '#ff3366',
                color: '#ff99bb'
              }}
            >
              {error}
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={() => {
              setShowTransactionDialog(false);
              setTransactionPrivateKey('');
              setError('');
            }} 
            disabled={loading}
            sx={{ color: 'text.secondary' }}
          >
            Cancel
          </Button>
          <Button 
            onClick={sendTransaction} 
            variant="contained" 
            disabled={loading || !transactionPrivateKey || !recipient || !amount}
            sx={{ fontWeight: 600 }}
          >
            {loading ? <CircularProgress size={24} /> : 'Confirm & Send'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog 
        open={showImportDialog} 
        onClose={() => { setShowImportDialog(false); setImportMnemonic(''); setImportError(''); }}
        PaperProps={{ 
          sx: {
            background: 'linear-gradient(135deg, rgba(20, 24, 41, 0.8) 0%, rgba(20, 24, 41, 0.6) 100%)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(0, 212, 255, 0.1)',
            borderRadius: 3,
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, fontSize: '1.3rem' }}>Import Wallet</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
            Enter your 12 or 24 word mnemonic phrase to import your wallet:
          </Typography>
          <TextField
            fullWidth
            multiline
            minRows={3}
            value={importMnemonic}
            onChange={e => setImportMnemonic(e.target.value)}
            placeholder="word1 word2 word3 ... word12"
            margin="normal"
            error={!!importError}
            helperText={importError}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={() => { setShowImportDialog(false); setImportMnemonic(''); setImportError(''); }}
            sx={{ color: 'text.secondary' }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={async () => {
              setImportError('');
              try {
                const wallet = ethers.Wallet.fromPhrase(importMnemonic.trim());
                localStorage.setItem(MNEMONIC_STORAGE_KEY, importMnemonic.trim());
                updatePrivateKey(wallet.privateKey);
                setShowImportDialog(false);
                setImportMnemonic('');
                setImportError('');
                // Sync wallet address with backend
                await axios.post(`${API_URL}/api/wallet/user-wallet`, { walletAddress: wallet.address });
                await refreshUser();
              } catch (e) {
                setImportError('Invalid mnemonic phrase. Please check and try again.');
              }
            }}
            sx={{ fontWeight: 600 }}
          >
            Import Wallet
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog 
        open={showPasswordDialog} 
        onClose={() => { setShowPasswordDialog(false); setExportPassword(''); setPasswordError(''); }}
        PaperProps={{ 
          sx: {
            background: 'linear-gradient(135deg, rgba(20, 24, 41, 0.8) 0%, rgba(20, 24, 41, 0.6) 100%)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(0, 212, 255, 0.1)',
            borderRadius: 3,
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, fontSize: '1.3rem' }}>Verify Password</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField
            fullWidth
            label="Enter your password"
            type="password"
            value={exportPassword}
            onChange={e => setExportPassword(e.target.value)}
            error={!!passwordError}
            helperText={passwordError}
            margin="normal"
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={() => { setShowPasswordDialog(false); setExportPassword(''); setPasswordError(''); }}
            sx={{ color: 'text.secondary' }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={async () => {
              try {
                await axios.post(
                  `${API_URL}/api/auth/verify-password`,
                  { password: exportPassword },
                  { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
                );
                setShowPasswordDialog(false);
                setExportPassword('');
                setPasswordError('');
                setShowExportDialog(true);
              } catch (err) {
                setPasswordError('Incorrect password. Please try again.');
              }
            }}
            sx={{ fontWeight: 600 }}
          >
            Verify
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog 
        open={showExportDialog} 
        onClose={() => setShowExportDialog(false)}
        PaperProps={{ 
          sx: {
            background: 'linear-gradient(135deg, rgba(20, 24, 41, 0.8) 0%, rgba(20, 24, 41, 0.6) 100%)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(0, 212, 255, 0.1)',
            borderRadius: 3,
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, fontSize: '1.3rem' }}>Export Mnemonic</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Alert 
            severity="error" 
            sx={{ 
              mb: 2.5,
              backgroundColor: 'rgba(255, 51, 102, 0.1)',
              borderColor: '#ff3366',
              color: '#ff99bb'
            }}
          >
            Never share your mnemonic phrase with anyone. Anyone with this phrase can access your wallet.
          </Alert>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.1) 0%, rgba(255, 0, 110, 0.05) 100%)',
              border: '1px solid rgba(0, 212, 255, 0.2)',
              wordBreak: 'break-all',
              fontFamily: 'monospace',
              fontSize: '0.95rem',
              fontWeight: 600,
              textAlign: 'center',
              borderRadius: 2,
              minHeight: 80,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {localStorage.getItem(MNEMONIC_STORAGE_KEY) || 'No mnemonic found.'}
          </Paper>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => {
              const mnemonic = localStorage.getItem(MNEMONIC_STORAGE_KEY);
              if (mnemonic) {
                navigator.clipboard.writeText(mnemonic);
                alert('Mnemonic copied to clipboard!');
              }
            }}
            variant="contained"
            sx={{ fontWeight: 600 }}
          >
            Copy to Clipboard
          </Button>
          <Button 
            onClick={() => setShowExportDialog(false)} 
            variant="outlined"
            sx={{
              borderColor: '#ff006e',
              color: '#ff006e',
              '&:hover': {
                backgroundColor: 'rgba(255, 0, 110, 0.05)',
              }
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}

export default Dashboard; 