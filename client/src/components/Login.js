import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  useTheme,
  alpha,
  IconButton,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  AccountCircle as AccountIcon,
  Lock as LockIcon,
  VpnKey as VpnKeyIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { ethers } from 'ethers';

const MNEMONIC_STORAGE_KEY = 'wallet_mnemonic';
const PRIVATE_KEY_STORAGE_KEY = 'wallet_private_key';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [importMnemonic, setImportMnemonic] = useState('');
  const [showImportDialog, setShowImportDialog] = useState(false);
  const navigate = useNavigate();
  const { login, loginWithWallet, updatePrivateKey } = useAuth();
  const theme = useTheme();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      setLoading(true);
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  const handleImportWallet = async () => {
    try {
      setError('');
      setLoading(true);

      if (!ethers.Mnemonic.isValidMnemonic(importMnemonic)) {
        setError('Invalid 12-word mnemonic phrase.');
        setLoading(false);
        return;
      }

      const wallet = ethers.Wallet.fromPhrase(importMnemonic);
      const walletAddress = wallet.address;
      const privateKey = wallet.privateKey;

      localStorage.setItem(MNEMONIC_STORAGE_KEY, importMnemonic);
      updatePrivateKey(privateKey);
      console.log('Login: Private Key set after import via AuthContext.');

      await loginWithWallet(walletAddress);
      alert('Wallet imported and logged in successfully!');
      navigate('/');

    } catch (err) {
      setError(err.message || 'Failed to import wallet');
      console.error('Import wallet error:', err);
    } finally {
      setLoading(false);
      setShowImportDialog(false);
      setImportMnemonic('');
    }
  };

  return (
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
        <Box sx={{ p: 4 }}>
          <Typography 
            variant="h4" 
            component="h1" 
            gutterBottom 
            align="center"
            sx={{ 
              fontWeight: 600,
              mb: 4
            }}
          >
            Welcome Back
          </Typography>
          
          {error && (
            <Alert 
              severity="error" 
              sx={{ 
                mb: 3,
                borderRadius: 1
              }}
            >
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              margin="normal"
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <AccountIcon color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="normal"
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 3 }}
            />
            <Button
              fullWidth
              variant="contained"
              type="submit"
              disabled={loading}
              sx={{ 
                py: 1.5,
                borderRadius: 2,
                textTransform: 'none',
                fontSize: '1.1rem'
              }}
            >
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </form>

          <Divider sx={{ my: 3 }}>OR</Divider>

          <Button
            fullWidth
            variant="outlined"
            startIcon={<VpnKeyIcon />}
            onClick={() => setShowImportDialog(true)}
            disabled={loading}
            sx={{ 
              py: 1.5,
              borderRadius: 2,
              textTransform: 'none',
              fontSize: '1.1rem'
            }}
          >
            Import Wallet with Secret Phrase
          </Button>

          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Don't have an account?{' '}
              <Link 
                to="/register" 
                style={{ 
                  color: theme.palette.primary.main,
                  textDecoration: 'none',
                  fontWeight: 500
                }}
              >
                Create Account
              </Link>
            </Typography>
          </Box>
        </Box>
      </Paper>

      <Dialog open={showImportDialog} onClose={() => setShowImportDialog(false)} PaperProps={{ style: { width: 500, maxWidth: 'none' } }}>
        <DialogTitle>Import Wallet with Secret Phrase</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            Enter your 12-word secret recovery phrase to import your existing wallet. Ensure words are separated by spaces.
          </Alert>
          <TextField
            fullWidth
            label="Secret Recovery Phrase (12 words)"
            multiline
            rows={4}
            value={importMnemonic}
            onChange={(e) => setImportMnemonic(e.target.value.toLowerCase())}
            margin="normal"
            required
            disabled={loading}
            placeholder="word1 word2 word3 word4 word5 word6 word7 word8 word9 word10 word11 word12"
          />
          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowImportDialog(false)} disabled={loading}>Cancel</Button>
          <Button onClick={handleImportWallet} variant="contained" disabled={loading}>
            {loading ? 'Importing...' : 'Import'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default Login; 