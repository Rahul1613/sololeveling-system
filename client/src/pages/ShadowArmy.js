import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Typography, Grid, Container, useMediaQuery, Modal } from '@mui/material';
import SystemPanel from '../components/common/SystemPanel';
import SystemButton from '../components/common/SystemButton';
import ShadowDetailsModal from '../components/shadows/ShadowDetailsModal';
import ShadowSummoning from '../components/shadows/ShadowSummoning';
import { getShadows } from '../redux/slices/shadowSlice';

const ShadowArmy = () => {
  const dispatch = useDispatch();
  const { shadows, isLoading, isError, message } = useSelector((state) => state.shadows);
  const [selectedShadow, setSelectedShadow] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showSummon, setShowSummon] = useState(false);
  const isDesktop = useMediaQuery('(min-width:900px)');

  useEffect(() => {
    dispatch(getShadows());
  }, [dispatch]);

  const handleCardClick = (shadow) => {
    setSelectedShadow(shadow);
    setShowDetails(true);
  };
  const handleCloseDetails = () => {
    setShowDetails(false);
    setSelectedShadow(null);
  };
  const handleSummonClick = () => {
    setShowSummon(true);
  };
  const handleSummonComplete = () => {
    setShowSummon(false);
    dispatch(getShadows());
  };

  return (
    <Container maxWidth="lg" sx={{ mt: isDesktop ? 4 : 2, mb: isDesktop ? 4 : 2 }}>
      <SystemPanel style={{ maxWidth: isDesktop ? 700 : '100vw', margin: isDesktop ? '32px auto' : 0 }}>
        <Typography sx={{ color: '#00eaff', fontFamily: 'Orbitron', fontSize: isDesktop ? 26 : 22, mb: 2, letterSpacing: 2, textShadow: '0 0 6px #00eaffcc' }}>
          SHADOW ARMY
        </Typography>
        <SystemButton sx={{ mb: isDesktop ? 2 : 1 }} onClick={handleSummonClick}>Summon New Shadow</SystemButton>
        <Grid container spacing={isDesktop ? 3 : 2}>
          {isLoading && (
            <Typography sx={{ color: '#b8eaff', fontSize: isDesktop ? 18 : 16, width: '100%', textAlign: 'center', mt: 3 }}>
              Loading...
            </Typography>
          )}
          {isError && (
            <Typography sx={{ color: '#b8eaff', fontSize: isDesktop ? 18 : 16, width: '100%', textAlign: 'center', mt: 3 }}>
              {message}
            </Typography>
          )}
          {!isLoading && (!shadows || shadows.length === 0) && (
            <Typography sx={{ color: '#b8eaff', fontSize: isDesktop ? 18 : 16, width: '100%', textAlign: 'center', mt: 3 }}>
              You have not extracted any shadows yet.
            </Typography>
          )}
          {shadows && shadows.map((shadow) => (
            <Grid item xs={12} sm={6} md={4} key={shadow._id}>
              <SystemPanel style={{ p: isDesktop ? 3 : 2, minHeight: 120 }}>
                <Box display="flex" flexDirection="column" alignItems="center">
                  <Box sx={{ width: isDesktop ? 64 : 48, height: isDesktop ? 64 : 48, mb: 1, boxShadow: '0 0 8px #00eaff99' }} />
                  <Typography sx={{ color: '#eaf6ff', fontWeight: 700, fontSize: isDesktop ? 18 : 15 }}>{shadow.name}</Typography>
                  <Typography sx={{ color: '#4eafe9', fontSize: isDesktop ? 15 : 13 }}>Level {shadow.level}</Typography>
                  <SystemButton sx={{ mt: 1 }} onClick={() => handleCardClick(shadow)}>Details</SystemButton>
                </Box>
              </SystemPanel>
            </Grid>
          ))}
        </Grid>
      </SystemPanel>
      <Modal open={showDetails} onClose={handleCloseDetails}>
        <Box sx={{ maxWidth: isDesktop ? 600 : '90vw', mx: 'auto', mt: isDesktop ? 8 : 4 }}>
          {selectedShadow && (
            <ShadowDetailsModal 
              shadow={selectedShadow} 
              show={showDetails} 
              onHide={handleCloseDetails} 
              onUpdate={() => dispatch(getShadows())}
            />
          )}
        </Box>
      </Modal>
      <Modal open={showSummon} onClose={() => setShowSummon(false)}>
        <Box sx={{ maxWidth: isDesktop ? 500 : '90vw', mx: 'auto', mt: isDesktop ? 8 : 4 }}>
          <ShadowSummoning onSummonComplete={handleSummonComplete} />
        </Box>
      </Modal>
    </Container>
  );
};

export default ShadowArmy;
