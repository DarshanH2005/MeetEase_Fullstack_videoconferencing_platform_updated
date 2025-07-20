import React, { useState, useRef } from 'react';
import { styled, alpha } from '@mui/material/styles';
import { useRouter } from 'next/router';
import {
  Box,
  AppBar,
  Toolbar,
  Button,
  IconButton,
  Divider,
  MenuItem,
  Drawer,
  Avatar,
  Menu,
  Typography,
} from '@mui/material';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';
import MenuIcon from '@mui/icons-material/Menu';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import VideocamIcon from '@mui/icons-material/Videocam';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import ColorModeIconDropdown from '../../utils/shared-theme/ColorModeIconDropdown';
import Sitemark from '../../utils/mainpage/components/SitemarkIcon';
import { useApp } from '../../context/AppContext';
import { logoutUser } from '../../utils/auth';

const StyledToolbar = styled(Toolbar)(({ theme, isScrolled }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  flexShrink: 0,
  borderRadius: isScrolled ? `calc(${theme.shape.borderRadius}px + 8px)` : '0px',
  backdropFilter: isScrolled ? 'blur(24px)' : 'none',
  border: isScrolled ? '1px solid' : 'none',
  borderColor: (theme.vars || theme).palette.divider,
  backgroundColor: isScrolled 
    ? (theme.vars
        ? `rgba(${theme.vars.palette.background.defaultChannel} / 0.4)`
        : alpha(theme.palette.background.default, 0.4))
    : 'transparent',
  boxShadow: isScrolled ? (theme.vars || theme).shadows[1] : 'none',
  padding: isScrolled ? '8px 12px' : '16px 4px',
  transition: 'all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1)',
  willChange: 'border-radius, backdrop-filter, border, background-color, box-shadow, padding',
  transform: 'translateZ(0)', // Force hardware acceleration
}));

const HoverButton = styled(Button)(({ theme }) => ({
  position: 'relative',
  overflow: 'hidden',
  '&:hover': {
    transform: 'translateY(-2px)',
    transition: 'transform 0.2s ease',
  },
  '&:before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    background: `linear-gradient(90deg, transparent, ${alpha(theme.palette.primary.main, 0.4)}, transparent)`,
    transition: 'left 0.5s',
  },
  '&:hover:before': {
    left: '100%',
  },
}));

