import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { styled, alpha } from '@mui/material/styles';
import {
  Box,
  Container,
  Typography,
  Stack,
  Alert,
  Slide,
  Card,
  CardContent,
  Divider,
  Tabs,
  Tab,
  Button,
  Paper,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Person as PersonIcon, 
  Login as LoginIcon, 
  PersonAdd as PersonAddIcon, 
  Videocam as VideocamIcon,
  Lock as LockIcon,
  Group as GroupIcon,
} from '@mui/icons-material';
import EnhancedTextField from '../common/EnhancedTextField';
import EnhancedButton from '../common/EnhancedButton';
import BackgroundGradient from '../common/BackgroundGradient';
import BlurryBlob from '../ui/BlurryBlob';
import { useApp } from '../../context/AppContext';

const StyledBox = styled('div')(({ theme }) => ({
  alignSelf: 'center',
  width: '100%',
  minHeight: '600px',
  marginTop: theme.spacing(8),
  borderRadius: theme.shape.borderRadius,
  outline: '6px solid',
  outlineColor: alpha(theme.palette.primary.main, 0.1),
  border: '1px solid',
  borderColor: theme.palette.divider,
  boxShadow: theme.palette.mode === 'dark'
    ? '0 0 24px 12px hsla(210, 100%, 25%, 0.2)'
    : '0 0 12px 8px hsla(220, 25%, 80%, 0.2)',
  backgroundSize: 'cover',
  [theme.breakpoints.up('sm')]: {
    marginTop: theme.spacing(10),
    minHeight: '700px',
  },
}));

const FormContainer = styled(motion.div)(({ theme }) => ({
  maxWidth: '700px',
  width: '100%',
  padding: theme.spacing(6),
  [theme.breakpoints.down('md')]: {
    maxWidth: '600px',
    padding: theme.spacing(5),
  },
  [theme.breakpoints.down('sm')]: {
    maxWidth: '500px',
    padding: theme.spacing(4),
  },
}));

