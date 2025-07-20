"use client"

import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

// Loading component
const VideoMeetLoading = () => (
  <Box 
    sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh',
      gap: 2
    }}
  >
    <CircularProgress size={60} />
    <Typography variant="h6" sx={{ mt: 2 }}>
      Loading Video Meeting...
    </Typography>
    <Typography variant="body2" color="text.secondary">
      Initializing audio and video systems
    </Typography>
  </Box>
);

// Dynamically import VideoMeet with no SSR
const VideoMeet = dynamic(
  () => import('./VideoMeet'),
  { 
    ssr: false,
    loading: VideoMeetLoading
  }
);

export default function VideoMeetClient() {
  return (
    <Suspense fallback={<VideoMeetLoading />}>
      <VideoMeet />
    </Suspense>
  );
}
