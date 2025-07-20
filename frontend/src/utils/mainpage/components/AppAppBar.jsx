import * as React from 'react';
import { styled, alpha } from '@mui/material/styles';
import Box from '@mui/material/Box';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import Drawer from '@mui/material/Drawer';
import MenuIcon from '@mui/icons-material/Menu';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import ColorModeIconDropdown from '../../shared-theme/ColorModeIconDropdown';
import Sitemark from './SitemarkIcon';
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/clerk-react";

const StyledToolbar = styled(Toolbar)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  flexShrink: 0,
  borderRadius: `calc(${theme.shape.borderRadius}px + 8px)`,
  backdropFilter: 'blur(24px)',
  border: '1px solid',
  borderColor: (theme.vars || theme).palette.divider,
  backgroundColor: theme.vars
    ? `rgba(${theme.vars.palette.background.defaultChannel} / 0.4)`
    : alpha(theme.palette.background.default, 0.4),
  boxShadow: (theme.vars || theme).shadows[1],
  padding: '8px 12px',
}));

export default function AppAppBar() {
  const [open, setOpen] = React.useState(false);

  const toggleDrawer = (newOpen) => () => {
    setOpen(newOpen);
  };

  return (
    <AppBar
      position="fixed"
      enableColorOnDark
      sx={{
        boxShadow: 0,
        bgcolor: 'transparent',
        backgroundImage: 'none',
        mt: 'calc(var(--template-frame-height, 0px) + 28px)',
      }}
    >
      <Container maxWidth="lg">
        <StyledToolbar variant="dense" disableGutters>
          <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', px: 0 }}>
            <Sitemark />
            <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
            <Button 
              variant="text" 
              color="info" 
              size="small" 
              href="/join"
              sx={{
                '&:hover': {
                  backgroundColor: 'transparent',
                  color: 'info.main',
                  transform: 'none'
                }
              }}
            >
                <b>Join Meeting</b>
              </Button>
              <Button 
                variant="text" 
                color="info" 
                size="small" 
                href="/start"
                sx={{
                  '&:hover': {
                    backgroundColor: 'transparent',
                    color: 'info.main',
                    transform: 'none'
                  }
                }}
              >
                <b>Start Meeting</b>
              </Button>
              <Button variant="text" color="info" size="small">
                <b>Features</b>
              </Button>
              
              <Button variant="text" color="info" size="small">
                <b>Highlights</b>
              </Button>
              <Button variant="text" color="info" size="small">
                <b>Pricing</b>
              </Button>
              
              
              
            </Box>
          </Box>
          <Box
            sx={{
              display: { xs: 'none', md: 'flex' },
              gap: 1,
              alignItems: 'center',
            }}
          ><div style={{display: 'flex', alignItems: 'center' , gap: 3}}>
            <Button
              variant="text"
              color="primary"
              size="small"
              href="/join"
              sx={{ 
                fontSize: '0.875rem',
                '&:hover': {
                  backgroundColor: 'transparent',
                  color: 'primary.main',
                  transform: 'none'
                }
              }}
            >
              Join Meeting
            </Button>
            <Button
              variant="text"
              color="primary"
              size="small"
              href="/start"
              sx={{ 
                fontSize: '0.875rem',
                '&:hover': {
                  backgroundColor: 'transparent',
                  color: 'primary.main',
                  transform: 'none'
                }
              }}
            >
              Start Meeting
            </Button>
          </div>
          
            <Button
              variant="outlined"
              color="primary"
              size="small"
              href="/auth/login"
              sx={{ 
                fontSize: '0.875rem', 
                mr: 1,
                '&:hover': {
                  backgroundColor: 'transparent',
                  borderColor: 'primary.main',
                  color: 'primary.main',
                  transform: 'none'
                }
              }}
            >
              Sign In
            </Button>
            <Button
              variant="contained"
              color="primary"
              size="small"
              href="/auth/register"
              sx={{ 
                fontSize: '0.875rem',
                '&:hover': {
                  backgroundColor: 'primary.main',
                  transform: 'none',
                  boxShadow: 'none'
                }
              }}
            >
              Sign Up
            </Button>
            <ColorModeIconDropdown />
          </Box>
          <Box sx={{ display: { xs: 'flex', md: 'none' }, gap: 1 }}>
            <ColorModeIconDropdown size="medium" />
            <IconButton aria-label="Menu button" onClick={toggleDrawer(true)}>
              <MenuIcon />
            </IconButton>
            <Drawer
              anchor="top"
              open={open}
              onClose={toggleDrawer(false)}
              PaperProps={{
                sx: {
                  top: 'var(--template-frame-height, 0px)',
                },
              }}
            >
              <Box sx={{ p: 2, backgroundColor: 'background.default' }}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                  }}
                >
                  <IconButton onClick={toggleDrawer(false)}>
                    <CloseRoundedIcon />
                  </IconButton>
                </Box>

                <MenuItem>
                  <Button 
                    color="primary" 
                    variant="outlined" 
                    fullWidth 
                    href="/join"
                    sx={{
                      '&:hover': {
                        backgroundColor: 'transparent',
                        borderColor: 'primary.main',
                        color: 'primary.main',
                        transform: 'none'
                      }
                    }}
                  >
                    Join Meeting
                  </Button>
                </MenuItem>
                <MenuItem>
                  <Button 
                    color="primary" 
                    variant="contained" 
                    fullWidth 
                    href="/start"
                    sx={{
                      '&:hover': {
                        backgroundColor: 'primary.main',
                        transform: 'none',
                        boxShadow: 'none'
                      }
                    }}
                  >
                    Start Meeting
                  </Button>
                </MenuItem>
                <Divider sx={{ my: 2 }} />
                <MenuItem>Features</MenuItem>
                <MenuItem>Testimonials</MenuItem>
                <MenuItem>Highlights</MenuItem>
                <MenuItem>Pricing</MenuItem>
                <MenuItem>FAQ</MenuItem>
                <MenuItem>Blog</MenuItem>
              </Box>
            </Drawer>
          </Box>
        </StyledToolbar>
      </Container>
    </AppBar>
  );
}
