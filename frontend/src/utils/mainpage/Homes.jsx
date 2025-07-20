import * as React from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import Divider from '@mui/material/Divider';
import AppTheme from '../shared-theme/appTheme';
import AppAppBa from './components/AppAppBa';
import Hero from './components/Hero';
import Footer from './components/Footer';

export default function Homes(props) {
    

    return (
        <AppTheme {...props}>
            <CssBaseline enableColorScheme />
            <AppAppBa />
            <Hero />
            <Divider />
            <Footer />
            
                
        </AppTheme>
    );
}