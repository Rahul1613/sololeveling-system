import React from 'react';
import Button from '@mui/material/Button';

const SystemButton = ({ children, style, ...props }) => (
  <Button
    variant="contained"
    sx={{
      background: 'linear-gradient(90deg, #00eaff 0%, #4eafe9 100%)',
      color: '#0c1e2f',
      fontWeight: 'bold',
      fontFamily: 'Rajdhani, Orbitron, Segoe UI, Arial, sans-serif',
      borderRadius: '12px',
      boxShadow: '0 0 8px #00eaff99',
      textTransform: 'uppercase',
      letterSpacing: '1px',
      fontSize: '1.1rem',
      transition: 'all 0.15s',
      '&:hover': {
        background: 'linear-gradient(90deg, #4eafe9 0%, #00eaff 100%)',
        color: '#fff',
        boxShadow: '0 0 16px #00eaffcc',
      },
      ...style
    }}
    {...props}
  >
    {children}
  </Button>
);

export default SystemButton;
