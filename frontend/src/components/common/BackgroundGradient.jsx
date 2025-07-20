import React from 'react';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';

const GradientContainer = styled('div')(({ theme }) => ({
  position: 'relative',
  padding: '4px',
  borderRadius: theme.shape.borderRadius * 3,
  background: 'transparent',
}));

const GradientBorder = styled(motion.div)(({ theme }) => ({
  position: 'absolute',
  inset: 0,
  borderRadius: theme.shape.borderRadius * 3,
  zIndex: 1,
  opacity: 0.8,
  filter: 'blur(25px)',
  transition: 'opacity 0.5s ease',
  willChange: 'transform',
  background: theme.palette.mode === 'dark'
    ? `radial-gradient(circle farthest-side at 0 100%, rgba(102, 126, 234, 0.6), transparent),
       radial-gradient(circle farthest-side at 100% 0, rgba(118, 75, 162, 0.6), transparent),
       radial-gradient(circle farthest-side at 100% 100%, rgba(96, 165, 250, 0.6), transparent),
       radial-gradient(circle farthest-side at 0 0, rgba(102, 126, 234, 0.6), rgba(20, 19, 22, 0.7))`
    : `radial-gradient(circle farthest-side at 0 100%, rgba(102, 126, 234, 0.4), transparent),
       radial-gradient(circle farthest-side at 100% 0, rgba(118, 75, 162, 0.4), transparent),
       radial-gradient(circle farthest-side at 100% 100%, rgba(96, 165, 250, 0.4), transparent),
       radial-gradient(circle farthest-side at 0 0, rgba(102, 126, 234, 0.4), rgba(248, 250, 252, 0.8))`,
  '&:hover': {
    opacity: 1,
  },
}));

const GradientBorderSolid = styled(motion.div)(({ theme }) => ({
  position: 'absolute',
  inset: 0,
  borderRadius: theme.shape.borderRadius * 3,
  zIndex: 1,
  willChange: 'transform',
  background: theme.palette.mode === 'dark'
    ? `radial-gradient(circle farthest-side at 0 100%, rgba(102, 126, 234, 0.3), transparent),
       radial-gradient(circle farthest-side at 100% 0, rgba(118, 75, 162, 0.3), transparent),
       radial-gradient(circle farthest-side at 100% 100%, rgba(96, 165, 250, 0.3), transparent),
       radial-gradient(circle farthest-side at 0 0, rgba(102, 126, 234, 0.3), rgba(20, 19, 22, 0.9))`
    : `radial-gradient(circle farthest-side at 0 100%, rgba(102, 126, 234, 0.2), transparent),
       radial-gradient(circle farthest-side at 100% 0, rgba(118, 75, 162, 0.2), transparent),
       radial-gradient(circle farthest-side at 100% 100%, rgba(96, 165, 250, 0.2), transparent),
       radial-gradient(circle farthest-side at 0 0, rgba(102, 126, 234, 0.2), rgba(248, 250, 252, 0.9))`,
}));

const ContentContainer = styled('div')(({ theme }) => ({
  position: 'relative',
  zIndex: 10,
  borderRadius: theme.shape.borderRadius * 2.5,
  background: theme.palette.mode === 'dark'
    ? theme.palette.background.paper
    : theme.palette.background.paper,
  backdropFilter: 'blur(20px)',
}));

export default function BackgroundGradient({ 
  children, 
  className = '', 
  containerClassName = '', 
  animate = true 
}) {
  const variants = {
    initial: {
      backgroundPosition: "0 50%",
    },
    animate: {
      backgroundPosition: ["0, 50%", "100% 50%", "0 50%"],
    },
  };

  const animationProps = animate ? {
    variants,
    initial: "initial",
    animate: "animate",
    transition: {
      duration: 8,
      repeat: Infinity,
      repeatType: "reverse",
      ease: "easeInOut",
    },
    style: {
      backgroundSize: "400% 400%",
    },
  } : {};

  return (
    <GradientContainer className={containerClassName}>
      <GradientBorder
        className="gradient-blur"
        {...animationProps}
      />
      <GradientBorderSolid
        className="gradient-border"
        {...animationProps}
      />
      <ContentContainer className={className}>
        {children}
      </ContentContainer>
    </GradientContainer>
  );
}
