import React from 'react';
import { useDispatch } from 'react-redux';
import { unequipSkill } from '../../redux/slices/skillsSlice';
import { motion } from 'framer-motion';
import { Tooltip } from '@mui/material';

const SkillSlot = ({ skill, slotName, isActive, onClick }) => {
  const dispatch = useDispatch();

  const handleUnequip = (e) => {
    e.stopPropagation();
    dispatch(unequipSkill(slotName));
  };

  return (
    <Tooltip 
      title={skill ? 
        <div>
          <h3>{skill.name}</h3>
          <p>{skill.description}</p>
          <p>Level: {skill.level}</p>
          <p>Type: {skill.type}</p>
          <p>Cooldown: {skill.cooldown}s</p>
          {skill.manaCost && <p>Mana Cost: {skill.manaCost}</p>}
          <p className="tooltip-hint">(Right-click to unequip)</p>
        </div> 
        : 
        `Empty ${slotName} slot`
      } 
      arrow
      placement="top"
    >
      <motion.div 
        className={`skill-slot ${slotName} ${isActive ? 'active' : ''} ${skill ? 'filled' : 'empty'}`}
        onClick={onClick}
        onContextMenu={(e) => {
          e.preventDefault();
          if (skill) handleUnequip(e);
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {skill ? (
          <>
            <img 
              src={skill.icon || '/images/skills/default-skill.png'} 
              alt={skill.name} 
              className="skill-icon"
            />
            <div className="skill-level">{skill.level}</div>
            {isActive && <div className="skill-active-indicator"></div>}
          </>
        ) : (
          <div className="empty-slot-icon">+</div>
        )}
      </motion.div>
    </Tooltip>
  );
};

export default SkillSlot;
