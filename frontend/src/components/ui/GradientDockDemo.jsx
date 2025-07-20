import React, { useState, useRef, useEffect } from 'react';
import { FloatingDock } from './FloatingDock';
import VideoCallRoundedIcon from "@mui/icons-material/VideoCallRounded";
import MicRoundedIcon from "@mui/icons-material/MicRounded";
import PresentToAllRoundedIcon from "@mui/icons-material/PresentToAllRounded";
import ChatBubbleRoundedIcon from "@mui/icons-material/ChatBubbleRounded";
import CallEndRoundedIcon from "@mui/icons-material/CallEndRounded";

export const GradientDockDemo = () => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isNearDock, setIsNearDock] = useState(false);
  const dockRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!dockRef.current) return;
      
      const rect = dockRef.current.getBoundingClientRect();
      
      // Check if mouse is near the dock (larger detection area)
      const buffer = 120;
      const isNear = (
        e.clientX >= rect.left - buffer &&
        e.clientX <= rect.right + buffer &&
        e.clientY >= rect.top - buffer &&
        e.clientY <= rect.bottom + buffer
      );
      
      if (isNear) {
        const relativeX = e.clientX - rect.left;
        const relativeY = e.clientY - rect.top;
        
        setMousePos({ x: relativeX, y: relativeY });
        setIsNearDock(true);
      } else {
        setIsNearDock(false);
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const demoControls = [
    {
      title: "Camera",
      icon: <VideoCallRoundedIcon />,
      onClick: () => console.log('Camera clicked'),
      color: "#4ade80",
    },
    {
      title: "Microphone", 
      icon: <MicRoundedIcon />,
      onClick: () => console.log('Mic clicked'),
      color: "#4ade80",
    },
    {
      title: "Share Screen",
      icon: <PresentToAllRoundedIcon />,
      onClick: () => console.log('Screen share clicked'),
      color: "#3b82f6",
    },
    {
      title: "Chat",
      icon: <ChatBubbleRoundedIcon />,
      onClick: () => console.log('Chat clicked'),
      color: "#8b5cf6",
      badge: 3,
    },
    {
      title: "End Call",
      icon: <CallEndRoundedIcon />,
      onClick: () => console.log('End call clicked'),
      color: "#ef4444",
    },
  ];

  return (
    <div style={{
      height: '100vh',
      width: '100vw',
      backgroundColor: '#0a0a0a',
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      gap: '40px'
    }}>
      <h1 style={{ color: 'white', textAlign: 'center' }}>
        Gradient Dock Demo - Move your mouse near the dock
      </h1>
      
      <div style={{ color: 'white', textAlign: 'center' }}>
        <p>Mouse Near Dock: {isNearDock ? 'YES' : 'NO'}</p>
        <p>Mouse Position: {mousePos.x.toFixed(0)}, {mousePos.y.toFixed(0)}</p>
      </div>

      {/* Floating Dock Controls */}        <div 
          ref={dockRef}
          style={{
            position: 'fixed',
            bottom: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1000,
            padding: '1px',
            borderRadius: '18px',
            background: isNearDock 
              ? `radial-gradient(circle 50px at ${mousePos.x}px ${mousePos.y}px, rgba(79, 70, 229, 0.6) 0%, rgba(124, 58, 237, 0.4) 25%, rgba(139, 92, 246, 0.3) 50%, rgba(79, 70, 229, 0.15) 75%, transparent 100%)`
              : 'linear-gradient(45deg, rgba(79, 70, 229, 0.15), rgba(124, 58, 237, 0.15))',
            boxShadow: isNearDock 
              ? `0 0 15px rgba(79, 70, 229, 0.25), 0 0 30px rgba(124, 58, 237, 0.2)`
              : `0 0 8px rgba(79, 70, 229, 0.1)`,
            transition: isNearDock ? 'none' : 'all 0.3s ease-out',
            isolation: 'isolate',
          }}
        >
          <div style={{ 
            borderRadius: '17px',
            background: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(20px)',
            padding: '1px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}>
          <FloatingDock
            items={demoControls}
            desktopClassName="bg-transparent backdrop-blur-0 border-0 rounded-2xl shadow-none"
            mobileClassName="bg-transparent backdrop-blur-0 border-0 rounded-2xl shadow-none"
          />
        </div>
      </div>
    </div>
  );
};
