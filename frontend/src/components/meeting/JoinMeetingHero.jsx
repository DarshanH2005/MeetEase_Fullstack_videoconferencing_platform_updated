import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { styled, alpha } from '@mui/material/styles';
import {
  Box,
  Container,
  Typography,
  Stack,
  Alert,
  Slide,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
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

export default function JoinMeetingHero() {
  const router = useRouter();
  const { state, actions } = useApp();
  const [formData, setFormData] = useState({
    meetingId: '',
    displayName: state.user.displayName || '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.meetingId.trim()) {
      newErrors.meetingId = 'Meeting ID is required';
    } else if (formData.meetingId.length < 3) {
      newErrors.meetingId = 'Meeting ID must be at least 3 characters';
    }
    
    if (!formData.displayName.trim()) {
      newErrors.displayName = 'Display name is required';
    } else if (formData.displayName.length < 2) {
      newErrors.displayName = 'Display name must be at least 2 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      // Save display name to context and localStorage
      actions.setDisplayName(formData.displayName);
      
      // Simulate validation delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Join the meeting
      actions.joinMeeting(formData.meetingId);
      
      // Navigate to meeting room
      router.push(`/${formData.meetingId}`);
      
    } catch (error) {
      setErrors({ submit: 'Failed to join meeting. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

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
      {/* Animated blurry blob background */}
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
      <Container
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          pt: { xs: 14, sm: 20 },
          pb: { xs: 8, sm: 12 },
          minHeight: '100vh',
          justifyContent: 'center',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <Stack
          spacing={4}
          useFlexGap
          sx={{ alignItems: 'center', width: '100%', maxWidth: '800px' }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Typography
              variant="h2"
              sx={{
                textAlign: 'center',
                fontSize: 'clamp(2rem, 8vw, 3rem)',
                fontWeight: 700,
                mb: 2,
              }}
            >
              Join a Meeting
            </Typography>
            <Typography
              sx={{
                textAlign: 'center',
                color: 'text.secondary',
                fontSize: '1.1rem',
                mb: 4,
              }}
            >
              Enter your meeting details to join the conversation
            </Typography>
          </motion.div>

          <BackgroundGradient>
            <FormContainer
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <form onSubmit={handleSubmit}>
                <Stack spacing={4}>
                  <EnhancedTextField
                    label="Meeting ID"
                    placeholder="Enter meeting ID or link"
                    value={formData.meetingId}
                    onChange={(e) => handleInputChange('meetingId', e.target.value)}
                    error={!!errors.meetingId}
                    helperText={errors.meetingId}
                    autoFocus
                    sx={{
                      '& .MuiInputBase-root': {
                        height: '60px',
                        fontSize: '1.1rem',
                      },
                      '& .MuiInputLabel-root': {
                        fontSize: '1.1rem',
                      },
                    }}
                  />
                  
                  <EnhancedTextField
                    label="Your Name"
                    placeholder="Enter your display name"
                    value={formData.displayName}
                    onChange={(e) => handleInputChange('displayName', e.target.value)}
                    error={!!errors.displayName}
                    helperText={errors.displayName}
                    sx={{
                      '& .MuiInputBase-root': {
                        height: '60px',
                        fontSize: '1.1rem',
                      },
                      '& .MuiInputLabel-root': {
                        fontSize: '1.1rem',
                      },
                    }}
                  />

                  <AnimatePresence>
                    {errors.submit && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                      >
                        <Alert severity="error" sx={{ mb: 2 }}>
                          {errors.submit}
                        </Alert>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <EnhancedButton
                    type="submit"
                    variant="primary"
                    loading={loading}
                    sx={{
                      height: '56px',
                      fontSize: '1.1rem',
                      fontWeight: 600,
                    }}
                  >
                    {loading ? 'Joining Meeting...' : 'Join Meeting'}
                  </EnhancedButton>
                </Stack>
              </form>
            </FormContainer>
          </BackgroundGradient>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ textAlign: 'center' }}
            >
              Don't have a meeting ID?{' '}
              <Typography
                component="a"
                href="/start"
                sx={{
                  color: 'primary.main',
                  textDecoration: 'none',
                  fontWeight: 500,
                  '&:hover': {
                    textDecoration: 'underline',
                  },
                }}
              >
                Start a new meeting
              </Typography>
            </Typography>
          </motion.div>
        </Stack>
      </Container>
    </Box>
  );
}
