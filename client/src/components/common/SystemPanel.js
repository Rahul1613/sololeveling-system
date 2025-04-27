import React from 'react';
import Box from '@mui/material/Box';

const SystemPanel = ({ children, style, ...props }) => (
  <Box
    sx={{
      background: 'linear-gradient(135deg, rgba(20,40,60,0.85) 60%, rgba(30,60,120,0.85) 100%)',
      border: '2px solid #4eafe9',
      boxShadow: '0 0 16px #00eaff88, 0 0 32px #4eafe988',
      borderRadius: '18px',
      padding: '18px 14px',
      color: '#eaf6ff',
      fontFamily: 'Rajdhani, Orbitron, Segoe UI, Arial, sans-serif',
      position: 'relative',
      overflow: 'hidden',
      ...style
    }}
    {...props}
  >
    {/* Holographic scanline overlay */}
    <Box
      sx={{
        pointerEvents: 'none',
        position: 'absolute',
        left: 0, top: 0, right: 0, bottom: 0,
        background: 'repeating-linear-gradient(180deg, rgba(78,175,233,0.06) 0px, rgba(78,175,233,0.06) 2px, transparent 2px, transparent 8px)',
        opacity: 0.5,
        zIndex: 1
      }}
    />
    <Box sx={{ position: 'relative', zIndex: 2 }}>
      {children}
    </Box>
  </Box>
);

export default SystemPanel;
