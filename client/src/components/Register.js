import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Container, Paper, TextField, Button, Typography, Box, Alert,
  IconButton, InputAdornment
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  AccountCircle as AccountIcon,
  Lock as LockIcon,
  AccountBalanceWallet as WalletIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }
    try {
      setError('');
      setLoading(true);
      await register(email, password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0B0F19', padding: 2 }}>
      <Container sx={{ width: '100%', maxWidth: 420, p: 0 }}>
        <Paper elevation={24} sx={{ borderRadius: 4, background: '#131A2A', border: '1px solid rgba(255, 255, 255, 0.05)', boxShadow: '0 20px 40px rgba(0,0,0,0.4)', overflow: 'hidden' }}>
          
          <Box sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
            <Box sx={{ p: 1.5, mb: 2, borderRadius: 3, background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 16px rgba(59, 130, 246, 0.2)' }}>
              <WalletIcon sx={{ color: '#fff', fontSize: '2rem' }} />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#F8FAFC', letterSpacing: '-0.02em', textAlign: 'center' }}>Create Kaay Wallet</Typography>
            <Typography variant="body2" sx={{ color: '#94A3B8', mt: 0.5 }}>Join the crypto revolution</Typography>
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
                sx={{ mb: 2, '& .MuiOutlinedInput-root': { color: '#F8FAFC', fieldset: { borderColor: 'rgba(255,255,255,0.1)' }, '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.2)' } }, '& .MuiInputLabel-root': { color: '#94A3B8' } }} 
                InputProps={{ 
                  startAdornment: <InputAdornment position="start"><LockIcon sx={{ color: '#64748B' }} /></InputAdornment>,
                  endAdornment: <InputAdornment position="end"><IconButton onClick={() => setShowPassword(!showPassword)} sx={{ color: '#64748B' }}>{showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}</IconButton></InputAdornment> 
                }} 
              />
              <TextField 
                fullWidth label="Confirm Password" type={showConfirmPassword ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required margin="normal" variant="outlined" 
                sx={{ mb: 3, '& .MuiOutlinedInput-root': { color: '#F8FAFC', fieldset: { borderColor: 'rgba(255,255,255,0.1)' }, '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.2)' } }, '& .MuiInputLabel-root': { color: '#94A3B8' } }} 
                InputProps={{ 
                  startAdornment: <InputAdornment position="start"><LockIcon sx={{ color: '#64748B' }} /></InputAdornment>,
                  endAdornment: <InputAdornment position="end"><IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} sx={{ color: '#64748B' }}>{showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}</IconButton></InputAdornment> 
                }} 
              />
              
              <Button fullWidth variant="contained" type="submit" disabled={loading} sx={{ borderRadius: 3, py: 1.5, background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)', fontWeight: 600, textTransform: 'none', fontSize: '1rem', boxShadow: '0 4px 14px rgba(59, 130, 246, 0.3)' }}>
                {loading ? 'Creating...' : 'Create Account'}
              </Button>
            </form>

            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Typography variant="body2" sx={{ color: '#94A3B8' }}>
                Already have an account?{' '}
                <Link to="/login" style={{ color: '#3B82F6', textDecoration: 'none', fontWeight: 600 }}>Login</Link>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}

export default Register; 