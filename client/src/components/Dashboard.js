import React, { useState, useEffect } from 'react';
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
    try {
      setError('');
      console.log('Attempting to fetch transactions...');
      const response = await axios.post(`${API_URL}/api/wallet/transactions`, {
        rpcUrl: currentNetwork.rpcUrl
      });
      console.log('Transactions fetched successfully:', response.data.transactions);
      setTransactions(response.data.transactions);
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError(err.response?.data?.message || 'Failed to fetch transaction history');
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
        rpcUrl: currentNetwork.rpcUrl
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
      <Container sx={{ py: 2, width: '100%', maxWidth: 380 }}>
        <Paper 
          elevation={0}
          sx={{ 
            borderRadius: 2,
            overflow: 'hidden',
            bgcolor: alpha(theme.palette.background.paper, 0.8),
            backdropFilter: 'blur(10px)',
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
          }}
        >
          <Box sx={{ 
            p: 2, 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <WalletIcon color="primary" />
              <Typography variant="h6">Wallet</Typography>
            </Box>
            <Tooltip title="Logout">
              <IconButton onClick={handleLogout} color="inherit">
                <LogoutIcon />
              </IconButton>
            </Tooltip>
          </Box>

          <Box sx={{ 
            p: 2, 
            bgcolor: alpha(theme.palette.primary.main, 0.1),
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            justifyContent: 'space-between'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ 
                width: 8, 
                height: 8, 
                borderRadius: '50%',
                bgcolor: nodeStatus === 'connected' ? 'success.main' : 'error.main'
              }} />
              <Typography variant="body2" color="text.secondary">
                {currentNetwork.name.charAt(0).toUpperCase() + currentNetwork.name.slice(1)} Network
                {nodeStatus === 'checking' && ' (Checking...)'}
                {nodeStatus === 'disconnected' && ' (Disconnected)'}
              </Typography>
            </Box>
            <FormControl variant="standard" sx={{ m: 1, minWidth: 120 }}>
              <Select
                value={currentNetwork.name}
                onChange={handleNetworkChange}
                displayEmpty
                inputProps={{ 'aria-label': 'Without label' }}
                IconComponent={ArrowDropDownIcon}
                sx={{
                  color: 'text.secondary',
                  '.MuiSvgIcon-root': { color: 'text.secondary' },
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
            <Alert severity="error" sx={{ mx: 2, mt: 2 }}>
              {error}
            </Alert>
          )}

          <Box sx={{ p: 3 }}>
            {!user?.walletAddress ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="h6" gutterBottom>
                  Create or Import Your Wallet
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={createWallet}
                  disabled={loading || nodeStatus === 'disconnected'}
                  sx={{ borderRadius: 2, textTransform: 'none', px: 4, mb: 2 }}
                >
                  {loading ? <CircularProgress size={24} /> : 'Create Wallet'}
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => setShowImportDialog(true)}
                  disabled={loading || nodeStatus === 'disconnected'}
                  sx={{ borderRadius: 2, textTransform: 'none', px: 4, ml: 2 }}
                >
                  Import Wallet
                </Button>
              </Box>
            ) : (
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Paper 
                    elevation={0}
                    sx={{ 
                      p: 2,
                      bgcolor: alpha(theme.palette.background.default, 0.5),
                      borderRadius: 2
                    }}
                  >
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Wallet Address
                    </Typography>
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 1,
                    }}>
                      <Typography variant="body2" sx={{ flex: 1 }}>
                        {truncateAddress(user.walletAddress)}
                      </Typography>
                      <Tooltip title="Copy Address">
                        <IconButton 
                          size="small" 
                          onClick={() => copyToClipboard(user.walletAddress)}
                        >
                          <CopyIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>

                    {/* Private Key Display */}
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
                        color="text.secondary" 
                        sx={{ flexShrink: 0, whiteSpace: 'nowrap', marginRight: 0.5 }}
                      >
                        Private Key:
                      </Typography>
                      <Typography 
                        variant="body2" 
                        sx={{ flexGrow: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                      >
                        {showPrivateKey 
                          ? (privateKey ? privateKey : 'No Private Key Available')
                          : (privateKey ? '****************************************' : 'No Private Key Available')}
                      </Typography>
                      <Tooltip title={privateKey ? (showPrivateKey ? "Hide Private Key" : "Show Private Key") : "No Private Key Available"}>
                        <span style={{ display: 'flex' }}>
                          <IconButton 
                            size="small"
                            onClick={() => { setShowPrivateKey(prev => !prev); }}
                            disabled={!privateKey}
                          >
                            <KeyIcon fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>
                      {showPrivateKey && privateKey && (
                        <Tooltip title="Copy Private Key">
                          <IconButton 
                            size="small" 
                            onClick={() => copyToClipboard(privateKey)}
                          >
                            <CopyIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                    {!privateKey && (
                      <Alert severity="info" sx={{ mt: 1 }}>
                        Your private key is not available in this environment. To restore full wallet access, please import your mnemonic phrase using the Import Wallet option above.
                      </Alert>
                    )}
                  </Paper>
                </Grid>

                {/* Balance */}
                <Grid item xs={12}>
                  <Paper 
                    elevation={0}
                    sx={{
                      p: 2,
                      bgcolor: alpha(theme.palette.background.default, 0.5),
                      borderRadius: 2
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Balance
                      </Typography>
                      <Tooltip title="Refresh Balance">
                        <IconButton 
                          size="small" 
                          onClick={fetchBalance}
                          disabled={loading || nodeStatus === 'disconnected'}
                        >
                          <RefreshIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                    <Typography variant="h4" sx={{ mt: 1 }}>
                      {loading ? <CircularProgress size={24} /> : balance !== null ? `${formatBalance(balance)} ${currentNetwork.currency}` : `0.0000 ${currentNetwork.currency}`}
                    </Typography>
                  </Paper>
                </Grid>

                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', gap: 2, mt: 2, justifyContent: 'center' }}>
                    <Button
                      variant="contained"
                      startIcon={<SendIcon />}
                      onClick={() => setSelectedTab(0)}
                      sx={{
                        borderRadius: 2,
                        textTransform: 'none',
                        flex: 1
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
                        textTransform: 'none',
                        flex: 1
                      }}
                    >
                      Receive
                    </Button>
                  </Box>
                </Grid>

                <Grid item xs={12}>
                  <Tabs 
                    value={selectedTab} 
                    onChange={handleTabChange} 
                    aria-label="wallet actions tabs"
                    variant="fullWidth"
                    sx={{
                      bgcolor: alpha(theme.palette.background.default, 0.5),
                      borderRadius: 2,
                      mb: 2
                    }}
                  >
                    <Tab label="Send" icon={<SendIcon />} iconPosition="start" />
                    <Tab label="Transactions" icon={<HistoryIcon />} iconPosition="start" />
                  </Tabs>

                  {selectedTab === 0 && (
                    <Paper 
                      elevation={0}
                      sx={{ 
                        p: 2,
                        bgcolor: alpha(theme.palette.background.default, 0.5),
                        borderRadius: 2
                      }}
                    >
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Send ETH
                      </Typography>
                      <form onSubmit={(e) => {
                        e.preventDefault();
                        setShowTransactionDialog(true);
                      }}>
                        <TextField
                          fullWidth
                          label="Recipient Address"
                          value={recipient}
                          onChange={(e) => setRecipient(e.target.value)}
                          margin="normal"
                          required
                          disabled={nodeStatus === 'disconnected'}
                          sx={{ mb: 2 }}
                        />
                        <TextField
                          fullWidth
                          label="Amount (ETH)"
                          type="number"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          margin="normal"
                          required
                          disabled={nodeStatus === 'disconnected'}
                          sx={{ mb: 2 }}
                        />
                        <Button
                          fullWidth
                          variant="contained"
                          startIcon={<SendIcon />}
                          onClick={() => setShowTransactionDialog(true)}
                          disabled={loading || nodeStatus === 'disconnected' || !recipient || !amount}
                          sx={{ 
                            borderRadius: 2,
                            textTransform: 'none',
                            py: 1
                          }}
                        >
                          {loading ? <CircularProgress size={24} /> : 'Send ETH'}
                        </Button>
                      </form>
                    </Paper>
                  )} 

                  {selectedTab === 1 && (
                    <Paper 
                      elevation={0}
                      sx={{ 
                        p: 2,
                        bgcolor: alpha(theme.palette.background.default, 0.5),
                        borderRadius: 2
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          Transaction History
                        </Typography>
                        <Tooltip title="Refresh Transactions">
                          <IconButton size="small" onClick={fetchTransactions}>
                            <RefreshIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                      {transactions.length === 0 ? (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
                          No transactions found for this account on the selected network.
                        </Typography>
                      ) : (
                        <TableContainer sx={{ maxHeight: 220, overflowX: 'auto' }}>
                          <Table size="small" sx={{ minWidth: 600 }}>
                            <TableHead>
                              <TableRow>
                                <TableCell sx={{ color: 'text.secondary', fontSize: '0.85rem', p: 1 }}>Hash</TableCell>
                                <TableCell sx={{ color: 'text.secondary', fontSize: '0.85rem', p: 1 }}>Type</TableCell>
                                <TableCell sx={{ color: 'text.secondary', fontSize: '0.85rem', p: 1 }}>Token</TableCell>
                                <TableCell sx={{ color: 'text.secondary', fontSize: '0.85rem', p: 1 }}>Value</TableCell>
                                <TableCell sx={{ color: 'text.secondary', fontSize: '0.85rem', p: 1 }}>Address</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {transactions.map((tx) => (
                                <TableRow key={tx.hash}>
                                  <TableCell sx={{ p: 1, maxWidth: 80, wordBreak: 'break-all', fontSize: '0.85rem' }}>
                                    <Link 
                                      href={`https://${currentNetwork.name}.etherscan.io/tx/${tx.hash}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      variant="body2"
                                    >
                                      {truncateAddress(tx.hash)}
                                    </Link>
                                  </TableCell>
                                  <TableCell sx={{ p: 1, fontSize: '0.85rem' }}>
                                    {tx.from.toLowerCase() === user.walletAddress.toLowerCase() ? (
                                      <Typography variant="body2" color="error.main" sx={{ fontSize: '0.85rem' }}>Out</Typography>
                                    ) : (
                                      <Typography variant="body2" color="success.main" sx={{ fontSize: '0.85rem' }}>In</Typography>
                                    )}
                                  </TableCell>
                                  <TableCell sx={{ p: 1, fontSize: '0.85rem' }}>
                                    <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                                      {tx.tokenSymbol || 'ETH'}
                                    </Typography>
                                  </TableCell>
                                  <TableCell sx={{ p: 1, fontSize: '0.85rem' }}>
                                    <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>{tx.value} {tx.tokenSymbol || currentNetwork.currency}</Typography>
                                  </TableCell>
                                  <TableCell sx={{ p: 1, maxWidth: 100, wordBreak: 'break-all', fontSize: '0.85rem' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                      <Typography variant="body2" sx={{ wordBreak: 'break-all', fontSize: '0.85rem' }}>
                                        {tx.from.toLowerCase() === user.walletAddress.toLowerCase() ? tx.to : tx.from}
                                      </Typography>
                                      <Tooltip title="Copy Address">
                                        <IconButton 
                                          size="small" 
                                          onClick={() => copyToClipboard(tx.from.toLowerCase() === user.walletAddress.toLowerCase() ? tx.to : tx.from)}
                                        >
                                          <CopyIcon fontSize="small" />
                                        </IconButton>
                                      </Tooltip>
                                    </Box>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      )}
                    </Paper>
                  )} 

                </Grid>
              </Grid>
            )}
          </Box>
        </Paper>
      </Container>

      <Dialog open={showMnemonicDialog} onClose={() => setShowMnemonicDialog(false)} PaperProps={{ style: { width: 400, maxWidth: 'none' } }}>
        <DialogTitle>Your Secret Recovery Phrase</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Write down these 12 words in the correct order and store them in a secure place. This is the **ONLY** way to recover your wallet.
          </Alert>
          <Paper 
            variant="outlined" 
            sx={{
              p: 2, 
              bgcolor: alpha(theme.palette.background.default, 0.7),
              wordBreak: 'break-all',
              fontFamily: 'monospace',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              textAlign: 'center',
              position: 'relative'
            }}
          >
            <IconButton 
              onClick={() => setShowMnemonic(!showMnemonic)} 
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                color: 'text.secondary'
              }}
            >
              {showMnemonic ? <VisibilityOffIcon /> : <VisibilityIcon />}
            </IconButton>
            {showMnemonic ? generatedMnemonic : 'Click to reveal your phrase'}
          </Paper>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            copyToClipboard(generatedMnemonic);
            alert('Mnemonic copied to clipboard!');
          }}>Copy to clipboard</Button>
          <Button onClick={handleMnemonicSaved} variant="contained">I've saved it</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={showReceiveDialog} onClose={() => setShowReceiveDialog(false)} PaperProps={{ style: { width: 400, maxWidth: 'none' } }}>
        <DialogTitle>Receive Funds</DialogTitle>
        <DialogContent sx={{ textAlign: 'center' }}>
          {user?.walletAddress ? (
            <>
              <Typography variant="body1" gutterBottom>Scan this QR code to receive {currentNetwork.currency}:</Typography>
              <Box sx={{ p: 2, bgcolor: 'white', display: 'inline-block', borderRadius: 1, my: 2 }}>
                <QRCodeSVG value={user.walletAddress} size={256} level="H" />
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ wordBreak: 'break-all' }}>
                Or copy your address:
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'center', mt: 1 }}>
                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                  {user.walletAddress}
                </Typography>
                <Tooltip title="Copy Address">
                  <IconButton size="small" onClick={() => copyToClipboard(user.walletAddress)}>
                    <CopyIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            </>
          ) : (
            <Alert severity="info">Please create a wallet first to receive funds.</Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowReceiveDialog(false)} variant="outlined">Close</Button>
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
        PaperProps={{ style: { width: 400, maxWidth: 'none' } }}
      >
        <DialogTitle>Confirm Transaction</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            Please enter your private key to confirm this transaction.
          </Alert>
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Transaction Details:
            </Typography>
            <Typography variant="body2">
              To: {recipient}
            </Typography>
            <Typography variant="body2">
              Amount: {amount} ETH
            </Typography>
          </Box>
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
                  >
                    {showTransactionPrivateKey ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => {
              setShowTransactionDialog(false);
              setTransactionPrivateKey('');
              setError('');
            }} 
            disabled={loading}
          >
            Cancel
          </Button>
          <Button 
            onClick={sendTransaction} 
            variant="contained" 
            disabled={loading || !transactionPrivateKey}
          >
            {loading ? <CircularProgress size={24} /> : 'Confirm Transaction'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={showImportDialog} onClose={() => { setShowImportDialog(false); setImportMnemonic(''); setImportError(''); }}>
        <DialogTitle>Import Wallet</DialogTitle>
        <DialogContent>
          <Typography variant="body2" gutterBottom>Enter your 12 or 24 word mnemonic phrase:</Typography>
          <TextField
            fullWidth
            multiline
            minRows={2}
            value={importMnemonic}
            onChange={e => setImportMnemonic(e.target.value)}
            placeholder="mnemonic phrase"
            margin="normal"
            error={!!importError}
            helperText={importError}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setShowImportDialog(false); setImportMnemonic(''); setImportError(''); }}>Cancel</Button>
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
          >
            Import
          </Button>
        </DialogActions>
      </Dialog>

      {user?.walletAddress && (
        <Button
          variant="outlined"
          size="small"
          sx={{ ml: 2, mb: 1 }}
          onClick={() => setShowPasswordDialog(true)}
        >
          Export Mnemonic
        </Button>
      )}

      <Dialog open={showPasswordDialog} onClose={() => { setShowPasswordDialog(false); setExportPassword(''); setPasswordError(''); }}>
        <DialogTitle>Verify Password</DialogTitle>
        <DialogContent>
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
        <DialogActions>
          <Button onClick={() => { setShowPasswordDialog(false); setExportPassword(''); setPasswordError(''); }}>Cancel</Button>
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
          >
            Verify
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={showExportDialog} onClose={() => setShowExportDialog(false)}>
        <DialogTitle>Export Mnemonic</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Never share your mnemonic phrase with anyone. Anyone with this phrase can access your wallet.
          </Alert>
          <Paper
            variant="outlined"
            sx={{
              p: 2,
              bgcolor: alpha(theme.palette.background.default, 0.7),
              wordBreak: 'break-all',
              fontFamily: 'monospace',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              textAlign: 'center',
              position: 'relative',
            }}
          >
            {localStorage.getItem(MNEMONIC_STORAGE_KEY) || 'No mnemonic found.'}
          </Paper>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              const mnemonic = localStorage.getItem(MNEMONIC_STORAGE_KEY);
              if (mnemonic) {
                navigator.clipboard.writeText(mnemonic);
                alert('Mnemonic copied to clipboard!');
              }
            }}
            variant="contained"
          >
            Copy to clipboard
          </Button>
          <Button onClick={() => setShowExportDialog(false)} variant="outlined">Close</Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}

export default Dashboard; 