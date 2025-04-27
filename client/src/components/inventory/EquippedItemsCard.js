import React from 'react';
import { Card, Badge } from 'react-bootstrap';
import './EquippedItemsCard.css';

const EquippedItemsCard = ({ equipped, slots = ['weapon', 'armor', 'accessory'], onUnequip }) => {
  return (
    <Card className="equipped-items-card">
      <Card.Body>
        <Card.Title>Equipped Items</Card.Title>
        <div className="equipped-slots">
          {slots.map(slot => (
            <div key={slot} className="equipped-slot">
              <div className="slot-label">{slot.charAt(0).toUpperCase() + slot.slice(1)}</div>
              {equipped && equipped[slot] && equipped[slot].item ? (
                <div className="equipped-item">
                  <img src={equipped[slot].item.image || '/images/items/default-item.png'} alt={equipped[slot].item.name} className="equipped-item-image" />
                  <div className="equipped-item-name">{equipped[slot].item.name}</div>
                  <Badge bg="info" className="equipped-slot-badge">{slot}</Badge>
                  <button className="unequip-btn" onClick={() => onUnequip(equipped[slot].item._id)}>Unequip</button>
                </div>
              ) : (
                <div className="empty-slot">None</div>
              )}
            </div>
          ))}
        </div>
      </Card.Body>
    </Card>
  );
};

export default EquippedItemsCard;
