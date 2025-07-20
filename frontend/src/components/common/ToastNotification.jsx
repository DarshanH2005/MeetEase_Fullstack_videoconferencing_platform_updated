import React from 'react';
import { Snackbar, Alert, Slide } from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../../context/AppContext';

const StyledAlert = styled(Alert)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 2,
  backdropFilter: 'blur(20px)',
  border: `1px solid ${theme.palette.divider}`,
  boxShadow: theme.palette.mode === 'dark'
    ? '0 8px 32px rgba(0, 0, 0, 0.4)'
    : '0 8px 32px rgba(0, 0, 0, 0.15)',
  
  '& .MuiAlert-icon': {
    fontSize: '1.25rem',
  },
  
  '& .MuiAlert-message': {
    fontWeight: 500,
  },
}));

function SlideTransition(props) {
  return <Slide {...props} direction="down" />;
}

export default function ToastNotification() {
  const { state, actions } = useApp();
  const { notifications } = state.ui;

  const handleClose = (id) => {
    actions.removeNotification(id);
  };

  return (
    <AnimatePresence>
      {notifications.map((notification) => (
        <Snackbar
          key={notification.id}
          open={true}
          autoHideDuration={notification.duration || 5000}
          onClose={() => handleClose(notification.id)}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          TransitionComponent={SlideTransition}
          sx={{ mt: 8 }}
        >
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.9 }}
            transition={{ duration: 0.3 }}
          >
            <StyledAlert
              severity={notification.type || 'info'}
              onClose={() => handleClose(notification.id)}
              variant="filled"
            >
              {notification.message}
            </StyledAlert>
          </motion.div>
        </Snackbar>
      ))}
    </AnimatePresence>
  );
}
