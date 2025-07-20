import React from 'react';
import { styled } from '@mui/material/styles';
import Button from '@mui/material/Button';
import { motion } from 'framer-motion';

const StyledButton = styled(motion.button)(({ theme, variant }) => ({
  position: 'relative',
  display: 'block',
  width: '100%',
  height: '48px',
  borderRadius: theme.shape.borderRadius,
  border: 'none',
  cursor: 'pointer',
  fontSize: '1rem',
  fontWeight: 600,
  fontFamily: theme.typography.fontFamily,
  transition: 'all 0.3s ease',
  overflow: 'hidden',
  
  ...(variant === 'primary' ? {
    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
    color: theme.palette.primary.contrastText,
    boxShadow: `0px 1px 0px 0px ${theme.palette.primary.light}40 inset, 0px -1px 0px 0px ${theme.palette.primary.dark}40 inset`,
    
    '&:hover': {
      background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
      transform: 'translateY(-1px)',
      boxShadow: `0px 4px 12px ${theme.palette.primary.main}30`,
    },
    
    '&:active': {
      transform: 'translateY(0px)',
    },
    
    '&:disabled': {
      background: theme.palette.action.disabled,
      color: theme.palette.action.disabled,
      cursor: 'not-allowed',
      transform: 'none',
      boxShadow: 'none',
    },
  } : {
    background: theme.palette.mode === 'dark' 
      ? theme.palette.grey[800] 
      : theme.palette.grey[100],
    color: theme.palette.text.primary,
    border: `1px solid ${theme.palette.divider}`,
    
    '&:hover': {
      background: theme.palette.mode === 'dark' 
        ? theme.palette.grey[700] 
        : theme.palette.grey[200],
      transform: 'translateY(-1px)',
      boxShadow: `0px 4px 12px ${theme.palette.grey[500]}30`,
    },
    
    '&:active': {
      transform: 'translateY(0px)',
    },
    
    '&:disabled': {
      background: theme.palette.action.disabled,
      color: theme.palette.action.disabled,
      cursor: 'not-allowed',
      transform: 'none',
      boxShadow: 'none',
    },
  }),
}));

const BottomGradient = styled('span')(({ theme, variant }) => ({
  position: 'absolute',
  insetX: 0,
  bottom: '-1px',
  display: 'block',
  height: '1px',
  width: '100%',
  background: variant === 'primary' 
    ? `linear-gradient(to right, transparent, ${theme.palette.primary.light}, transparent)`
    : `linear-gradient(to right, transparent, ${theme.palette.text.secondary}, transparent)`,
  opacity: 0,
  transition: 'opacity 0.5s ease',
  
  '.group:hover &': {
    opacity: 1,
  },
}));

const BlurGradient = styled('span')(({ theme, variant }) => ({
  position: 'absolute',
  insetX: '2.5rem',
  bottom: '-1px',
  margin: '0 auto',
  display: 'block',
  height: '1px',
  width: '50%',
  background: variant === 'primary'
    ? `linear-gradient(to right, transparent, ${theme.palette.secondary.main}, transparent)`
    : `linear-gradient(to right, transparent, ${theme.palette.primary.main}, transparent)`,
  opacity: 0,
  filter: 'blur(2px)',
  transition: 'opacity 0.5s ease',
  
  '.group:hover &': {
    opacity: 1,
  },
}));

export default function EnhancedButton({ 
  children, 
  variant = 'primary', 
  loading = false,
  ...props 
}) {
  return (
    <StyledButton
      className="group"
      variant={variant}
      disabled={loading}
      whileHover={{ scale: loading ? 1 : 1.02 }}
      whileTap={{ scale: loading ? 1 : 0.98 }}
      {...props}
    >
      {loading ? 'Loading...' : children}
      <BottomGradient variant={variant} />
      <BlurGradient variant={variant} />
    </StyledButton>
  );
}
