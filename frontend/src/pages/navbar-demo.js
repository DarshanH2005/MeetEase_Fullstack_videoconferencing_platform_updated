import React from 'react';
import { Box, Container, Typography, Grid, Paper } from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';
import AnimatedGradientButton from '../components/ui/AnimatedButton';
import EnhancedAppBar from '../components/ui/EnhancedAppBar';
import AppTheme from '../utils/shared-theme/appTheme';

const DemoSection = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  paddingTop: theme.spacing(15),
  paddingBottom: theme.spacing(8),
  background: theme.palette.mode === 'dark'
    ? 'linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 50%, #0f0f0f 100%)'
    : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #f1f5f9 100%)',
}));

const FeatureCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  textAlign: 'center',
  background: theme.palette.mode === 'dark'
    ? 'rgba(255, 255, 255, 0.05)'
    : 'rgba(255, 255, 255, 0.8)',
  backdropFilter: 'blur(10px)',
  border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
  borderRadius: theme.spacing(2),
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: theme.shadows[8],
  },
}));

export default function NavbarDemo(props) {
  const features = [
    {
      title: 'Resizable & Responsive',
      description: 'The navbar automatically resizes and adapts to scroll position with smooth animations.',
    },
    {
      title: 'LeetFeedback Inspired',
      description: 'Modern design elements inspired by the LeetFeedback website with glassmorphism effects.',
    },
    {
      title: 'Animated Components',
      description: 'Beautiful hover animations, gradient text, and smooth transitions throughout.',
    },
    {
      title: 'Mobile Optimized',
      description: 'Fully responsive design with an elegant mobile menu and touch-friendly interactions.',
    },
  ];

  return (
    <AppTheme {...props}>
      <EnhancedAppBar />
      
      <DemoSection>
        <Container maxWidth="lg">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Box sx={{ textAlign: 'center', mb: 8 }}>
              <Typography
                variant="h2"
                component="h1"
                sx={{
                  fontWeight: 700,
                  mb: 3,
                  background: (theme) => theme.palette.mode === 'dark'
                    ? 'linear-gradient(135deg, #fff 0%, #a0aec0 100%)'
                    : 'linear-gradient(135deg, #1a202c 0%, #4a5568 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Enhanced MeetEase Navbar
              </Typography>
              
              <Typography
                variant="h5"
                color="text.secondary"
                sx={{ mb: 4, maxWidth: '600px', mx: 'auto' }}
              >
                Experience the new LeetFeedback-inspired navigation with smooth animations,
                responsive design, and modern UI elements.
              </Typography>

              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                <AnimatedGradientButton variant="gradient">
                  Try Gradient Button
                </AnimatedGradientButton>
                
                <AnimatedGradientButton variant="pulse">
                  Try Pulse Button
                </AnimatedGradientButton>
              </Box>
            </Box>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <Grid container spacing={4}>
              {features.map((feature, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 * index }}
                  >
                    <FeatureCard elevation={3}>
                      <Typography variant="h6" component="h3" sx={{ mb: 2, fontWeight: 600 }}>
                        {feature.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {feature.description}
                      </Typography>
                    </FeatureCard>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <Box sx={{ textAlign: 'center', mt: 8 }}>
              <Typography variant="h4" component="h2" sx={{ mb: 3, fontWeight: 600 }}>
                Key Features Implemented
              </Typography>
              
              <Grid container spacing={3} sx={{ mt: 2 }}>
                <Grid item xs={12} md={6}>
                  <Box sx={{ textAlign: 'left' }}>
                    <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                      ✨ Visual Enhancements
                    </Typography>
                    <ul style={{ paddingLeft: '20px', lineHeight: '1.8' }}>
                      <li>Resizable navbar that shrinks on scroll</li>
                      <li>Glassmorphism background with blur effects</li>
                      <li>Gradient text for brand name</li>
                      <li>Beta badge with status indicator</li>
                      <li>Smooth hover animations on all buttons</li>
                    </ul>
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Box sx={{ textAlign: 'left' }}>
                    <Typography variant="h6" sx={{ mb: 2, color: 'secondary.main' }}>
                      🚀 Functionality
                    </Typography>
                    <ul style={{ paddingLeft: '20px', lineHeight: '1.8' }}>
                      <li>Responsive mobile menu with animations</li>
                      <li>Scroll-triggered navbar transformations</li>
                      <li>Framer Motion powered transitions</li>
                      <li>Integration with your existing components</li>
                      <li>Dark/light theme compatibility</li>
                    </ul>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </motion.div>
        </Container>
      </DemoSection>
    </AppTheme>
  );
}
