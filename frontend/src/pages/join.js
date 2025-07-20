import React from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import Divider from '@mui/material/Divider';
import AppTheme from '../utils/shared-theme/appTheme';
import EnhancedAppBar from '../components/ui/EnhancedAppBar';
import Footer from '../utils/mainpage/components/Footer';
import JoinMeetingHero from '../components/meeting/JoinMeetingHero';
import ToastNotification from '../components/common/ToastNotification';

export default function JoinPage(props) {
  return (
    <AppTheme {...props}>
      <CssBaseline enableColorScheme />
      <EnhancedAppBar />
      <JoinMeetingHero />
      <Divider />
      <Footer />
      <ToastNotification />
    </AppTheme>
  );
}
