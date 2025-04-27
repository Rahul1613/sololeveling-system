import React from 'react';
import { Card, CardContent, useMediaQuery } from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';

// Styled Material UI Card with glowing effect
const GlowingCard = styled(Card)(({ theme }) => ({
  background: 'rgba(30, 30, 40, 0.7)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(123, 104, 238, 0.5)',
  boxShadow: '0 0 15px rgba(123, 104, 238, 0.5)',
  borderRadius: '12px',
  position: 'relative',
  overflow: 'visible',
  '&:before': {
    content: '""',
    position: 'absolute',
    top: '-1px',
    left: '-1px',
    right: '-1px',
    bottom: '-1px',
    borderRadius: '12px',
    padding: '1px',
    background: 'linear-gradient(45deg, rgba(123, 104, 238, 0.8), rgba(76, 175, 80, 0.8))',
    WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
    WebkitMaskComposite: 'xor',
    maskComposite: 'exclude',
    pointerEvents: 'none',
  },
  [theme.breakpoints.down('sm')]: {
    borderRadius: '8px',
    boxShadow: '0 0 10px rgba(123, 104, 238, 0.4)',
    '&:before': {
      borderRadius: '8px',
    }
  }
}));

// Holographic element placeholder
const HolographicIcon = () => {
  return (
    <div style={{
      width: '40px',
      height: '40px',
      background: 'linear-gradient(135deg, rgba(123, 104, 238, 0.8), rgba(76, 175, 80, 0.8))',
      borderRadius: '8px',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      boxShadow: '0 0 10px rgba(123, 104, 238, 0.5)',
      animation: 'pulse 2s infinite ease-in-out'
    }}>
      <span style={{ color: 'white', fontSize: '20px' }}>SL</span>
    </div>
  );
};

// Main holographic card component
const HolographicCard = ({ 
  title, 
  content, 
  height = 300, 
  width = '100%', 
  children,
  backgroundColor = 'rgba(30, 30, 40, 0.7)',
  borderColor = 'rgba(123, 104, 238, 0.5)',
  showHologram = true
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  return (
    <GlowingCard sx={{ 
      height: height === 'auto' ? 'auto' : height, 
      width, 
      backgroundColor, 
      borderColor,
      transition: 'all 0.3s ease',
      '&:hover': {
        boxShadow: isMobile ? '0 0 15px rgba(123, 104, 238, 0.5)' : '0 0 25px rgba(123, 104, 238, 0.8)',
        transform: isMobile ? 'none' : 'translateY(-5px)',
      },
    }}>
      <CardContent sx={{ 
        height: '100%', 
        position: 'relative', 
        p: isMobile ? 2 : 3,
        '&:last-child': { paddingBottom: isMobile ? 2 : 3 }
      }}>
        {title && <h3 style={{ 
          color: '#7B68EE', 
          marginTop: 0, 
          fontSize: isMobile ? '1.2rem' : '1.5rem',
          marginBottom: isMobile ? '0.8rem' : '1rem'
        }}>{title}</h3>}
        
        {content && <div>{content}</div>}
        
        {children}
        
        {showHologram && !isMobile && (
          <div style={{ 
            position: 'absolute', 
            top: '10px', 
            right: '10px',
            opacity: 0.8,
            animation: 'float 3s infinite ease-in-out'
          }}>
            <HolographicIcon />
          </div>
        )}
        
        <style jsx="true">{`
          @keyframes pulse {
            0% { opacity: 0.7; }
            50% { opacity: 1; }
            100% { opacity: 0.7; }
          }
          
          @keyframes float {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
            100% { transform: translateY(0px); }
          }
        `}</style>
      </CardContent>
    </GlowingCard>
  );
};

export default HolographicCard;
