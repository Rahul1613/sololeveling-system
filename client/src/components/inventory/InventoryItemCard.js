import React from 'react';
import { Card, Button, Badge } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShieldAlt, faFlask, faTrash, faHandHolding, faTshirt, faDumbbell } from '@fortawesome/free-solid-svg-icons';
import './InventoryItemCard.css';

const getTypeIcon = (type) => {
  switch (type) {
    case 'weapon': return <FontAwesomeIcon icon={faDumbbell} className="item-type-icon weapon" />;
    case 'armor': return <FontAwesomeIcon icon={faShieldAlt} className="item-type-icon armor" />;
    case 'consumable': return <FontAwesomeIcon icon={faFlask} className="item-type-icon consumable" />;
    case 'accessory': return <FontAwesomeIcon icon={faTshirt} className="item-type-icon accessory" />;
    default: return <FontAwesomeIcon icon={faHandHolding} className="item-type-icon" />;
  }
};

const InventoryItemCard = ({ item, equipped, onEquip, onUnequip, onUse, onDiscard, onSell }) => {
  return (
    <Card className={`inventory-item-card${equipped ? ' equipped' : ''}`}>  
      <div className="item-image-container">
        <img src={item.image || '/images/items/default-item.png'} alt={item.name} className="item-image" />
        <div className="item-type">
          {getTypeIcon(item.type)} {item.type}
        </div>
        {equipped && <Badge bg="success" className="equipped-badge">Equipped</Badge>}
      </div>
      <Card.Body>
        <Card.Title className="item-name">{item.name}</Card.Title>
        <Card.Text className="item-description">{item.description}</Card.Text>
        <div className="item-actions">
          {item.type === 'weapon' || item.type === 'armor' || item.type === 'accessory' ? (
            equipped ? (
              <Button variant="warning" size="sm" onClick={() => onUnequip(item._id)}>
                Unequip
              </Button>
            ) : (
              <Button variant="primary" size="sm" onClick={() => onEquip(item._id)}>
                Equip
              </Button>
            )
          ) : null}
          {item.type === 'consumable' && (
            <Button variant="success" size="sm" onClick={() => onUse(item._id)}>
              Use
            </Button>
          )}
          <Button variant="secondary" size="sm" onClick={() => onSell(item._id, 1)} style={{marginRight: '4px'}}>
            <FontAwesomeIcon icon={faHandHolding} /> Sell
          </Button>
          <Button variant="danger" size="sm" onClick={() => onDiscard(item._id)}>
            <FontAwesomeIcon icon={faTrash} />
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
};

export default InventoryItemCard;
