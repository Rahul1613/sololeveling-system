import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import websocketService from '../../utils/websocket';
import { addNotification, markNotificationRead } from '../../redux/slices/notificationSlice';
import NotificationToast from './NotificationToast';
import LevelUpModal from './LevelUpModal';
import QuestCompletedModal from './QuestCompletedModal';
import RankUpModal from './RankUpModal';
import './NotificationSystem.css';

const NotificationSystem = () => {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector(state => state.auth);
  const [showLevelUpModal, setShowLevelUpModal] = useState(false);
  const [showQuestModal, setShowQuestModal] = useState(false);
  const [showRankModal, setShowRankModal] = useState(false);
  const [modalData, setModalData] = useState(null);
  
  // Sound effects
  const soundEffects = {
    level_up: new Audio('/sounds/level_up.mp3'),
    quest_complete: new Audio('/sounds/quest_complete.mp3'),
    rank_up: new Audio('/sounds/rank_up.mp3'),
    achievement: new Audio('/sounds/achievement.mp3'),
    notification: new Audio('/sounds/notification.mp3'),
    penalty: new Audio('/sounds/penalty.mp3')
  };
  
  // Play sound effect
  const playSound = (type) => {
    const sound = soundEffects[type] || soundEffects.notification;
    
    // Reset the audio to the beginning
    sound.currentTime = 0;
    
    // Play the sound
    sound.play().catch(error => {
      console.error('Error playing sound:', error);
    });
  };
  
  // Handle notification
  const handleNotification = (notification) => {
    // Add notification to Redux store
    dispatch(addNotification(notification));
    
    // Mark notification as displayed via WebSocket
    websocketService.markNotificationDisplayed(notification._id);
    
    // Handle different notification types
    switch (notification.type) {
      case 'level_up':
        playSound('level_up');
        setModalData(notification.data);
        setShowLevelUpModal(true);
        break;
        
      case 'quest_completed':
        playSound('quest_complete');
        setModalData(notification.data);
        setShowQuestModal(true);
        break;
        
      case 'rank_up':
        playSound('rank_up');
        setModalData(notification.data);
        setShowRankModal(true);
        break;
        
      case 'achievement_unlocked':
        playSound('achievement');
        toast.info(
          <NotificationToast 
            notification={notification} 
            onClose={() => dispatch(markNotificationRead(notification._id))}
          />, 
          { autoClose: 5000 }
        );
        break;
        
      case 'penalty':
        playSound('penalty');
        toast.error(
          <NotificationToast 
            notification={notification} 
            onClose={() => dispatch(markNotificationRead(notification._id))}
          />, 
          { autoClose: 8000 }
        );
        break;
        
      default:
        // For other notification types
        playSound('notification');
        toast.info(
          <NotificationToast 
            notification={notification} 
            onClose={() => dispatch(markNotificationRead(notification._id))}
          />, 
          { autoClose: 4000 }
        );
    }
  };
  
  // Connect to WebSocket when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      // Connect to WebSocket
      websocketService.connect();
      
      // Add notification listener
      const removeListener = websocketService.addListener('notification', handleNotification);
      
      // Add unread notifications listener
      const removeUnreadListener = websocketService.addListener('unread_notifications', (notifications) => {
        notifications.forEach(handleNotification);
      });
      
      // Cleanup on unmount
      return () => {
        removeListener();
        removeUnreadListener();
      };
    }
  }, [isAuthenticated, dispatch]);
  
  return (
    <>
      {/* Toast container for notifications */}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        className="solo-leveling-notifications"
      />
      
      {/* Modals for special notifications */}
      {showLevelUpModal && modalData && (
        <LevelUpModal
          data={modalData}
          onClose={() => {
            setShowLevelUpModal(false);
            setModalData(null);
          }}
        />
      )}
      
      {showQuestModal && modalData && (
        <QuestCompletedModal
          data={modalData}
          onClose={() => {
            setShowQuestModal(false);
            setModalData(null);
          }}
        />
      )}
      
      {showRankModal && modalData && (
        <RankUpModal
          data={modalData}
          onClose={() => {
            setShowRankModal(false);
            setModalData(null);
          }}
        />
      )}
    </>
  );
};

export default NotificationSystem;
