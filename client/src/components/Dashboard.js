import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Container, Paper, Typography, Box, Button, TextField, Grid, Alert,
  CircularProgress, IconButton, Divider, Tooltip, useTheme, alpha,
  FormControl, Select, MenuItem, Tabs, Tab, Dialog, DialogTitle,
  DialogContent, DialogActions, InputAdornment
} from '@mui/material';
import {
  ContentCopy as CopyIcon, Refresh as RefreshIcon, Send as SendIcon,
  Add as AddIcon, Logout as LogoutIcon, AccountBalanceWallet as WalletIcon,
  ArrowDropDown as ArrowDropDownIcon, History as HistoryIcon,
  Visibility as VisibilityIcon, VisibilityOff as VisibilityOffIcon,
  CallMade as SentIcon, CallReceived as ReceivedIcon
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
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  
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

  useEffect(() => {
    if (user?.walletAddress) {
      fetchBalance();
      fetchTransactions();
    } else if (user && !user.walletAddress) {
      const storedMnemonic = localStorage.getItem(MNEMONIC_STORAGE_KEY);
      if (storedMnemonic) {
        try {
          const wallet = ethers.Wallet.fromPhrase(storedMnemonic);
          updatePrivateKey(wallet.privateKey);
        } catch (e) {
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
      const response = await axios.post(`${API_URL}/api/wallet/balance`, { rpcUrl: currentNetwork.rpcUrl });
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
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    if (isFetchingTransactions.current) return;
    isFetchingTransactions.current = true;
    setLoadingTransactions(true);
    try {
      setError('');
      const scanPromise = axios.post(`${API_URL}/api/wallet/scan-received`, { rpcUrl: currentNetwork.rpcUrl }).catch(() => {});
      // Wait up to 15s for the scan since we now fetch concurrently 1000 blocks
      await Promise.race([scanPromise, new Promise(res => setTimeout(res, 15000))]);
      
      const response = await axios.post(`${API_URL}/api/wallet/transactions`, { rpcUrl: currentNetwork.rpcUrl });
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
      unique.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      setTransactions(unique);
    } catch (err) {
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
      setGeneratedMnemonic(wallet.mnemonic.phrase);
      setShowMnemonicDialog(true);
      localStorage.setItem(MNEMONIC_STORAGE_KEY, wallet.mnemonic.phrase);
      updatePrivateKey(wallet.privateKey);
      await axios.post(`${API_URL}/api/wallet/user-wallet`, { walletAddress: wallet.address });
      await refreshUser();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create wallet');
    } finally {
      setLoading(false);
    }
  };

  const handleMnemonicSaved = async () => {
    setShowMnemonicDialog(false);
    setLoading(true);
    try {
      const storedMnemonic = localStorage.getItem(MNEMONIC_STORAGE_KEY);
      const wallet = ethers.Wallet.fromPhrase(storedMnemonic);
      updatePrivateKey(wallet.privateKey);
      await axios.post(`${API_URL}/api/wallet/user-wallet`, { walletAddress: wallet.address });
      await refreshUser();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save wallet address.');
    } finally {
      setLoading(false);
    }
  };

  const sendTransaction = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      if (!transactionPrivateKey || transactionPrivateKey !== privateKey) {
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
      setError(err.response?.data?.message || 'Failed to send transaction');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem(MNEMONIC_STORAGE_KEY);
    logout();
    navigate('/login');
  };

  const copyToClipboard = (text) => navigator.clipboard.writeText(text);
  const handleNetworkChange = (event) => selectNetwork(event.target.value);
  const handleTabChange = (event, newValue) => setSelectedTab(newValue);
  const truncateAddress = (address) => !address ? '' : `${address.slice(0, 6)}...${address.slice(-4)}`;
  const formatBalance = (balance) => !balance ? '0.0000' : parseFloat(balance).toFixed(4);

  const filteredTransactions = transactions.filter(tx => {
    if (selectedTab === 0) return true;
    if (selectedTab === 1) return tx.type === 'received';
    if (selectedTab === 2) return tx.type === 'sent';
    return true;
  });

  return (
    <Box sx={{ height: '100vh', maxHeight: 650, background: '#0B0F19', py: 1.5, px: 1.5, display: 'flex', justifyContent: 'center', overflow: 'hidden' }}>
      <Container sx={{ width: '100%', maxWidth: 420, p: 0, display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Paper elevation={24} sx={{ borderRadius: 3, background: '#131A2A', border: '1px solid rgba(255, 255, 255, 0.05)', boxShadow: '0 20px 40px rgba(0,0,0,0.4)', overflow: 'hidden', display: 'flex', flexDirection: 'column', flex: 1 }}>
          
          {/* Header */}
          <Box sx={{ p: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ p: 0.7, borderRadius: 1.5, background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <WalletIcon sx={{ color: '#fff', fontSize: '1rem' }} />
              </Box>
              <Box>
                <Typography sx={{ fontWeight: 700, color: '#F8FAFC', lineHeight: 1, fontSize: '1rem' }}>Kaay</Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <FormControl variant="standard">
                <Select value={currentNetwork.name} onChange={handleNetworkChange} disableUnderline sx={{ color: '#94A3B8', fontSize: '0.75rem', fontWeight: 500, '.MuiSvgIcon-root': { color: '#94A3B8', fontSize: '1rem' } }}>
                  {networks.map((network) => (
                    <MenuItem key={network.name} value={network.name} sx={{ fontSize: '0.8rem' }}>{network.name.toUpperCase()}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <IconButton size="small" onClick={handleLogout} sx={{ color: '#64748B', p: 0.5, '&:hover': { color: '#EF4444', backgroundColor: 'rgba(239, 68, 68, 0.1)' } }}>
                <LogoutIcon sx={{ fontSize: '1rem' }} />
              </IconButton>
            </Box>
          </Box>

          {error && <Alert severity="error" sx={{ m: 1, py: 0.5, backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#FCA5A5', border: '1px solid rgba(239, 68, 68, 0.2)', fontSize: '0.8rem' }}>{error}</Alert>}

          <Box sx={{ p: 1.5, display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
            {!user?.walletAddress ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography sx={{ fontWeight: 700, color: '#F8FAFC', mb: 1, fontSize: '1.2rem' }}>Welcome</Typography>
                <Typography sx={{ color: '#94A3B8', mb: 3, fontSize: '0.85rem' }}>Create a new wallet to get started</Typography>
                <Button variant="contained" fullWidth onClick={createWallet} disabled={loading} sx={{ borderRadius: 2, py: 1.2, background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)', fontWeight: 600, textTransform: 'none', fontSize: '0.9rem', mb: 1.5 }}>
                  {loading ? <CircularProgress size={20} color="inherit" /> : 'Create Wallet'}
                </Button>
                <Button variant="outlined" fullWidth onClick={() => setShowImportDialog(true)} disabled={loading} sx={{ borderRadius: 2, py: 1.2, borderColor: '#334155', color: '#F8FAFC', fontWeight: 600, textTransform: 'none', fontSize: '0.9rem' }}>
                  Import Wallet
                </Button>
              </Box>
            ) : (
              <>
                {/* Hero Balance Card */}
                <Box sx={{ textAlign: 'center', mb: 2, mt: 1, position: 'relative' }}>
                  <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.8, mb: 0.8, px: 1.5, py: 0.4, borderRadius: 4, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: nodeStatus === 'connected' ? '#10B981' : '#EF4444' }} />
                    <Typography sx={{ color: '#94A3B8', fontWeight: 500, fontSize: '0.75rem' }}>{truncateAddress(user.walletAddress)}</Typography>
                    <IconButton size="small" onClick={() => copyToClipboard(user.walletAddress)} sx={{ p: 0.2, color: '#94A3B8' }}><CopyIcon sx={{ fontSize: '0.85rem' }} /></IconButton>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'baseline', gap: 0.8 }}>
                    <Typography sx={{ fontWeight: 800, color: '#F8FAFC', letterSpacing: '-0.02em', fontSize: '2rem', lineHeight: 1 }}>
                      {loading ? <CircularProgress size={24} /> : formatBalance(balance)}
                    </Typography>
                    <Typography sx={{ color: '#3B82F6', fontWeight: 700, fontSize: '1rem' }}>{currentNetwork.currency}</Typography>
                  </Box>
                </Box>

                {/* Actions */}
                <Box sx={{ display: 'flex', gap: 1.5, mb: 2 }}>
                  <Button fullWidth variant="contained" onClick={() => setShowReceiveDialog(true)} sx={{ borderRadius: 2, py: 1, background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)', fontWeight: 600, textTransform: 'none', fontSize: '0.85rem', boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)' }}>
                    Receive
                  </Button>
                  <Button fullWidth variant="contained" onClick={() => setShowTransactionDialog(true)} sx={{ borderRadius: 2, py: 1, background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)', fontWeight: 600, textTransform: 'none', fontSize: '0.85rem', boxShadow: '0 4px 14px rgba(59, 130, 246, 0.3)' }}>
                    Send
                  </Button>
                </Box>

                {/* Security Card */}
                <Paper sx={{ mb: 1.5, p: 1.2, borderRadius: 2, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography sx={{ color: '#94A3B8', fontWeight: 500, fontSize: '0.78rem' }}>Private Key</Typography>
                    <Box>
                      <IconButton size="small" onClick={() => setShowPrivateKey(!showPrivateKey)} sx={{ color: '#64748B', p: 0.3 }}>
                        {showPrivateKey ? <VisibilityOffIcon sx={{ fontSize: '0.9rem' }} /> : <VisibilityIcon sx={{ fontSize: '0.9rem' }} />}
                      </IconButton>
                      {showPrivateKey && (
                        <IconButton size="small" onClick={() => copyToClipboard(privateKey)} sx={{ color: '#3B82F6', p: 0.3 }}>
                          <CopyIcon sx={{ fontSize: '0.9rem' }} />
                        </IconButton>
                      )}
                    </Box>
                  </Box>
                  <Typography sx={{ mt: 0.5, fontFamily: 'monospace', color: showPrivateKey ? '#F8FAFC' : '#475569', wordBreak: 'break-all', fontSize: '0.72rem' }}>
                    {showPrivateKey ? privateKey : '••••••••••••••••••••••••••••••••••••••'}
                  </Typography>
                </Paper>

                {/* Activity Tabs */}
                <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden' }}>
                  <Box sx={{ borderBottom: 1, borderColor: 'rgba(255,255,255,0.05)', mb: 1 }}>
                    <Tabs value={selectedTab} onChange={handleTabChange} sx={{ minHeight: 32, '& .MuiTab-root': { minHeight: 32, textTransform: 'none', fontWeight: 600, color: '#64748B', fontSize: '0.78rem', py: 0.5, px: 1, '&.Mui-selected': { color: '#F8FAFC' } }, '& .MuiTabs-indicator': { backgroundColor: '#3B82F6', height: 2, borderRadius: '2px 2px 0 0' } }}>
                      <Tab label="Activity" />
                      <Tab label="Received" />
                      <Tab label="Sent" />
                    </Tabs>
                  </Box>

                  <Box sx={{ flex: 1, overflowY: 'auto', pr: 0.5, '&::-webkit-scrollbar': { width: 3 }, '&::-webkit-scrollbar-thumb': { backgroundColor: '#334155', borderRadius: 2 } }}>
                    {loadingTransactions && transactions.length === 0 ? (
                      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}><CircularProgress size={20} sx={{ color: '#3B82F6' }} /></Box>
                    ) : filteredTransactions.length === 0 ? (
                      <Typography sx={{ textAlign: 'center', color: '#64748B', p: 3, fontSize: '0.8rem' }}>No transactions found</Typography>
                    ) : (
                      filteredTransactions.map((tx) => (
                        <Box key={tx.hash} sx={{ display: 'flex', alignItems: 'center', p: 1, mb: 0.8, borderRadius: 1.5, background: 'rgba(255,255,255,0.02)', transition: 'background 0.2s', '&:hover': { background: 'rgba(255,255,255,0.04)' } }}>
                          <Box sx={{ width: 32, height: 32, borderRadius: '50%', background: tx.type === 'received' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', mr: 1.2, flexShrink: 0 }}>
                            {tx.type === 'received' ? <ReceivedIcon sx={{ color: '#10B981', fontSize: '1rem' }} /> : <SentIcon sx={{ color: '#EF4444', fontSize: '1rem' }} />}
                          </Box>
                          <Box sx={{ flex: 1, overflow: 'hidden' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                              <Typography sx={{ color: '#F8FAFC', fontWeight: 600, fontSize: '0.8rem' }}>{tx.type === 'received' ? 'Received' : 'Sent'}</Typography>
                              <Box sx={{ px: 0.6, py: 0.1, borderRadius: 0.8, background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.25)' }}>
                                <Typography sx={{ color: '#3B82F6', fontSize: '0.62rem', fontWeight: 700, lineHeight: 1.4 }}>{tx.tokenSymbol || currentNetwork.currency}</Typography>
                              </Box>
                            </Box>
                            <Link href={`https://${currentNetwork.name}.etherscan.io/tx/${tx.hash}`} target="_blank" sx={{ color: '#64748B', textDecoration: 'none', fontSize: '0.7rem', '&:hover': { color: '#3B82F6' } }}>{truncateAddress(tx.hash)}</Link>
                          </Box>
                          <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
                            <Typography sx={{ color: tx.type === 'received' ? '#10B981' : '#F8FAFC', fontWeight: 700, fontSize: '0.82rem' }}>
                              {tx.type === 'received' ? '+' : '-'}{tx.value} <span style={{ fontSize: '0.68rem', fontWeight: 600, opacity: 0.8 }}>{tx.tokenSymbol || currentNetwork.currency}</span>
                            </Typography>
                            <Typography sx={{ color: '#64748B', fontSize: '0.7rem' }}>{new Date(tx.timestamp).toLocaleDateString()}</Typography>
                          </Box>
                        </Box>
                      ))
                    )}
                  </Box>
                </Box>
              </>
            )}
          </Box>
        </Paper>
      </Container>

      {/* Dialogs */}
      {/* Show Receive Dialog */}
      <Dialog open={showReceiveDialog} onClose={() => setShowReceiveDialog(false)} PaperProps={{ sx: { background: '#131A2A', borderRadius: 4, border: '1px solid rgba(255,255,255,0.05)' } }}>
        <DialogTitle sx={{ color: '#F8FAFC', fontWeight: 700 }}>Receive {currentNetwork.currency}</DialogTitle>
        <DialogContent sx={{ textAlign: 'center' }}>
          <Box sx={{ p: 2, background: '#fff', borderRadius: 2, display: 'inline-block', mb: 2 }}>
            <QRCodeSVG value={user?.walletAddress || ''} size={200} />
          </Box>
          <Box sx={{ p: 1.5, background: 'rgba(255,255,255,0.03)', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid rgba(255,255,255,0.05)' }}>
            <Typography sx={{ color: '#94A3B8', fontFamily: 'monospace', fontSize: '0.85rem' }}>{truncateAddress(user?.walletAddress)}</Typography>
            <IconButton size="small" onClick={() => copyToClipboard(user?.walletAddress)} sx={{ color: '#3B82F6' }}><CopyIcon fontSize="small" /></IconButton>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}><Button onClick={() => setShowReceiveDialog(false)} sx={{ color: '#94A3B8' }}>Close</Button></DialogActions>
      </Dialog>

      {/* Show Send Dialog */}
      <Dialog open={showTransactionDialog} onClose={() => setShowTransactionDialog(false)} PaperProps={{ sx: { background: '#131A2A', borderRadius: 4, border: '1px solid rgba(255,255,255,0.05)', minWidth: 320 } }}>
        <DialogTitle sx={{ color: '#F8FAFC', fontWeight: 700 }}>Send {currentNetwork.currency}</DialogTitle>
        <DialogContent>
          <TextField fullWidth label="Recipient Address" value={recipient} onChange={e => setRecipient(e.target.value)} margin="normal" variant="outlined" sx={{ '& .MuiOutlinedInput-root': { color: '#F8FAFC', fieldset: { borderColor: 'rgba(255,255,255,0.1)' }, '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.2)' } }, '& .MuiInputLabel-root': { color: '#94A3B8' } }} />
          <TextField fullWidth label={`Amount (${currentNetwork.currency})`} type="number" value={amount} onChange={e => setAmount(e.target.value)} margin="normal" variant="outlined" sx={{ mb: 2, '& .MuiOutlinedInput-root': { color: '#F8FAFC', fieldset: { borderColor: 'rgba(255,255,255,0.1)' } }, '& .MuiInputLabel-root': { color: '#94A3B8' } }} />
          <TextField fullWidth label="Private Key to Confirm" type={showTransactionPrivateKey ? "text" : "password"} value={transactionPrivateKey} onChange={e => setTransactionPrivateKey(e.target.value)} margin="normal" variant="outlined" sx={{ '& .MuiOutlinedInput-root': { color: '#F8FAFC', fieldset: { borderColor: 'rgba(255,255,255,0.1)' } }, '& .MuiInputLabel-root': { color: '#94A3B8' } }} InputProps={{ endAdornment: <InputAdornment position="end"><IconButton onClick={() => setShowTransactionPrivateKey(!showTransactionPrivateKey)} sx={{ color: '#64748B' }}>{showTransactionPrivateKey ? <VisibilityOffIcon /> : <VisibilityIcon />}</IconButton></InputAdornment> }} />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setShowTransactionDialog(false)} sx={{ color: '#94A3B8' }}>Cancel</Button>
          <Button onClick={sendTransaction} variant="contained" disabled={loading || !recipient || !amount || !transactionPrivateKey} sx={{ background: '#3B82F6', fontWeight: 600 }}>{loading ? <CircularProgress size={24} /> : 'Send'}</Button>
        </DialogActions>
      </Dialog>
      
      {/* Mnemonic Generation Dialog */}
      <Dialog open={showMnemonicDialog} onClose={() => {}} PaperProps={{ sx: { background: '#131A2A', borderRadius: 4, border: '1px solid rgba(255,255,255,0.05)' } }}>
        <DialogTitle sx={{ color: '#F8FAFC', fontWeight: 700 }}>Save Your Recovery Phrase</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2, background: 'rgba(245, 158, 11, 0.1)', color: '#FCD34D', border: '1px solid rgba(245, 158, 11, 0.2)' }}>Write down these 12 words in order. Never share them with anyone.</Alert>
          <Box sx={{ p: 2, background: 'rgba(255,255,255,0.02)', borderRadius: 2, border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center', fontFamily: 'monospace', color: '#F8FAFC', position: 'relative' }}>
             <IconButton size="small" onClick={() => setShowMnemonic(!showMnemonic)} sx={{ position: 'absolute', top: 4, right: 4, color: '#64748B' }}>{showMnemonic ? <VisibilityOffIcon fontSize="small"/> : <VisibilityIcon fontSize="small"/>}</IconButton>
             <Typography sx={{ mt: 2 }}>{showMnemonic ? generatedMnemonic : '•••• •••• •••• •••• •••• •••• •••• •••• •••• •••• •••• ••••'}</Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => copyToClipboard(generatedMnemonic)} sx={{ color: '#3B82F6' }}>Copy</Button>
          <Button onClick={handleMnemonicSaved} variant="contained" sx={{ background: '#3B82F6' }}>I've Saved It</Button>
        </DialogActions>
      </Dialog>

      {/* Import Wallet Dialog */}
      <Dialog open={showImportDialog} onClose={() => setShowImportDialog(false)} PaperProps={{ sx: { background: '#131A2A', borderRadius: 4, border: '1px solid rgba(255,255,255,0.05)' } }}>
        <DialogTitle sx={{ color: '#F8FAFC', fontWeight: 700 }}>Import Wallet</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: '#94A3B8', mb: 2 }}>Enter your 12-word mnemonic phrase:</Typography>
          <TextField fullWidth multiline rows={3} value={importMnemonic} onChange={e => setImportMnemonic(e.target.value)} sx={{ '& .MuiOutlinedInput-root': { color: '#F8FAFC', fieldset: { borderColor: 'rgba(255,255,255,0.1)' } } }} />
          {importError && <Typography color="error" variant="caption" sx={{ mt: 1 }}>{importError}</Typography>}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setShowImportDialog(false)} sx={{ color: '#94A3B8' }}>Cancel</Button>
          <Button onClick={async () => {
              try {
                const wallet = ethers.Wallet.fromPhrase(importMnemonic.trim());
                localStorage.setItem(MNEMONIC_STORAGE_KEY, importMnemonic.trim());
                updatePrivateKey(wallet.privateKey);
                setShowImportDialog(false);
                await axios.post(`${API_URL}/api/wallet/user-wallet`, { walletAddress: wallet.address });
                await refreshUser();
              } catch (e) {
                setImportError('Invalid mnemonic');
              }
          }} variant="contained" sx={{ background: '#3B82F6' }}>Import</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Dashboard;