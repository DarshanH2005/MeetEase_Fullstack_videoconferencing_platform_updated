import React from 'react';
import { Box } from '@mui/material';
import BlurryBlob from '../components/ui/BlurryBlob';
import AppTheme from '../utils/shared-theme/appTheme';

export default function BlobTest() {
  return (
    <AppTheme>
      <Box sx={{ 
        minHeight: '100vh', 
        backgroundColor: 'background.default',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <BlurryBlob 
          firstBlobColor="#667eea"
          secondBlobColor="#764ba2" 
          thirdBlobColor="#60a5fa"
          intensity="heavy"
          sx={{ 
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 0,
          }}
        />
        <Box sx={{ 
          position: 'relative', 
          zIndex: 1, 
          textAlign: 'center',
          backgroundColor: 'rgba(255,255,255,0.9)',
          padding: 4,
          borderRadius: 2,
        }}>
          <h1>Blob Background Test</h1>
          <p>You should see animated blurry blobs behind this text</p>
        </Box>
      </Box>
    </AppTheme>
  );
}