export default function AuthMeetingFlow({ mode = 'join', initialMeetingId = '' }) {
  const router = useRouter();
  const { state, actions } = useApp();
  const [authMode, setAuthMode] = useState('options'); // 'options', 'guest', 'authenticated'
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  // Meeting form data
  const [meetingData, setMeetingData] = useState({
    meetingId: initialMeetingId,
    displayName: '',
    // Guest details
    email: '',
    organization: '',
  });

  useEffect(() => {
    // If user is already authenticated, skip to authenticated mode
    if (state.isAuthenticated && state.user) {
      setAuthMode('authenticated');
      setMeetingData(prev => ({
        ...prev,
        displayName: state.user.name || state.user.username || '',
      }));
    }
  }, [state.isAuthenticated, state.user]);

  const handleInputChange = (field, value) => {
    setMeetingData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (mode === 'join') {
      if (!meetingData.meetingId.trim()) {
        newErrors.meetingId = 'Meeting ID is required';
      } else if (meetingData.meetingId.length < 3) {
        newErrors.meetingId = 'Meeting ID must be at least 3 characters';
      }
    }

    if (!meetingData.displayName.trim()) {
      newErrors.displayName = 'Display name is required';
    } else if (meetingData.displayName.length < 2) {
      newErrors.displayName = 'Display name must be at least 2 characters';
    }

    // For guest mode, validate additional fields
    if (authMode === 'guest') {
      if (!meetingData.email.trim()) {
        newErrors.email = 'Email is required for guest access';
      } else if (!/\S+@\S+\.\S+/.test(meetingData.email)) {
        newErrors.email = 'Please enter a valid email address';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setErrors({});

    try {
      // Save display name and guest info to context
      actions.setDisplayName(meetingData.displayName);
      
      if (authMode === 'guest') {
        // Save guest information
        actions.setGuestInfo({
          email: meetingData.email,
          organization: meetingData.organization,
          isGuest: true,
        });
      }

      // Simulate validation delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (mode === 'join') {
        // Join the meeting
        actions.joinMeeting(meetingData.meetingId);
        router.push(`/${meetingData.meetingId}`);
      } else {
        // Start a new meeting
        const meetingId = `meet-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        actions.startMeeting(meetingId);
        router.push(`/${meetingId}`);
      }
      
    } catch (error) {
      setErrors({ submit: `Failed to ${mode} meeting. Please try again.` });
    } finally {
      setLoading(false);
    }
  };

  const handleLoginRedirect = () => {
    router.push('/auth/login');
  };

  const handleSignupRedirect = () => {
    router.push('/auth/register');
  };

  const renderAuthOptions = () => (
    <FormContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Stack spacing={4} alignItems="center">
        <Box textAlign="center">
          <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
            {mode === 'join' ? 'Join Meeting' : 'Start Meeting'}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Choose how you'd like to proceed
          </Typography>
        </Box>

        <Stack spacing={3} width="100%" maxWidth="400px">
          {/* Authenticated User Option */}
          <Paper
            elevation={2}
            sx={{
              p: 3,
              border: '2px solid',
              borderColor: 'primary.main',
              borderRadius: 3,
              background: (theme) => alpha(theme.palette.primary.main, 0.05),
            }}
          >
            <Stack spacing={2} alignItems="center" textAlign="center">
              <LockIcon color="primary" sx={{ fontSize: 40 }} />
              <Typography variant="h6" fontWeight="bold">
                Sign In to Your Account
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Access all features and keep your meeting history
              </Typography>
              <Stack direction="row" spacing={2} width="100%">
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={handleLoginRedirect}
                  startIcon={<LoginIcon />}
                >
                  Sign In
                </Button>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={handleSignupRedirect}
                  startIcon={<PersonAddIcon />}
                >
                  Sign Up
                </Button>
              </Stack>
            </Stack>
          </Paper>

          {/* Guest Option */}
          <Paper
            elevation={1}
            sx={{
              p: 3,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 3,
              cursor: 'pointer',
              transition: 'all 0.2s',
              '&:hover': {
                borderColor: 'primary.main',
                boxShadow: 2,
              },
            }}
            onClick={() => setAuthMode('guest')}
          >
            <Stack spacing={2} alignItems="center" textAlign="center">
              <GroupIcon color="action" sx={{ fontSize: 40 }} />
              <Typography variant="h6" fontWeight="bold">
                Continue as Guest
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Join quickly with limited features
              </Typography>
              <Button
                variant="outlined"
                color="secondary"
                startIcon={<PersonIcon />}
                onClick={() => setAuthMode('guest')}
              >
                Continue as Guest
              </Button>
            </Stack>
          </Paper>
        </Stack>
      </Stack>
    </FormContainer>
  );

  const renderGuestForm = () => (
    <FormContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Stack spacing={4}>
        <Box textAlign="center">
          <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
            Guest Information
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Please provide your details to {mode} as a guest
          </Typography>
          <Button
            variant="text"
            onClick={() => setAuthMode('options')}
            sx={{ mt: 1 }}
          >
            ← Back to options
          </Button>
        </Box>

        <Box component="form" onSubmit={handleSubmit}>
          <Stack spacing={3}>
            {mode === 'join' && (
              <EnhancedTextField
                fullWidth
                label="Meeting ID"
                placeholder="Enter meeting ID"
                value={meetingData.meetingId}
                onChange={(e) => handleInputChange('meetingId', e.target.value)}
                error={!!errors.meetingId}
                helperText={errors.meetingId}
                required
              />
            )}

            <EnhancedTextField
              fullWidth
              label="Your Name"
              placeholder="Enter your display name"
              value={meetingData.displayName}
              onChange={(e) => handleInputChange('displayName', e.target.value)}
              error={!!errors.displayName}
              helperText={errors.displayName}
              required
            />

            <EnhancedTextField
              fullWidth
              label="Email Address"
              type="email"
              placeholder="Enter your email"
              value={meetingData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              error={!!errors.email}
              helperText={errors.email || 'Required for guest access'}
              required
            />

            <EnhancedTextField
              fullWidth
              label="Organization (Optional)"
              placeholder="Enter your company/organization"
              value={meetingData.organization}
              onChange={(e) => handleInputChange('organization', e.target.value)}
            />

            {errors.submit && (
              <Alert severity="error">{errors.submit}</Alert>
            )}

            <EnhancedButton
              type="submit"
              variant="contained"
              size="large"
              loading={loading}
              startIcon={<VideocamIcon />}
              fullWidth
            >
              {mode === 'join' ? 'Join Meeting' : 'Start Meeting'}
            </EnhancedButton>
          </Stack>
        </Box>
      </Stack>
    </FormContainer>
  );

  const renderAuthenticatedForm = () => (
    <FormContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Stack spacing={4}>
        <Box textAlign="center">
          <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
            Welcome, {state.user?.name || state.user?.username}!
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Ready to {mode} your meeting?
          </Typography>
        </Box>

        <Box component="form" onSubmit={handleSubmit}>
          <Stack spacing={3}>
            {mode === 'join' && (
              <EnhancedTextField
                fullWidth
                label="Meeting ID"
                placeholder="Enter meeting ID"
                value={meetingData.meetingId}
                onChange={(e) => handleInputChange('meetingId', e.target.value)}
                error={!!errors.meetingId}
                helperText={errors.meetingId}
                required
              />
            )}

            <EnhancedTextField
              fullWidth
              label="Display Name"
              placeholder="How you'll appear in the meeting"
              value={meetingData.displayName}
              onChange={(e) => handleInputChange('displayName', e.target.value)}
              error={!!errors.displayName}
              helperText={errors.displayName}
              required
            />

            {errors.submit && (
              <Alert severity="error">{errors.submit}</Alert>
            )}

            <EnhancedButton
              type="submit"
              variant="contained"
              size="large"
              loading={loading}
              startIcon={<VideocamIcon />}
              fullWidth
            >
              {mode === 'join' ? 'Join Meeting' : 'Start Meeting'}
            </EnhancedButton>
          </Stack>
        </Box>
      </Stack>
    </FormContainer>
  );

  return (
    <Box
      sx={(theme) => ({
        position: 'relative',
        width: '100%',
        minHeight: '100vh',
        backgroundRepeat: 'no-repeat',
        backgroundImage:
          'radial-gradient(ellipse 80% 50% at 50% -20%, hsl(210, 100%, 90%), transparent)',
        ...theme.applyStyles('dark', {
          backgroundImage:
            'radial-gradient(ellipse 80% 50% at 50% -20%, hsl(210, 100%, 16%), transparent)',
        }),
        overflow: 'hidden',
      })}
    >
      <BlurryBlob
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: -99999,
        }}
        intensity="light"
        firstBlobColor="#667eea"
        secondBlobColor="#764ba2"
        thirdBlobColor="#60a5fa"
      />

      <BackgroundGradient />

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <StyledBox>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: '600px',
              p: 2,
            }}
          >
            <AnimatePresence mode="wait">
              {authMode === 'options' && renderAuthOptions()}
              {authMode === 'guest' && renderGuestForm()}
              {authMode === 'authenticated' && renderAuthenticatedForm()}
            </AnimatePresence>
          </Box>
        </StyledBox>
      </Container>
    </Box>
  );
}
