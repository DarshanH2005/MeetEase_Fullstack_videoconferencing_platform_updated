import React from 'react'
import VideoMeetClient from './VideoMeetClient'
import CssBaseline from '@mui/material/CssBaseline';
import Divider from '@mui/material/Divider';
import AppTheme from '../shared-theme/appTheme';
import EnhancedAppBar from '../../components/ui/EnhancedAppBar';
import Footer from '../mainpage/components/Footer';
import BlurryBlob from '../../components/ui/BlurryBlob';
import { Box } from '@mui/material';

export default function Join(props) {
  return (
    <AppTheme {...props}>
      <CssBaseline enableColorScheme />
      <Box
        sx={{
          position: 'relative',
          minHeight: '100vh',
          width: '100%',
          backgroundColor: 'background.default',
          overflow: 'hidden',
        }}
      >
        <BlurryBlob
          firstBlobColor="#667eea"
          secondBlobColor="#764ba2"
          thirdBlobColor="#f093fb"
          intensity="light"
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: -1,
          }}
        />
        <EnhancedAppBar />
        <VideoMeetClient />
        <Divider />
        <Footer />
      </Box>
    </AppTheme>
  )
}



