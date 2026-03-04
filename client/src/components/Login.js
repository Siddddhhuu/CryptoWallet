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
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0a0e27 0%, #1a1f3a 50%, #2a1a4a 100%)',
        padding: 2,
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
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
          }}
        >
          <Box sx={{ p: 5 }}>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Typography 
                variant="h3" 
                component="h1" 
                sx={{ 
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #00d4ff 0%, #ff006e 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 1,
                  letterSpacing: '-0.02em'
                }}
              >
                Welcome Back
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Access your crypto wallet
              </Typography>
            </Box>
            
            {error && (
              <Alert 
                severity="error" 
                sx={{ 
                  mb: 3,
                  borderRadius: 2,
                  backgroundColor: 'rgba(255, 51, 102, 0.1)',
                  borderColor: '#ff3366',
                  color: '#ff99bb'
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
                      <AccountIcon sx={{ color: '#00d4ff', mr: 1 }} />
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
                      <LockIcon sx={{ color: '#00d4ff', mr: 1 }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        sx={{ color: '#00d4ff' }}
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
                  fontSize: '1rem',
                  fontWeight: 600,
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: '-100%',
                    width: '100%',
                    height: '100%',
                    background: 'rgba(255, 255, 255, 0.1)',
                    transition: 'left 0.3s',
                  },
                  '&:hover::before': {
                    left: '100%',
                  },
                }}
              >
                {loading ? 'Logging in...' : 'Login'}
              </Button>
            </form>

            <Box sx={{ position: 'relative', my: 3 }}>
              <Divider sx={{ backgroundColor: 'rgba(0, 212, 255, 0.1)' }}>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>OR</Typography>
              </Divider>
            </Box>

            <Button
              fullWidth
              variant="outlined"
              startIcon={<VpnKeyIcon />}
              onClick={() => setShowImportDialog(true)}
              disabled={loading}
              sx={{ 
                py: 1.5,
                borderRadius: 2,
                fontSize: '1rem',
                fontWeight: 600,
                borderColor: '#ff006e',
                color: '#ff006e',
                '&:hover': {
                  backgroundColor: 'rgba(255, 0, 110, 0.05)',
                  borderColor: '#ff99bb',
                  color: '#ff99bb',
                }
              }}
            >
              Import Wallet
            </Button>

            <Box sx={{ mt: 4, textAlign: 'center' }}>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Don't have an account?{' '}
                <Link 
                  to="/register" 
                  style={{ 
                    color: '#00d4ff',
                    textDecoration: 'none',
                    fontWeight: 600,
                    transition: 'all 0.3s',
                  }}
                  onMouseEnter={(e) => e.target.style.color = '#4dd9ff'}
                  onMouseLeave={(e) => e.target.style.color = '#00d4ff'}
                >
                  Create Account
                </Link>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Container>

      <Dialog 
        open={showImportDialog} 
        onClose={() => setShowImportDialog(false)} 
        PaperProps={{ 
          sx: {
            background: 'linear-gradient(135deg, rgba(20, 24, 41, 0.8) 0%, rgba(20, 24, 41, 0.6) 100%)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(0, 212, 255, 0.1)',
            borderRadius: 3,
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, fontSize: '1.3rem' }}>
          Import Wallet with Secret Phrase
        </DialogTitle>
        <DialogContent>
          <Alert 
            severity="info" 
            sx={{ 
              mt: 2,
              mb: 2,
              backgroundColor: 'rgba(0, 212, 255, 0.1)',
              borderColor: '#00d4ff',
              color: '#4dd9ff'
            }}
          >
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
          {error && (
            <Alert 
              severity="error" 
              sx={{ 
                mt: 2,
                backgroundColor: 'rgba(255, 51, 102, 0.1)',
                borderColor: '#ff3366',
              }}
            >
              {error}
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setShowImportDialog(false)} disabled={loading}>Cancel</Button>
          <Button onClick={handleImportWallet} variant="contained" disabled={loading}>
            {loading ? 'Importing...' : 'Import'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Login; 