export default function EnhancedAppBar() {
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(false);
  const [userMenuAnchor, setUserMenuAnchor] = useState(null);
  const ref = useRef(null);
  const router = useRouter();
  const { state, actions } = useApp();

  // Authentication state
  const isAuthenticated = state.user.isAuthenticated;
  const user = state.user;

  // Check if current page is meeting room
  const isMeetingRoom = router.pathname === '/[url]' || 
                       router.asPath.includes('/room/') ||
                       (router.pathname.includes('/join') && router.query.url);
  
  // Check if current page is login or join related
  const isAuthPage = router.pathname.includes('/auth/') || 
                    router.pathname.includes('/join') || 
                    router.pathname.includes('/start');

  const { scrollY } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  useMotionValueEvent(scrollY, "change", (latest) => {
    const threshold = 50;
    const newVisible = latest > threshold;
    
    // Only update state if it actually changed to prevent unnecessary re-renders
    if (newVisible !== visible) {
      setVisible(newVisible);
    }
  });

  const toggleDrawer = (newOpen) => () => {
    setOpen(newOpen);
  };

  // User menu handlers
  const handleUserMenuOpen = (event) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };

  const handleLogout = () => {
    actions.logoutUser();
    logoutUser();
    handleUserMenuClose();
  };

  const handleLogin = () => {
    router.push('/auth/login');
  };

  const handleSignup = () => {
    router.push('/auth/register');
  };

  const navItems = [
    { name: 'Features', link: '#features' },
    { name: 'Pricing', link: '#pricing' },
    { name: 'About', link: '#about' },
  ];

  return (
    <motion.div
      ref={ref}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >        <AppBar
          position="fixed"
          enableColorOnDark
          sx={{
            boxShadow: 0,
            bgcolor: 'transparent',
            backgroundImage: 'none',
            mt: visible ? 'calc(var(--template-frame-height, 0px) + 28px)' : '0px',
            left: 0,
            right: 0,
            width: '100%',
            transition: 'margin-top 0.4s cubic-bezier(0.165, 0.84, 0.44, 1)',
            zIndex: (theme) => theme.zIndex.appBar,
            willChange: 'margin-top',
            transform: 'translateZ(0)', // Force hardware acceleration
          }}
        >          <Box
            sx={{
              width: '100%',
              transition: 'all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1)',
              paddingLeft: visible ? '24px' : '24px',
              paddingRight: visible ? '24px' : '24px',
              maxWidth: visible ? '1000px' : 'calc(100% - 48px)',
              margin: visible ? '0 auto' : '0 auto',
              willChange: 'max-width',
              transform: 'translateZ(0)', // Force hardware acceleration
            }}
          >
          <StyledToolbar variant="dense" disableGutters isScrolled={visible}>
              {/* Logo Section */}
              <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', px: 0, minWidth: 0 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Sitemark />
                </Box>

                {/* Desktop Navigation */}
                {!isAuthPage && !isMeetingRoom && (
                  <Box sx={{ display: { xs: 'none', md: 'flex' }, ml: 4 }}>
                    {navItems.map((item, index) => (
                      <motion.div
                        key={item.name}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <HoverButton
                          variant="text"
                          color="inherit"
                          size="small"
                          href={item.link}
                          sx={{ mx: 1 }}
                        >
                          <b>{item.name}</b>
                        </HoverButton>
                      </motion.div>
                    ))}
                  </Box>
                )}

                {/* Meeting Room Navigation - removed Support/Settings as requested */}
              </Box>

              {/* Action Buttons */}
              {!isMeetingRoom && (
                <Box
                  sx={{
                    display: { xs: 'none', md: 'flex' },
                    gap: 2,
                    alignItems: 'center',
                    flexShrink: 0,
                    minWidth: 'fit-content',
                    '& *': {
                      transition: 'none !important',
                      transform: 'none !important',
                    },
                    '& button': {
                      transition: 'background-color 0.2s ease, color 0.2s ease !important',
                      transform: 'none !important',
                    }
                  }}
                >
                  {/* Meeting Buttons */}
                  <Box sx={{ 
                    display: 'flex', 
                    gap: 1, 
                    flexShrink: 0,
                  }}>
                    <motion.div 
                      whileHover={{ scale: 1.05 }} 
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        variant="outlined"
                        color="primary"
                        size="small"
                        href="/join"
                        startIcon={<VideocamIcon />}
                        sx={{ 
                          fontSize: '0.875rem',
                          borderRadius: '8px',
                          textTransform: 'none',
                          fontWeight: 600,
                        }}
                      >
                        Join Meeting
                      </Button>
                    </motion.div>
                    
                    <motion.div 
                      whileHover={{ scale: 1.05 }} 
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        href="/start"
                        startIcon={<VideocamIcon />}
                        sx={{ 
                          fontSize: '0.875rem',
                          borderRadius: '8px',
                          textTransform: 'none',
                          fontWeight: 600,
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          '&:hover': {
                            background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                          },
                        }}
                      >
                        Start Meeting
                      </Button>
                    </motion.div>
                  </Box>

                  <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

                  {/* Auth Section */}
                  {isAuthenticated ? (
                    // User Profile Menu for authenticated users
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
                        Welcome, {user?.name || user?.username}
                      </Typography>
                      <IconButton
                        onClick={handleUserMenuOpen}
                        size="small"
                        sx={{ 
                          border: '1px solid',
                          borderColor: 'divider',
                          borderRadius: '8px',
                        }}
                      >
                        <Avatar sx={{ width: 28, height: 28, fontSize: '0.875rem' }}>
                          {(user?.name || user?.username)?.charAt(0).toUpperCase()}
                        </Avatar>
                      </IconButton>
                      <Menu
                        anchorEl={userMenuAnchor}
                        open={Boolean(userMenuAnchor)}
                        onClose={handleUserMenuClose}
                        onClick={handleUserMenuClose}
                        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                        sx={{ mt: 1 }}
                      >
                        <MenuItem onClick={handleUserMenuClose}>
                          <AccountCircleIcon sx={{ mr: 2 }} />
                          Profile
                        </MenuItem>
                        <MenuItem onClick={handleLogout}>
                          <LogoutIcon sx={{ mr: 2 }} />
                          Logout
                        </MenuItem>
                      </Menu>
                    </Box>
                  ) : (
                    // Login/Signup buttons for unauthenticated users
                    <>
                      <motion.div 
                        whileHover={{ scale: 1.05 }} 
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button
                          variant="outlined"
                          color="primary"
                          size="small"
                          onClick={handleLogin}
                          sx={{ 
                            fontSize: '0.875rem',
                            borderRadius: '8px',
                            textTransform: 'none',
                            fontWeight: 600,
                          }}
                        >
                          Sign In
                        </Button>
                      </motion.div>

                      <motion.div 
                        whileHover={{ scale: 1.05 }} 
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button
                          variant="contained"
                          color="primary"
                          size="small"
                          onClick={handleSignup}
                          sx={{ 
                            fontSize: '0.875rem',
                            borderRadius: '8px',
                            textTransform: 'none',
                            fontWeight: 600,
                            background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
                            '&:hover': {
                              background: 'linear-gradient(135deg, #ff5252 0%, #d63031 100%)',
                            },
                          }}
                        >
                          Sign Up
                        </Button>
                      </motion.div>
                    </>
                  )}

                  <ColorModeIconDropdown />
                </Box>
              )}

              {/* Meeting Room Action Buttons */}
              {isMeetingRoom && (
                <Box
                  sx={{
                    display: { xs: 'none', md: 'flex' },
                    gap: 1,
                    alignItems: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    href="/joins"
                    sx={{ 
                      fontSize: '0.875rem',
                      borderRadius: '8px',
                      textTransform: 'none',
                      fontWeight: 600,
                    }}
                  >
                    Leave Meeting
                  </Button>
                  
                  <ColorModeIconDropdown />
                </Box>
              )}

              {/* Mobile Menu */}
              <Box sx={{ 
                display: { xs: 'flex', md: 'none' }, 
                gap: 1,
                position: 'relative',
                transform: 'translateZ(0)',
                flexShrink: 0,
              }}>
                <Box sx={{ 
                  position: 'relative',
                  transform: 'translateZ(0)',
                }}>
                  <ColorModeIconDropdown size="medium" />
                </Box>
                <Box sx={{ 
                  position: 'relative',
                  transform: 'translateZ(0)',
                }}>
                  <IconButton 
                    aria-label="Menu button" 
                    onClick={toggleDrawer(true)}
                    sx={{
                      position: 'relative',
                      backfaceVisibility: 'hidden',
                      transform: 'translateZ(0)',
                    }}
                  >
                    <MenuIcon />
                  </IconButton>
                </Box>
                
                <Drawer
                  anchor="top"
                  open={open}
                  onClose={toggleDrawer(false)}
                  PaperProps={{
                    sx: {
                      top: 'var(--template-frame-height, 0px)',
                      backdropFilter: 'blur(24px)',
                      backgroundColor: (theme) => alpha(theme.palette.background.paper, 0.8),
                    },
                  }}
                >
                  <Box sx={{ p: 3, backgroundColor: 'background.default' }}>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mb: 3,
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Sitemark />
                      </Box>
                      <IconButton onClick={toggleDrawer(false)}>
                        <CloseRoundedIcon />
                      </IconButton>
                    </Box>

                    {/* Mobile Navigation Items */}
                    {!isAuthPage && !isMeetingRoom && navItems.map((item) => (
                      <MenuItem key={item.name} sx={{ py: 1 }}>
                        <Button
                          fullWidth
                          variant="text"
                          href={item.link}
                          onClick={toggleDrawer(false)}
                          sx={{ justifyContent: 'flex-start' }}
                        >
                          {item.name}
                        </Button>
                      </MenuItem>
                    ))}

                    {/* Meeting Room Mobile Navigation - removed Support/Settings as requested */}

                    {(!isAuthPage || isMeetingRoom) && <Divider sx={{ my: 2 }} />}

                    {/* Mobile Action Buttons */}
                    {!isMeetingRoom && (
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Button
                          color="primary"
                          variant="outlined"
                          fullWidth
                          href="/join"
                          startIcon={<VideocamIcon />}
                          onClick={toggleDrawer(false)}
                        >
                          Join Meeting
                        </Button>
                        <Button
                          color="primary"
                          variant="contained"
                          fullWidth
                          href="/start"
                          startIcon={<VideocamIcon />}
                          onClick={toggleDrawer(false)}
                        >
                          Start Meeting
                        </Button>
                        
                        <Divider sx={{ my: 1 }} />
                        
                        {/* Mobile Auth Section */}
                        {isAuthenticated ? (
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center', mb: 1 }}>
                              Welcome, {user?.name || user?.username}
                            </Typography>
                            <Button
                              variant="outlined"
                              color="primary"
                              fullWidth
                              onClick={() => {
                                handleLogout();
                                toggleDrawer(false)();
                              }}
                              sx={{
                                borderRadius: '8px',
                                textTransform: 'none',
                                fontWeight: 600,
                              }}
                            >
                              Logout
                            </Button>
                          </Box>
                        ) : (
                          <>
                            <Button
                              variant="outlined"
                              color="primary"
                              fullWidth
                              onClick={() => {
                                handleLogin();
                                toggleDrawer(false)();
                              }}
                              sx={{
                                borderRadius: '8px',
                                textTransform: 'none',
                                fontWeight: 600,
                              }}
                            >
                              Sign In
                            </Button>
                            <Button
                              variant="contained"
                              color="primary"
                              fullWidth
                              onClick={() => {
                                handleSignup();
                                toggleDrawer(false)();
                              }}
                              sx={{
                                borderRadius: '8px',
                                textTransform: 'none',
                                fontWeight: 600,
                                background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
                                '&:hover': {
                                  background: 'linear-gradient(135deg, #ff5252 0%, #d63031 100%)',
                                },
                              }}
                            >
                              Sign Up
                            </Button>
                          </>
                        )}
                      </Box>
                    )}

                    {/* Meeting Room Mobile Actions */}
                    {isMeetingRoom && (
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Button
                          color="error"
                          variant="outlined"
                          fullWidth
                          href="/joins"
                          onClick={toggleDrawer(false)}
                          sx={{
                            borderRadius: '8px',
                            textTransform: 'none',
                            fontWeight: 600,
                          }}
                        >
                          Leave Meeting
                        </Button>
                      </Box>
                    )}
                  </Box>
                </Drawer>
              </Box>
            </StyledToolbar>
        </Box>
      </AppBar>
    </motion.div>
  );
}
