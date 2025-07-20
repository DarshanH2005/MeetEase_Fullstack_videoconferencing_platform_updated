import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { styled } from '@mui/material/styles';
import { Box, Typography, IconButton } from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';

// Styled components for different video layouts
const VideoGridContainer = styled(Box)(({ theme }) => ({
  width: '100%',
  height: '100%',
  display: 'grid',
  gap: '8px',
  padding: '16px',
  overflow: 'hidden',
}));

const SpotlightContainer = styled(Box)(({ theme }) => ({
  width: '100%',
  height: '70%',
  position: 'relative',
  borderRadius: '12px',
  overflow: 'hidden',
  border: '3px solid #667eea',
  boxShadow: '0 0 20px rgba(102, 126, 234, 0.3)',
}));

const ParticipantThumbnail = styled(Box)(({ theme }) => ({
  position: 'relative',
  borderRadius: '8px',
  overflow: 'hidden',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'scale(1.05)',
    border: '2px solid #667eea',
  },
}));

const ThumbnailStrip = styled(Box)(({ theme }) => ({
  width: '100%',
  height: '25%',
  display: 'flex',
  gap: '8px',
  padding: '16px',
  overflowX: 'auto',
  overflowY: 'hidden',
  scrollBehavior: 'smooth',
  '&::-webkit-scrollbar': {
    height: '6px',
  },
  '&::-webkit-scrollbar-track': {
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '3px',
  },
  '&::-webkit-scrollbar-thumb': {
    background: 'rgba(102, 126, 234, 0.6)',
    borderRadius: '3px',
  },
}));

const ParticipantOverlay = styled(Box)(({ theme }) => ({
  position: 'absolute',
  bottom: '8px',
  left: '8px',
  background: 'rgba(0, 0, 0, 0.8)',
  backdropFilter: 'blur(8px)',
  padding: '4px 8px',
  borderRadius: '6px',
  color: 'white',
  fontSize: '12px',
  fontWeight: '600',
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
}));

const ViewModeButton = styled(IconButton)(({ theme, active }) => ({
  position: 'absolute',
  top: '16px',
  right: '16px',
  zIndex: 10,
  backgroundColor: active ? '#667eea' : 'rgba(0, 0, 0, 0.7)',
  color: 'white',
  '&:hover': {
    backgroundColor: active ? '#5a67d8' : 'rgba(0, 0, 0, 0.9)',
  },
}));

// Layout configurations for different participant counts
const getGridLayout = (participantCount) => {
  if (participantCount <= 1) return { columns: 1, rows: 1 };
  if (participantCount <= 4) return { columns: 2, rows: 2 };
  if (participantCount <= 9) return { columns: 3, rows: 3 };
  if (participantCount <= 16) return { columns: 4, rows: 4 };
  if (participantCount <= 25) return { columns: 5, rows: 5 };
  if (participantCount <= 36) return { columns: 6, rows: 6 };
  return { columns: 7, rows: 8 }; // For up to 56 participants
};

