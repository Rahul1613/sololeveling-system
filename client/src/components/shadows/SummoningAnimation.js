import React, { useEffect, useState } from 'react';
import { Box, Typography, Modal, Paper } from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';

// Keyframes for animations
const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const pulse = keyframes`
  0% { transform: scale(1); opacity: 0.8; }
  50% { transform: scale(1.1); opacity: 1; }
  100% { transform: scale(1); opacity: 0.8; }
`;

const rotate = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
`;

// Styled components
const AnimationContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: '100%',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: 'rgba(0, 0, 0, 0.9)',
  overflow: 'hidden',
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(4),
  color: '#fff',
}));

const SummoningCircle = styled(Box)(({ theme, shadowType }) => {
  const getCircleColor = () => {
    switch (shadowType) {
      case 'soldier':
        return 'rgba(66, 135, 245, 0.8)';
      case 'mage':
        return 'rgba(156, 39, 176, 0.8)';
      case 'assassin':
        return 'rgba(244, 67, 54, 0.8)';
      case 'tank':
        return 'rgba(76, 175, 80, 0.8)';
      case 'healer':
        return 'rgba(255, 235, 59, 0.8)';
      default:
        return 'rgba(66, 135, 245, 0.8)';
    }
  };

  return {
    position: 'relative',
    width: 200,
    height: 200,
    borderRadius: '50%',
    border: `4px solid ${getCircleColor()}`,
    boxShadow: `0 0 30px ${getCircleColor()}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    animation: `${pulse} 2s infinite ease-in-out`,
    '&::before': {
      content: '""',
      position: 'absolute',
      width: '90%',
      height: '90%',
      borderRadius: '50%',
      border: `2px solid ${getCircleColor()}`,
      animation: `${rotate} 10s infinite linear`,
    },
    '&::after': {
      content: '""',
      position: 'absolute',
      width: '70%',
      height: '70%',
      borderRadius: '50%',
      border: `1px solid ${getCircleColor()}`,
      animation: `${rotate} 7s infinite linear reverse`,
    },
  };
});

const ShadowIcon = styled(Box)(({ theme, shadowType }) => {
  const getIconContent = () => {
    switch (shadowType) {
      case 'soldier':
        return '⚔️';
      case 'mage':
        return '🔮';
      case 'assassin':
        return '🗡️';
      case 'tank':
        return '🛡️';
      case 'healer':
        return '✨';
      default:
        return '👤';
    }
  };

  return {
    fontSize: '3rem',
    animation: `${float} 3s infinite ease-in-out`,
    '&::after': {
      content: `"${getIconContent()}"`,
    },
  };
});

const ShadowInfo = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(4),
  textAlign: 'center',
  animation: `${fadeIn} 1s ease-in-out`,
  maxWidth: 500,
}));

const SummoningText = styled(Typography)(({ theme }) => ({
  color: '#4287f5',
  textShadow: '0 0 10px rgba(66, 135, 245, 0.7)',
  marginBottom: theme.spacing(2),
}));

