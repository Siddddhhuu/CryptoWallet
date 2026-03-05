import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Container, Paper, TextField, Button, Typography, Box, Alert,
  IconButton, InputAdornment, Dialog, DialogTitle, DialogContent,
  DialogActions, Divider
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  AccountCircle as AccountIcon,
  Lock as LockIcon,
  VpnKey as VpnKeyIcon,
  AccountBalanceWallet as WalletIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { ethers } from 'ethers';

const MNEMONIC_STORAGE_KEY = 'wallet_mnemonic';

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

      await loginWithWallet(walletAddress);
      navigate('/');

    } catch (err) {
      setError(err.message || 'Failed to import wallet');
    } finally {
      setLoading(false);
      setShowImportDialog(false);
      setImportMnemonic('');
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0B0F19', padding: 2 }}>
      <Container sx={{ width: '100%', maxWidth: 420, p: 0 }}>
        <Paper elevation={24} sx={{ borderRadius: 4, background: '#131A2A', border: '1px solid rgba(255, 255, 255, 0.05)', boxShadow: '0 20px 40px rgba(0,0,0,0.4)', overflow: 'hidden' }}>
          
          {/* Header */}
          <Box sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
            <Box sx={{ p: 1.5, mb: 2, borderRadius: 3, background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 16px rgba(59, 130, 246, 0.2)' }}>
              <WalletIcon sx={{ color: '#fff', fontSize: '2rem' }} />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#F8FAFC', letterSpacing: '-0.02em' }}>Welcome Back</Typography>
            <Typography variant="body2" sx={{ color: '#94A3B8', mt: 0.5 }}>Access your crypto wallet</Typography>
          </Box>
            
          <Box sx={{ p: 4, pt: 3 }}>
            {error && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: 2, backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#FCA5A5', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <TextField 
                fullWidth label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required margin="normal" variant="outlined" 
                sx={{ mb: 2, '& .MuiOutlinedInput-root': { color: '#F8FAFC', fieldset: { borderColor: 'rgba(255,255,255,0.1)' }, '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.2)' } }, '& .MuiInputLabel-root': { color: '#94A3B8' } }} 
                InputProps={{ startAdornment: <InputAdornment position="start"><AccountIcon sx={{ color: '#64748B' }} /></InputAdornment> }} 
              />
              <TextField 
                fullWidth label="Password" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} required margin="normal" variant="outlined" 
                sx={{ mb: 3, '& .MuiOutlinedInput-root': { color: '#F8FAFC', fieldset: { borderColor: 'rgba(255,255,255,0.1)' }, '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.2)' } }, '& .MuiInputLabel-root': { color: '#94A3B8' } }} 
                InputProps={{ 
                  startAdornment: <InputAdornment position="start"><LockIcon sx={{ color: '#64748B' }} /></InputAdornment>,
                  endAdornment: <InputAdornment position="end"><IconButton onClick={() => setShowPassword(!showPassword)} sx={{ color: '#64748B' }}>{showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}</IconButton></InputAdornment> 
                }} 
              />
              
              <Button fullWidth variant="contained" type="submit" disabled={loading} sx={{ borderRadius: 3, py: 1.5, background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)', fontWeight: 600, textTransform: 'none', fontSize: '1rem', boxShadow: '0 4px 14px rgba(59, 130, 246, 0.3)' }}>
                {loading ? 'Logging in...' : 'Login'}
              </Button>
            </form>

            <Box sx={{ position: 'relative', my: 3 }}>
              <Divider sx={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                <Typography variant="body2" sx={{ color: '#64748B', px: 1 }}>OR</Typography>
              </Divider>
            </Box>

            <Button fullWidth variant="outlined" startIcon={<VpnKeyIcon />} onClick={() => setShowImportDialog(true)} disabled={loading} sx={{ borderRadius: 3, py: 1.5, borderColor: '#334155', color: '#F8FAFC', fontWeight: 600, textTransform: 'none', fontSize: '1rem', '&:hover': { borderColor: '#475569', background: 'rgba(255,255,255,0.02)' } }}>
              Import Wallet
            </Button>

            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Typography variant="body2" sx={{ color: '#94A3B8' }}>
                Don't have an account?{' '}
                <Link to="/register" style={{ color: '#3B82F6', textDecoration: 'none', fontWeight: 600 }}>Create Account</Link>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Container>

      {/* Import Wallet Dialog */}
      <Dialog open={showImportDialog} onClose={() => setShowImportDialog(false)} PaperProps={{ sx: { background: '#131A2A', borderRadius: 4, border: '1px solid rgba(255,255,255,0.05)', minWidth: 320 } }}>
        <DialogTitle sx={{ color: '#F8FAFC', fontWeight: 700 }}>Import Wallet</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: '#94A3B8', mb: 2 }}>Enter your 12-word mnemonic phrase:</Typography>
          <TextField fullWidth multiline rows={3} value={importMnemonic} onChange={e => setImportMnemonic(e.target.value.toLowerCase())} sx={{ '& .MuiOutlinedInput-root': { color: '#F8FAFC', fieldset: { borderColor: 'rgba(255,255,255,0.1)' }, '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.2)' } } }} placeholder="word1 word2..." disabled={loading} />
          {error && <Alert severity="error" sx={{ mt: 2, background: 'rgba(239, 68, 68, 0.1)', color: '#FCA5A5', border: '1px solid rgba(239, 68, 68, 0.2)' }}>{error}</Alert>}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setShowImportDialog(false)} sx={{ color: '#94A3B8' }} disabled={loading}>Cancel</Button>
          <Button onClick={handleImportWallet} variant="contained" disabled={loading} sx={{ background: '#3B82F6', fontWeight: 600 }}>{loading ? 'Importing...' : 'Import'}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Login; 