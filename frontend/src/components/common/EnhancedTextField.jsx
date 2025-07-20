import React, { useState } from 'react';
import { styled, alpha } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import { motion, useMotionTemplate, useMotionValue } from 'framer-motion';

const StyledMotionDiv = styled(motion.div)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  padding: '2px',
  transition: 'all 0.3s ease',
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    backgroundColor: theme.palette.mode === 'dark' 
      ? alpha(theme.palette.background.paper, 0.8)
      : alpha(theme.palette.background.paper, 0.9),
    borderRadius: theme.shape.borderRadius,
    border: 'none',
    boxShadow: theme.palette.mode === 'dark'
      ? '0px 0px 1px 1px rgba(64, 64, 64, 0.5)'
      : '0px 2px 3px -1px rgba(0, 0, 0, 0.1), 0px 1px 0px 0px rgba(25, 28, 33, 0.02), 0px 0px 0px 1px rgba(25, 28, 33, 0.08)',
    transition: 'all 0.4s ease',
    
    '& fieldset': {
      border: 'none',
    },
    
    '&:hover fieldset': {
      border: 'none',
    },
    
    '&.Mui-focused fieldset': {
      border: 'none',
      boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.3)}`,
    },
    
    '&.Mui-error fieldset': {
      boxShadow: `0 0 0 2px ${alpha(theme.palette.error.main, 0.3)}`,
    },
  },
  
  '& .MuiInputLabel-root': {
    color: theme.palette.text.primary,
    fontWeight: 500,
    fontSize: '0.875rem',
    marginBottom: theme.spacing(1),
    position: 'relative',
    transform: 'none',
    
    '&.Mui-focused': {
      color: theme.palette.primary.main,
    },
    
    '&.Mui-error': {
      color: theme.palette.error.main,
    },
  },
  
  '& .MuiInputBase-input': {
    color: theme.palette.text.primary,
    '&::placeholder': {
      color: alpha(theme.palette.text.secondary, 0.6),
      opacity: 1,
    },
  },
}));

export default function EnhancedTextField({ 
  label, 
  error, 
  helperText, 
  ...props 
}) {
  const [visible, setVisible] = useState(false);
  const radius = 100;
  
  let mouseX = useMotionValue(0);
  let mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }) {
    let { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <div style={{ width: '100%', marginBottom: '16px' }}>
      {label && (
        <label style={{ 
          display: 'block', 
          marginBottom: '8px',
          fontSize: '0.875rem',
          fontWeight: 500,
          color: error ? '#d32f2f' : 'inherit'
        }}>
          {label}
        </label>
      )}
      
      <StyledMotionDiv
        style={{
          background: useMotionTemplate`
            radial-gradient(
              ${visible ? radius + "px" : "0px"} circle at ${mouseX}px ${mouseY}px,
              ${error ? '#d32f2f33' : '#3b82f633'},
              transparent 80%
            )
          `,
        }}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
      >
        <StyledTextField
          {...props}
          error={error}
          helperText={helperText}
          fullWidth
          variant="outlined"
          InputLabelProps={{
            shrink: false,
            style: { display: 'none' } // Hide the floating label since we have our own
          }}
        />
      </StyledMotionDiv>
      
      {helperText && (
        <div style={{ 
          fontSize: '0.75rem',
          color: error ? '#d32f2f' : '#666',
          marginTop: '4px',
          marginLeft: '14px'
        }}>
          {helperText}
        </div>
      )}
    </div>
  );
}
