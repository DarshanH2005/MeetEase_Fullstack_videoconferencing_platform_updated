import * as React from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import Divider from '@mui/material/Divider';
import AppTheme from '../shared-theme/appTheme';
import EnhancedAppBar from '../../components/ui/EnhancedAppBar';
import Hero from './components/Hero';
import LogoCollection from './components/LogoCollection';
import Highlights from './components/Highlights';
import Pricing from './components/Pricing';
import Features from './components/Features';
import Footer from './components/Footer';
import Heros from './components/Heros';

export default function MarketingPage(props) {
  return (
    <AppTheme {...props}>
      <CssBaseline enableColorScheme />
      <EnhancedAppBar />
      <Heros />
      <div>
        <LogoCollection />
        <Features />
        <Divider />
        
        <Divider />
        <Highlights />
        <Divider />
        <Pricing />
        <Divider />
        
        <Divider />
        <Footer />
      </div>
    </AppTheme>
  );
}