const VideoMeetingGrid = ({ 
  participants = [], 
  currentUser,
  onParticipantClick,
  viewMode = 'grid', // 'grid', 'spotlight', 'presentation'
  spotlightParticipant = null,
  activeSpeaker = null
}) => {
  const [localViewMode, setLocalViewMode] = useState(viewMode);
  const [audioLevels, setAudioLevels] = useState(new Map());

  // Simulate audio level detection (replace with actual WebRTC audio analysis)
  useEffect(() => {
    const interval = setInterval(() => {
      if (participants.length > 0) {
        const newLevels = new Map();
        participants.forEach(participant => {
          // Simulate random audio levels (replace with actual audio detection)
          const level = Math.random() * 100;
          newLevels.set(participant.socketId, level);
        });
        setAudioLevels(newLevels);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [participants]);

  const gridLayout = getGridLayout(participants.length);

  const renderParticipantVideo = (participant, isSpotlight = false, index = 0) => {
    const audioLevel = audioLevels.get(participant.socketId) || 0;
    const isSpeaking = audioLevel > 30; // Threshold for speaking detection
    const isActiveSpeaker = activeSpeaker === participant.socketId;

    return (
      <motion.div
        key={participant.socketId}
        layout
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ 
          opacity: 1, 
          scale: 1,
          boxShadow: isSpeaking ? '0 0 20px rgba(102, 126, 234, 0.6)' : '0 0 0px rgba(102, 126, 234, 0)'
        }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.3 }}
        onClick={() => onParticipantClick && onParticipantClick(participant)}
        style={{
          width: isSpotlight ? '100%' : undefined,
          height: isSpotlight ? '100%' : undefined,
          minWidth: isSpotlight ? undefined : '120px',
          minHeight: isSpotlight ? undefined : '90px',
          position: 'relative',
        }}
      >
        <ParticipantThumbnail
          sx={{
            width: '100%',
            height: '100%',
            border: isActiveSpeaker ? '3px solid #4ade80' : undefined,
            boxShadow: isSpeaking ? '0 0 15px rgba(102, 126, 234, 0.4)' : undefined,
          }}
        >
          {participant.videoElement ? (
            <Box
              sx={{
                width: '100%',
                height: '100%',
                '& video': {
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
                },
              }}
            >
              {participant.videoElement}
            </Box>
          ) : (
            <Box
              sx={{
                width: '100%',
                height: '100%',
                backgroundColor: '#374151',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: isSpotlight ? '48px' : '24px',
                fontWeight: 'bold',
              }}
            >
              {participant.title?.charAt(0).toUpperCase() || 'U'}
            </Box>
          )}
          
          <ParticipantOverlay>
            {participant.audioEnabled ? (
              <MicIcon sx={{ fontSize: '14px', color: isSpeaking ? '#4ade80' : 'white' }} />
            ) : (
              <MicOffIcon sx={{ fontSize: '14px', color: '#ef4444' }} />
            )}
            {participant.videoEnabled ? (
              <VideocamIcon sx={{ fontSize: '14px' }} />
            ) : (
              <VideocamOffIcon sx={{ fontSize: '14px', color: '#ef4444' }} />
            )}
            <Typography variant="caption" sx={{ maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {participant.title || `User ${participant.socketId?.substr(0, 4)}`}
            </Typography>
          </ParticipantOverlay>

          {/* Audio level indicator */}
          {isSpeaking && (
            <Box
              sx={{
                position: 'absolute',
                top: '8px',
                right: '8px',
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                backgroundColor: '#4ade80',
                animation: 'pulse 1s infinite',
                '@keyframes pulse': {
                  '0%': { opacity: 1, transform: 'scale(1)' },
                  '50%': { opacity: 0.7, transform: 'scale(1.2)' },
                  '100%': { opacity: 1, transform: 'scale(1)' },
                },
              }}
            />
          )}
        </ParticipantThumbnail>
      </motion.div>
    );
  };

  const renderGridView = () => (
    <VideoGridContainer
      sx={{
        gridTemplateColumns: `repeat(${gridLayout.columns}, 1fr)`,
        gridTemplateRows: `repeat(${gridLayout.rows}, 1fr)`,
      }}
    >
      <AnimatePresence>
        {participants.map((participant, index) => 
          renderParticipantVideo(participant, false, index)
        )}
      </AnimatePresence>
    </VideoGridContainer>
  );

  const renderSpotlightView = () => {
    const spotlightUser = spotlightParticipant || 
                         participants.find(p => activeSpeaker === p.socketId) || 
                         participants[0];
    
    const otherParticipants = participants.filter(p => p.socketId !== spotlightUser?.socketId);

    return (
      <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
        <SpotlightContainer>
          {spotlightUser && renderParticipantVideo(spotlightUser, true)}
        </SpotlightContainer>
        
        <ThumbnailStrip>
          <AnimatePresence>
            {otherParticipants.map((participant, index) => (
              <Box key={participant.socketId} sx={{ minWidth: '120px', height: '90px' }}>
                {renderParticipantVideo(participant, false, index)}
              </Box>
            ))}
          </AnimatePresence>
        </ThumbnailStrip>
      </Box>
    );
  };

  const renderPresentationView = () => {
    // Similar to spotlight but with presentation area
    return renderSpotlightView();
  };

  return (
    <Box sx={{ width: '100%', height: '100%', position: 'relative' }}>
      {/* View mode toggles */}
      <Box sx={{ position: 'absolute', top: '16px', right: '16px', zIndex: 20, display: 'flex', gap: '8px' }}>
        <ViewModeButton
          active={localViewMode === 'grid'}
          onClick={() => setLocalViewMode('grid')}
          title="Grid View"
        >
          <Box sx={{ width: '16px', height: '16px', display: 'grid', gridTemplate: '1fr 1fr / 1fr 1fr', gap: '2px' }}>
            {[...Array(4)].map((_, i) => (
              <Box key={i} sx={{ backgroundColor: 'currentColor' }} />
            ))}
          </Box>
        </ViewModeButton>
        
        <ViewModeButton
          active={localViewMode === 'spotlight'}
          onClick={() => setLocalViewMode('spotlight')}
          title="Spotlight View"
        >
          <Box sx={{ width: '16px', height: '16px', position: 'relative' }}>
            <Box sx={{ width: '12px', height: '8px', backgroundColor: 'currentColor', borderRadius: '2px' }} />
            <Box sx={{ position: 'absolute', bottom: 0, display: 'flex', gap: '1px' }}>
              {[...Array(4)].map((_, i) => (
                <Box key={i} sx={{ width: '3px', height: '3px', backgroundColor: 'currentColor' }} />
              ))}
            </Box>
          </Box>
        </ViewModeButton>
      </Box>

      {/* Render appropriate view */}
      <AnimatePresence mode="wait">
        {localViewMode === 'grid' && (
          <motion.div
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ width: '100%', height: '100%' }}
          >
            {renderGridView()}
          </motion.div>
        )}
        
        {localViewMode === 'spotlight' && (
          <motion.div
            key="spotlight"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ width: '100%', height: '100%' }}
          >
            {renderSpotlightView()}
          </motion.div>
        )}
        
        {localViewMode === 'presentation' && (
          <motion.div
            key="presentation"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ width: '100%', height: '100%' }}
          >
            {renderPresentationView()}
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
};

export default VideoMeetingGrid;