const SummoningAnimation = ({ open, onClose, shadowType, shadowName, summonType }) => {
  const [animationStage, setAnimationStage] = useState(1);
  const [showInfo, setShowInfo] = useState(false);

  useEffect(() => {
    if (open) {
      // Reset animation state when opened
      setAnimationStage(1);
      setShowInfo(false);

      // Progress through animation stages
      const stage2Timer = setTimeout(() => setAnimationStage(2), 2000);
      const stage3Timer = setTimeout(() => setAnimationStage(3), 4000);
      const infoTimer = setTimeout(() => setShowInfo(true), 5000);

      return () => {
        clearTimeout(stage2Timer);
        clearTimeout(stage3Timer);
        clearTimeout(infoTimer);
      };
    }
  }, [open]);

  const getShadowTypeInfo = () => {
    switch (shadowType) {
      case 'soldier':
        return {
          title: 'Soldier Shadow',
          description: 'Soldier shadows are balanced fighters with good offensive and defensive capabilities.',
          abilities: [
            'Slash: Deal physical damage to a single target',
            'Battle Cry: Increase attack power of nearby allies',
            'Defensive Stance: Temporarily increase defense'
          ],
          usage: 'Soldiers are versatile shadows that can be placed anywhere in your formation. They excel at both dealing damage and supporting allies.'
        };
      case 'mage':
        return {
          title: 'Mage Shadow',
          description: 'Mage shadows are powerful spellcasters with high magical damage output.',
          abilities: [
            'Arcane Bolt: Deal magical damage to a single target',
            'Frost Nova: Deal area damage and slow enemies',
            'Mana Shield: Create a protective barrier'
          ],
          usage: 'Position mages behind your frontline to maximize their damage potential while keeping them protected from direct attacks.'
        };
      case 'assassin':
        return {
          title: 'Assassin Shadow',
          description: 'Assassin shadows are swift killers with high single-target damage and evasion.',
          abilities: [
            'Backstab: Deal massive damage from stealth',
            'Vanish: Become invisible and increase movement speed',
            'Poison Strike: Apply damage over time'
          ],
          usage: 'Use assassins to quickly eliminate high-priority targets. They excel at flanking maneuvers and surprise attacks.'
        };
      case 'tank':
        return {
          title: 'Tank Shadow',
          description: 'Tank shadows are durable frontline protectors with high defense and health.',
          abilities: [
            'Taunt: Force enemies to attack the tank',
            'Thick Hide: Reduce all incoming damage',
            'Endurance: Recover health over time'
          ],
          usage: 'Place tanks at the front of your formation to absorb damage. They excel at protecting more vulnerable shadows and controlling the battlefield.'
        };
      case 'healer':
        return {
          title: 'Healer Shadow',
          description: 'Healer shadows provide support through healing and protective buffs.',
          abilities: [
            'Healing Touch: Restore health to allies',
            'Protective Aura: Increase defense of nearby shadows',
            'Purify: Remove debuffs from allies'
          ],
          usage: 'Keep healers protected behind your frontline. They can extend the longevity of your shadow army but have limited offensive capabilities.'
        };
      default:
        return {
          title: 'Shadow',
          description: 'A loyal servant in your growing shadow army.',
          abilities: ['Serve the Shadow Monarch'],
          usage: 'This shadow will follow your commands and fight alongside your other shadows.'
        };
    }
  };

  const getSummonTypeBonus = () => {
    switch (summonType) {
      case 'premium':
        return 'Premium summoning grants significantly enhanced stats and rare abilities.';
      case 'advanced':
        return 'Advanced summoning provides improved stats and occasional special abilities.';
      case 'basic':
      default:
        return 'Basic summoning provides standard shadow capabilities.';
    }
  };

  const shadowInfo = getShadowTypeInfo();

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="summoning-animation-title"
      aria-describedby="summoning-animation-description"
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backdropFilter: 'blur(3px)'
      }}
    >
      <Paper 
        sx={{
          width: '90%',
          maxWidth: 800,
          maxHeight: '90vh',
          overflow: 'auto',
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
          border: '1px solid rgba(66, 135, 245, 0.5)',
          boxShadow: '0 0 30px rgba(66, 135, 245, 0.4)',
          borderRadius: 2,
          p: 0
        }}
      >
        <AnimationContainer>
          {animationStage === 1 && (
            <SummoningText variant="h4" gutterBottom>
              Initiating Summoning Ritual...
            </SummoningText>
          )}

          {animationStage === 2 && (
            <SummoningText variant="h4" gutterBottom>
              Extracting Shadow...
            </SummoningText>
          )}

          {animationStage === 3 && (
            <SummoningText variant="h4" gutterBottom>
              Arise, {shadowName}!
            </SummoningText>
          )}

          <SummoningCircle shadowType={shadowType}>
            <ShadowIcon shadowType={shadowType} />
          </SummoningCircle>

          {showInfo && (
            <ShadowInfo>
              <Typography variant="h5" gutterBottom sx={{ color: '#4287f5', fontWeight: 'bold' }}>
                {shadowInfo.title}: {shadowName}
              </Typography>
              
              <Typography variant="body1" paragraph>
                {shadowInfo.description}
              </Typography>
              
              <Typography variant="subtitle1" gutterBottom sx={{ color: '#4287f5', fontWeight: 'bold' }}>
                Abilities:
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                {shadowInfo.abilities.map((ability, index) => (
                  <Typography key={index} variant="body2" paragraph>
                    • {ability}
                  </Typography>
                ))}
              </Box>
              
              <Typography variant="subtitle1" gutterBottom sx={{ color: '#4287f5', fontWeight: 'bold' }}>
                Recommended Usage:
              </Typography>
              
              <Typography variant="body2" paragraph>
                {shadowInfo.usage}
              </Typography>
              
              <Typography variant="subtitle1" gutterBottom sx={{ color: '#4287f5', fontWeight: 'bold', mt: 2 }}>
                Summoning Type Bonus:
              </Typography>
              
              <Typography variant="body2">
                {getSummonTypeBonus()}
              </Typography>
            </ShadowInfo>
          )}
        </AnimationContainer>
      </Paper>
    </Modal>
  );
};

export default SummoningAnimation;
