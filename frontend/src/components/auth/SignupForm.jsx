import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Box,
  Button,
  TextField,
  Typography,
  Container,
  Alert,
  CircularProgress,
  styled
} from '@mui/material';
import { registerUser } from '../../utils/auth';
import { useApp } from '../../context/AppContext';
import { useRouter } from 'next/router';

// Using your existing theme styling patterns
const StyledContainer = styled(Container)(({ theme }) => ({
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  padding: theme.spacing(3),
}));

const SignupCard = styled(Box)(({ theme }) => ({
  background: 'rgba(0, 0, 0, 0.8)',
  backdropFilter: 'blur(20px)',
  borderRadius: '20px',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  padding: theme.spacing(4),
  width: '100%',
  maxWidth: '400px',
  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  '& .MuiOutlinedInput-root': {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    '& fieldset': {
      borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    '&:hover fieldset': {
      borderColor: 'rgba(255, 255, 255, 0.5)',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#667eea',
    },
    '& input': {
      color: 'white',
    },
  },
  '& .MuiInputLabel-root': {
    color: 'rgba(255, 255, 255, 0.7)',
    '&.Mui-focused': {
      color: '#667eea',
    },
  },
}));

const StyledButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
  border: 0,
  borderRadius: '12px',
  boxShadow: '0 3px 5px 2px rgba(102, 126, 234, .3)',
  color: 'white',
  height: 48,
  padding: '0 30px',
  marginTop: theme.spacing(2),
  '&:hover': {
    background: 'linear-gradient(45deg, #5a67d8 30%, #6b46c1 90%)',
    boxShadow: '0 6px 10px 2px rgba(102, 126, 234, .3)',
  },
  '&:disabled': {
    background: 'rgba(255, 255, 255, 0.3)',
    color: 'rgba(255, 255, 255, 0.5)',
  },
}));

const SignupForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { actions } = useApp();
  const router = useRouter();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError(''); // Clear error when user types
  };

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }
    if (!formData.email.includes('@')) {
      setError('Please enter a valid email address');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    setError('');

    try {
      const result = await registerUser(
        formData.name,
        formData.username,
        formData.email,
        formData.password
      );
      
      if (result.success && result.user) {
        // Update app context
        actions.setUserData(result.user);
        actions.setAuthenticated(true);
        actions.showNotification(`Welcome to MeetEase, ${result.user.name}!`, 'success');

        // Always redirect to homepage after successful registration
        router.push('/');
      } else {
        setError(result.message || 'Registration failed. Please try again.');
      }
      
    } catch (error) {
      setError('Unable to connect to server. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <StyledContainer maxWidth={false}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <SignupCard>
          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            sx={{
              color: 'white',
              textAlign: 'center',
              fontWeight: 700,
              marginBottom: 3,
            }}
          >
            Create Account
          </Typography>
          
          <Typography
            variant="body1"
            sx={{
              color: 'rgba(255, 255, 255, 0.7)',
              textAlign: 'center',
              marginBottom: 3,
            }}
          >
            Join MeetEase to start hosting meetings
          </Typography>

          {error && (
            <Alert 
              severity="error" 
              sx={{ 
                marginBottom: 2,
                backgroundColor: 'rgba(211, 47, 47, 0.1)',
                color: '#ff6b6b',
                border: '1px solid rgba(211, 47, 47, 0.3)',
                '& .MuiAlert-icon': {
                  color: '#ff6b6b',
                },
              }}
            >
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <StyledTextField
              fullWidth
              label="Full Name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              required
              disabled={isLoading}
            />

            <StyledTextField
              fullWidth
              label="Username"
              name="username"
              type="text"
              value={formData.username}
              onChange={handleChange}
              required
              disabled={isLoading}
            />

            <StyledTextField
              fullWidth
              label="Email Address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={isLoading}
            />

            <StyledTextField
              fullWidth
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={isLoading}
            />

            <StyledTextField
              fullWidth
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              disabled={isLoading}
            />

            <StyledButton
              type="submit"
              fullWidth
              disabled={isLoading}
            >
              {isLoading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Create Account'
              )}
            </StyledButton>
          </form>

          <Box sx={{ textAlign: 'center', marginTop: 3 }}>
            <Typography
              variant="body2"
              sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
            >
              Already have an account?{' '}
              <Button
                onClick={() => router.push('/auth/login')}
                sx={{
                  color: '#667eea',
                  textTransform: 'none',
                  fontWeight: 600,
                  padding: 0,
                  minWidth: 'auto',
                  '&:hover': {
                    backgroundColor: 'transparent',
                    color: '#5a67d8',
                  },
                }}
              >
                Sign in here
              </Button>
            </Typography>
          </Box>
        </SignupCard>
      </motion.div>
    </StyledContainer>
  );
};

export default SignupForm;
