import React from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import Divider from '@mui/material/Divider';
import AppTheme from '../utils/shared-theme/appTheme';
import EnhancedAppBar from '../components/ui/EnhancedAppBar';
import Footer from '../utils/mainpage/components/Footer';
import StartMeetingHero from '../components/meeting/StartMeetingHero';
import ToastNotification from '../components/common/ToastNotification';

export default function StartPage(props) {
  return (
    <AppTheme {...props}>
      <CssBaseline enableColorScheme />
      <EnhancedAppBar />
      <StartMeetingHero />
      <Divider />
      <Footer />
      <ToastNotification />
    </AppTheme>
  );
}
