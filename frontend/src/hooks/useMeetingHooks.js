import { useEffect, useState, useRef } from 'react';

/**
 * Hook for detecting active speakers in a video conference
 * @param {Array} participants - Array of participant objects with stream property
 * @param {Object} options - Configuration options
 * @returns {Object} - { activeSpeaker, audioLevels, speakingParticipants }
 */
export const useSpeakerDetection = (participants = [], options = {}) => {
  const {
    threshold = 30, // Minimum audio level to consider as speaking
    debounceTime = 500, // Time to wait before changing active speaker
    smoothingFactor = 0.3, // Audio level smoothing
  } = options;

  const [activeSpeaker, setActiveSpeaker] = useState(null);
  const [audioLevels, setAudioLevels] = useState(new Map());
  const [speakingParticipants, setSpeakingParticipants] = useState(new Set());
  const [isClient, setIsClient] = useState(false);
  
  const audioContextRef = useRef(null);
  const analyzersRef = useRef(new Map());
  const audioLevelsRef = useRef(new Map());
  const debounceTimeoutRef = useRef(null);

  // Check if we're on the client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    // Only run on client side
    if (!isClient || typeof window === 'undefined') return;
    
    if (!window.AudioContext && !window.webkitAudioContext) {
      console.warn('Web Audio API not supported');
      return;
    }

    // Initialize Audio Context
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    audioContextRef.current = new AudioContext();

    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [isClient]);

  useEffect(() => {
    if (!audioContextRef.current) return;

    const audioContext = audioContextRef.current;
    const newAnalyzers = new Map();

    // Set up audio analysis for each participant
    participants.forEach((participant) => {
      if (participant.stream && participant.socketId) {
        try {
          const audioTracks = participant.stream.getAudioTracks();
          if (audioTracks.length > 0) {
            // Create audio source from stream
            const source = audioContext.createMediaStreamSource(participant.stream);
            const analyzer = audioContext.createAnalyser();
            
            analyzer.fftSize = 256;
            analyzer.smoothingTimeConstant = smoothingFactor;
            
            source.connect(analyzer);
            newAnalyzers.set(participant.socketId, analyzer);
          }
        } catch (error) {
          console.warn(`Failed to set up audio analysis for participant ${participant.socketId}:`, error);
        }
      }
    });

    analyzersRef.current = newAnalyzers;

    // Clean up old analyzers
    return () => {
      newAnalyzers.forEach((analyzer) => {
        try {
          analyzer.disconnect();
        } catch (error) {
          // Ignore disconnection errors
        }
      });
    };
  }, [participants, smoothingFactor]);

  useEffect(() => {
    if (analyzersRef.current.size === 0) return;

    const interval = setInterval(() => {
      const currentLevels = new Map();
      const currentSpeaking = new Set();
      let loudestParticipant = null;
      let maxLevel = 0;

      analyzersRef.current.forEach((analyzer, socketId) => {
        try {
          const bufferLength = analyzer.frequencyBinCount;
          const dataArray = new Uint8Array(bufferLength);
          analyzer.getByteFrequencyData(dataArray);

          // Calculate RMS (Root Mean Square) for audio level
          let sum = 0;
          for (let i = 0; i < bufferLength; i++) {
            sum += dataArray[i] * dataArray[i];
          }
          const rms = Math.sqrt(sum / bufferLength);
          
          // Smooth the audio level
          const previousLevel = audioLevelsRef.current.get(socketId) || 0;
          const smoothedLevel = previousLevel * smoothingFactor + rms * (1 - smoothingFactor);
          
          currentLevels.set(socketId, smoothedLevel);
          audioLevelsRef.current.set(socketId, smoothedLevel);

          // Check if participant is speaking
          if (smoothedLevel > threshold) {
            currentSpeaking.add(socketId);
            
            // Track loudest speaker
            if (smoothedLevel > maxLevel) {
              maxLevel = smoothedLevel;
              loudestParticipant = socketId;
            }
          }
        } catch (error) {
          console.warn(`Error analyzing audio for participant ${socketId}:`, error);
        }
      });

      setAudioLevels(new Map(currentLevels));
      setSpeakingParticipants(new Set(currentSpeaking));

      // Update active speaker with debouncing
      if (loudestParticipant && loudestParticipant !== activeSpeaker) {
        if (debounceTimeoutRef.current) {
          clearTimeout(debounceTimeoutRef.current);
        }
        
        debounceTimeoutRef.current = setTimeout(() => {
          setActiveSpeaker(loudestParticipant);
        }, debounceTime);
      }
    }, 100); // Check every 100ms

    return () => {
      clearInterval(interval);
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [threshold, debounceTime, smoothingFactor, activeSpeaker]);

  return {
    activeSpeaker,
    audioLevels,
    speakingParticipants,
    isSupported: isClient && typeof window !== 'undefined' && !!(window.AudioContext || window.webkitAudioContext),
  };
};

/**
 * Hook for managing video layout modes and participant spotlight
 */
export const useVideoLayoutManager = (participants = []) => {
  const [viewMode, setViewMode] = useState('grid');
  const [spotlightParticipant, setSpotlightParticipant] = useState(null);
  const [pinnedParticipants, setPinnedParticipants] = useState(new Set());

  const pinParticipant = (socketId) => {
    setPinnedParticipants(prev => new Set([...prev, socketId]));
  };

  const unpinParticipant = (socketId) => {
    setPinnedParticipants(prev => {
      const newSet = new Set(prev);
      newSet.delete(socketId);
      return newSet;
    });
  };

  const setSpotlight = (socketId) => {
    setSpotlightParticipant(socketId);
    if (socketId && viewMode !== 'spotlight') {
      setViewMode('spotlight');
    }
  };

  const clearSpotlight = () => {
    setSpotlightParticipant(null);
  };

  const getOptimalLayout = (participantCount) => {
    if (participantCount <= 1) return 'single';
    if (participantCount <= 4) return 'grid';
    if (participantCount <= 12) return 'grid';
    return 'spotlight'; // Auto-switch to spotlight for larger groups
  };

  // Auto-adjust layout based on participant count
  useEffect(() => {
    const optimalLayout = getOptimalLayout(participants.length);
    if (participants.length > 12 && viewMode === 'grid') {
      setViewMode('spotlight');
    }
  }, [participants.length, viewMode]);

  return {
    viewMode,
    setViewMode,
    spotlightParticipant,
    setSpotlight,
    clearSpotlight,
    pinnedParticipants,
    pinParticipant,
    unpinParticipant,
    getOptimalLayout,
  };
};

/**
 * Hook for managing participant connection quality and statistics
 */
export const useConnectionQuality = (participants = []) => {
  const [connectionStats, setConnectionStats] = useState(new Map());
  const [qualityMetrics, setQualityMetrics] = useState(new Map());

  useEffect(() => {
    const interval = setInterval(async () => {
      const newStats = new Map();
      const newMetrics = new Map();

      for (const participant of participants) {
        if (participant.peerConnection) {
          try {
            const stats = await participant.peerConnection.getStats();
            let inboundRTP = null;
            let outboundRTP = null;

            stats.forEach((report) => {
              if (report.type === 'inbound-rtp' && report.mediaType === 'video') {
                inboundRTP = report;
              }
              if (report.type === 'outbound-rtp' && report.mediaType === 'video') {
                outboundRTP = report;
              }
            });

            if (inboundRTP || outboundRTP) {
              const metric = {
                bytesReceived: inboundRTP?.bytesReceived || 0,
                bytesSent: outboundRTP?.bytesSent || 0,
                packetsLost: inboundRTP?.packetsLost || 0,
                packetsReceived: inboundRTP?.packetsReceived || 0,
                jitter: inboundRTP?.jitter || 0,
                roundTripTime: outboundRTP?.roundTripTime || 0,
                timestamp: Date.now(),
              };

              newStats.set(participant.socketId, metric);

              // Calculate quality score (0-100)
              const packetLossRate = metric.packetsLost / (metric.packetsReceived + metric.packetsLost) || 0;
              const quality = Math.max(0, 100 - (packetLossRate * 100) - (metric.jitter * 1000));
              
              newMetrics.set(participant.socketId, {
                quality: Math.round(quality),
                status: quality > 80 ? 'excellent' : quality > 60 ? 'good' : quality > 40 ? 'fair' : 'poor',
                packetLossRate,
                jitter: metric.jitter,
                roundTripTime: metric.roundTripTime,
              });
            }
          } catch (error) {
            console.warn(`Failed to get stats for participant ${participant.socketId}:`, error);
          }
        }
      }

      setConnectionStats(newStats);
      setQualityMetrics(newMetrics);
    }, 2000); // Check every 2 seconds

    return () => clearInterval(interval);
  }, [participants]);

  return {
    connectionStats,
    qualityMetrics,
  };
};
