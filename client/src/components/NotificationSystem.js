import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import NotificationPopup from './NotificationSystem/NotificationPopup';

const NotificationSystem = () => {
  // Get notifications from Redux store
  const notifications = useSelector((state) => state.notifications);

  // Log notifications for debugging
  useEffect(() => {
    if (notifications && notifications.length > 0) {
      console.log('Current notifications:', notifications);
    }
  }, [notifications]);

  return <NotificationPopup />;
};

export default NotificationSystem;
