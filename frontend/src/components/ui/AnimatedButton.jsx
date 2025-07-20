import React from 'react';
import { styled } from '@mui/material/styles';
import { Button } from '@mui/material';
import { motion } from 'framer-motion';

const AnimatedButtonWrapper = styled(motion.div)({
  display: 'inline-block',
});

const GradientButton = styled(Button)(({ theme }) => ({
  position: 'relative',
  overflow: 'hidden',
  border: 'none',
  fontSize: '14px',
  fontFamily: 'inherit',
  cursor: 'pointer',
  color: '#fff',
  minWidth: '120px',
  height: '48px',
  textAlign: 'center',
  background: 'linear-gradient(90deg, #03a9f4, #f441a5, #ffeb3b, #03a9f4)',
  backgroundSize: '300%',
  borderRadius: '8px',
  zIndex: 1,
  textTransform: 'none',
  fontWeight: 600,
  transition: 'all 0.3s ease',
  
  '&:hover': {
    animation: 'gradientShift 2s linear infinite',
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
  },
  
  '&:before': {
    content: '""',
    position: 'absolute',
    top: '-2px',
    left: '-2px',
    right: '-2px',
    bottom: '-2px',
    zIndex: -1,
    background: 'linear-gradient(90deg, #03a9f4, #f441a5, #ffeb3b, #03a9f4)',
    backgroundSize: '400%',
    borderRadius: '10px',
    opacity: 0,
    transition: 'opacity 0.3s ease',
  },
  
  '&:hover:before': {
    opacity: 1,
    animation: 'gradientGlow 2s ease-in-out infinite alternate',
  },
  
  '&:active': {
    background: 'linear-gradient(32deg, #03a9f4, #f441a5, #ffeb3b, #03a9f4)',
    transform: 'translateY(0px)',
  },
  
  '@keyframes gradientShift': {
    '0%': {
      backgroundPosition: '0%',
    },
    '100%': {
      backgroundPosition: '400%',
    },
  },
  
  '@keyframes gradientGlow': {
    'from': { 
      filter: 'blur(5px)',
    },
    'to': { 
      filter: 'blur(20px)',
    },
  },
}));

const PulseButton = styled(Button)(({ theme }) => ({
  position: 'relative',
  overflow: 'hidden',
  background: theme.palette.mode === 'dark'
    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    : 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  color: 'white',
  borderRadius: '8px',
  padding: '12px 24px',
  textTransform: 'none',
  fontWeight: 600,
  border: 'none',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.palette.mode === 'dark'
      ? '0 8px 25px rgba(102, 126, 234, 0.4)'
      : '0 8px 25px rgba(79, 172, 254, 0.4)',
  },
  
  '&:before': {
    content: '""',
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: '0',
    height: '0',
    borderRadius: '50%',
    background: 'rgba(255, 255, 255, 0.3)',
    transition: 'all 0.6s ease',
    transform: 'translate(-50%, -50%)',
  },
  
  '&:active:before': {
    width: '300px',
    height: '300px',
  },
}));

export const AnimatedGradientButton = ({ 
  children, 
  onClick, 
  className,
  variant = 'gradient',
  ...props 
}) => {
  const buttonVariants = {
    hover: { 
      scale: 1.05,
      transition: { duration: 0.2 }
    },
    tap: { 
      scale: 0.95,
      transition: { duration: 0.1 }
    }
  };

  if (variant === 'pulse') {
    return (
      <AnimatedButtonWrapper
        whileHover="hover"
        whileTap="tap"
        variants={buttonVariants}
      >
        <PulseButton 
          onClick={onClick} 
          className={className}
          {...props}
        >
          {children}
        </PulseButton>
      </AnimatedButtonWrapper>
    );
  }

  return (
    <AnimatedButtonWrapper
      whileHover="hover"
      whileTap="tap"
      variants={buttonVariants}
    >
      <GradientButton 
        onClick={onClick} 
        className={className}
        {...props}
      >
        {children}
      </GradientButton>
    </AnimatedButtonWrapper>
  );
};

export default AnimatedGradientButton;
