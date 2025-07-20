import React from 'react';
import { Box, Typography, Container } from '@mui/material';
import EnhancedAppBar from '../components/ui/EnhancedAppBar';

export default function ScrollTest() {
  return (
    <>
      <EnhancedAppBar />
      <Container maxWidth="lg">
        <Box sx={{ mt: 12, mb: 4 }}>
          <Typography variant="h2" component="h1" gutterBottom>
            Scroll Animation Test
          </Typography>
          <Typography variant="h6" color="text.secondary" paragraph>
            Scroll up and down to test the navbar animations. The navbar should:
          </Typography>
          <ul>
            <li>Start full-width and transparent at the top</li>
            <li>Animate to a contained, blurred state when scrolling down past 50px</li>
            <li>Return to full-width when scrolling back up</li>
            <li>All buttons should remain stable and unaffected by the scroll animations</li>
          </ul>
        </Box>

        {/* Create enough content to scroll */}
        {Array.from({ length: 50 }, (_, i) => (
          <Box key={i} sx={{ mb: 4 }}>
            <Typography variant="h4" gutterBottom>
              Section {i + 1}
            </Typography>
            <Typography variant="body1" paragraph>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod 
              tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, 
              quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo 
              consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse 
              cillum dolore eu fugiat nulla pariatur.
            </Typography>
            <Typography variant="body1" paragraph>
              Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia 
              deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste 
              natus error sit voluptatem accusantium doloremque laudantium.
            </Typography>
          </Box>
        ))}
      </Container>
    </>
  );
}
