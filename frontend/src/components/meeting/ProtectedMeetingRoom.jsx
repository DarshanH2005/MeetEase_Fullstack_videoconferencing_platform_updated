import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Box, CircularProgress, Typography, Button, Container, Stack } from '@mui/material';
import { motion } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { isAuthenticated, getUserData } from '../../utils/auth';
import Join from '../../utils/mainpage/join';
import BlurryBlob from '../ui/BlurryBlob';
import BackgroundGradient from '../common/BackgroundGradient';

export default function ProtectedMeetingRoom() {
  const router = useRouter();
  const { url } = router.query;
  const { state, actions } = useApp();
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if user is authenticated
        const userIsAuthenticated = isAuthenticated();
        const userData = getUserData();

        if (userIsAuthenticated && userData) {
          // User is authenticated, update context and allow access
          actions.setUserData(userData);
          actions.setAuthenticated(true);
          setIsAuthorized(true);
        } else {
          // User is not authenticated, redirect to auth flow
          setIsAuthorized(false);
        }
      } catch (error) {
        console.error('Auth check error:', error);
        setIsAuthorized(false);
      } finally {
        setLoading(false);
      }
    };

    if (url) {
      checkAuth();
    }
  }, [url, actions]);

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          gap: 2,
        }}
      >
        <CircularProgress />
        <Typography variant="body2" color="text.secondary">
          Checking access permissions...
        </Typography>
      </Box>
    );
  }

  // If user is authenticated, show the meeting room
  if (isAuthorized) {
    return <Join />;
  }

  // If user is not authenticated, show a beautiful notification page
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
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
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
          zIndex: 0,
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
          justifyContent: 'center',
          minHeight: '100vh',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <BackgroundGradient>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            style={{
              padding: '3rem',
              textAlign: 'center',
              maxWidth: '600px',
            }}
          >
            <Typography
              variant="h3"
              sx={{
                fontWeight: 700,
                mb: 2,
                background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              🔒 Authentication Required
            </Typography>
            
            <Typography
              variant="h6"
              sx={{
                color: 'text.secondary',
                mb: 1,
                fontWeight: 500,
              }}
            >
              Meeting ID: {url}
            </Typography>
            
            <Typography
              sx={{
                color: 'text.secondary',
                mb: 4,
                fontSize: '1.1rem',
                lineHeight: 1.6,
              }}
            >
              You need to be logged in to join this meeting. Please sign in to your account or create a new one to continue.
            </Typography>

            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              sx={{ justifyContent: 'center', mb: 3 }}
            >
              <Button
                variant="contained"
                size="large"
                onClick={() => router.push(`/auth/login?redirect=/${url}`)}
                sx={{
                  minWidth: '160px',
                  height: '48px',
                  borderRadius: '12px',
                  background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #5a67d8 30%, #6b46c1 90%)',
                  },
                }}
              >
                Sign In
              </Button>
              
              <Button
                variant="outlined"
                size="large"
                onClick={() => router.push(`/auth/register?redirect=/${url}`)}
                sx={{
                  minWidth: '160px',
                  height: '48px',
                  borderRadius: '12px',
                  borderColor: '#667eea',
                  color: '#667eea',
                  '&:hover': {
                    borderColor: '#5a67d8',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                  },
                }}
              >
                Create Account
              </Button>
            </Stack>

            <Typography
              variant="body2"
              sx={{
                color: 'text.secondary',
                fontSize: '0.9rem',
              }}
            >
              After signing in, you'll be automatically redirected to join the meeting.
            </Typography>
          </motion.div>
        </BackgroundGradient>
      </Container>
    </Box>
  );
}
