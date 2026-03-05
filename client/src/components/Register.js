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
  InputAdornment
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  AccountCircle as AccountIcon,
  Lock as LockIcon
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
  const theme = useTheme();

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
                Create Your Kaay Wallet
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Join the crypto revolution
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
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Confirm Password"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        edge="end"
                        sx={{ color: '#00d4ff' }}
                      >
                        {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
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
                {loading ? 'Creating Account...' : 'Create Account'}
              </Button>
            </form>

            <Box sx={{ mt: 4, textAlign: 'center' }}>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Already have an account?{' '}
                <Link 
                  to="/login" 
                  style={{ 
                    color: '#00d4ff',
                    textDecoration: 'none',
                    fontWeight: 600,
                    transition: 'all 0.3s',
                  }}
                  onMouseEnter={(e) => e.target.style.color = '#4dd9ff'}
                  onMouseLeave={(e) => e.target.style.color = '#00d4ff'}
                >
                  Login
                </Link>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}

export default Register; 