import React from 'react';
import { Box } from '@mui/material';

export default function BlurryBlob({
  firstBlobColor = '#667eea',
  secondBlobColor = '#764ba2',
  thirdBlobColor = '#60a5fa',
  intensity = 'medium',
  sx,
  ...props
}) {
  const getOpacity = () => {
    switch (intensity) {
      case 'light': return 0.3;
      case 'medium': return 0.5;
      case 'heavy': return 0.7;
      default: return 0.5;
    }
  };

  const blobStyle = {
    position: 'absolute',
    borderRadius: '50%',
    filter: 'blur(100px)',
    opacity: getOpacity(),
  };

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        pointerEvents: 'none',
        ...sx,
        '@keyframes blob': {
          '0%': { transform: 'translate(-50%, -50%) scale(1)' },
          '25%': { transform: 'translate(-30%, -30%) scale(1.1)' },
          '50%': { transform: 'translate(-70%, -20%) scale(0.9)' },
          '75%': { transform: 'translate(-20%, -60%) scale(1.05)' },
          '100%': { transform: 'translate(-50%, -50%) scale(1)' },
        },
        '@keyframes blobFloat': {
          '0%': { transform: 'translate(-50%, -50%) scale(1) rotate(0deg)' },
          '20%': { transform: 'translate(-70%, -30%) scale(1.1) rotate(72deg)' },
          '40%': { transform: 'translate(-30%, -20%) scale(0.9) rotate(144deg)' },
          '60%': { transform: 'translate(-80%, -70%) scale(1.05) rotate(216deg)' },
          '80%': { transform: 'translate(-20%, -80%) scale(0.95) rotate(288deg)' },
          '100%': { transform: 'translate(-50%, -50%) scale(1) rotate(360deg)' },
        },
      }}
      {...props}
    >
      {/* First Blob - Top Center Moving */}
      <Box
        sx={{
          ...blobStyle,
          width: '800px',
          height: '800px',
          backgroundColor: firstBlobColor,
          top: '20%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          animation: 'blob 12s infinite ease-in-out',
          animationDelay: '0s',
        }}
      />
      
      {/* Second Blob - Floating Around */}
      <Box
        sx={{
          ...blobStyle,
          width: '600px',
          height: '600px',
          backgroundColor: secondBlobColor,
          top: '15%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          animation: 'blobFloat 15s infinite ease-in-out',
          animationDelay: '3s',
        }}
      />
      
      {/* Third Blob - Slower Movement */}
      <Box
        sx={{
          ...blobStyle,
          width: '700px',
          height: '700px',
          backgroundColor: thirdBlobColor,
          top: '25%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          animation: 'blob 18s infinite ease-in-out reverse',
          animationDelay: '6s',
        }}
      />
    </Box>
  );
}
